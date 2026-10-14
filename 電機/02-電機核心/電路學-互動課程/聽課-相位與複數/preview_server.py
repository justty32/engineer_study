#!/usr/bin/env python3
"""本機課程預覽：固定專案根目錄，提供音檔單一 Range 與拖曳播放。"""

import argparse
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

REPO_ROOT = Path(__file__).resolve().parents[4]


class PreviewHandler(SimpleHTTPRequestHandler):
    """只讀取 REPO_ROOT 內的檔案；GET 與 HEAD 共用正確的長度資訊。"""

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def _resolve_file(self):
        try:
            requested = unquote(urlsplit(self.path).path, errors="strict")
            path = (REPO_ROOT / requested.lstrip("/")).resolve()
            path.relative_to(REPO_ROOT)
            if path.is_dir():
                # 不列出資料夾；也檢查 index 本身是否為指向專案外的連結。
                path = (path / "index.html").resolve()
                path.relative_to(REPO_ROOT)
            if not path.is_file():
                self.send_error(404, "File not found")
                return None
            return path
        except (ValueError, UnicodeError, RuntimeError):
            self.send_error(403, "Path outside project or invalid path")
        except OSError:
            self.send_error(404, "File not found")
        return None

    def _range_error(self, size):
        self.send_response(416)
        self.send_header("Content-Range", f"bytes */{size}")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def send_head(self):
        self.range_remaining = 0
        path = self._resolve_file()
        if path is None:
            return None
        try:
            source = path.open("rb")
        except OSError:
            self.send_error(404, "File not found")
            return None
        stat = os.fstat(source.fileno())
        size = stat.st_size
        start, end = 0, size - 1
        header = self.headers.get("Range")
        if header is not None:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", header.strip())
            if not match or not any(match.groups()) or not size:
                source.close()
                self._range_error(size)
                return None
            first, last = match.groups()
            try:
                if first:
                    start = int(first)
                    end = min(int(last), size - 1) if last else size - 1
                else:
                    suffix = int(last)
                    start = max(0, size - suffix)
            except ValueError:
                source.close()
                self._range_error(size)
                return None
            if start >= size or end < start:
                source.close()
                self._range_error(size)
                return None
        self.range_remaining = max(0, end - start + 1)
        source.seek(start)
        self.send_response(206 if header is not None else 200)
        self.send_header("Content-Type", self.guess_type(str(path)))
        self.send_header("Content-Length", str(self.range_remaining))
        self.send_header("Last-Modified", self.date_time_string(stat.st_mtime))
        if header is not None:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        return source

    def copyfile(self, source, outputfile):
        remaining = self.range_remaining
        try:
            while remaining:
                chunk = source.read(min(remaining, 65536))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            # 拖曳會取消前一個讀取請求，屬於正常的播放器行為。
            pass


def port_number(value):
    try:
        number = int(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError("port 必須是整數") from error
    if not 1 <= number <= 65535:
        raise argparse.ArgumentTypeError("port 必須介於 1 與 65535")
    return number


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=port_number, default=8876)
    args = parser.parse_args()
    with ThreadingHTTPServer(("127.0.0.1", args.port), PreviewHandler) as server:
        course = Path(__file__).resolve().parent.relative_to(REPO_ROOT)
        print(f"預覽：http://127.0.0.1:{args.port}/{quote(course.as_posix())}/index.html", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
