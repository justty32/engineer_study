#!/usr/bin/env python3
"""補組已驗收的聽課主線；只複製成品與實際引用、Git 已追蹤的 MP3。"""

import argparse
from collections import Counter
import html
from html.parser import HTMLParser
import os
from pathlib import Path
import re
import shutil
import subprocess
from urllib.parse import quote, unquote, urlsplit, urlunsplit


WEB_SUFFIXES = {".html", ".css", ".js"}
EXPECTED = {"circuit-analysis": 7, "electronics": 8, "electromagnetics": 8}
ATTR = re.compile(r"(?P<head>\b(?:href|src)\s*=\s*)(?P<q>[\"'])(?P<url>.*?)(?P=q)")
MP3_SRC = re.compile(r"[\"']src[\"']\s*:\s*[\"']([^\"']+\.mp3)[\"']")


class References(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.urls = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.urls.extend(value for key, value in attrs if key in {"href", "src"} and value)


def read(path):
    return path.read_bytes().decode("utf-8")


def web_files(directory):
    return sorted(p for p in directory.iterdir()
                  if p.is_file() and not p.is_symlink() and not p.name.startswith(".")
                  and p.suffix in WEB_SUFFIXES)


def assemble(repo, site):
    if site == repo or repo.is_relative_to(site):
        raise ValueError("產物目錄不可為儲存庫或其上層")
    if not (site / "index.html").is_file():
        raise ValueError("先執行 pages.yml 的既有組站步驟，再補組聽課")

    # 沿用唯一課程表，不複製另一份 slug 設定。
    workflow = read(repo / ".github/workflows/pages.yml").replace("\r\n", "\n")
    table = workflow.split("done <<'COURSES'\n", 1)[1].split("\n          COURSES", 1)[0]
    roots = {}
    files = {}
    for row in table.splitlines():
        source, slug = row.strip().split("|", 1)
        source = (repo / source).resolve()
        roots[source] = Path(slug)
        for path in web_files(source):
            files[path] = Path(slug) / path.name
    for name in ("index.html", "styles.css"):
        files[(repo / "互動學習網站" / name).resolve()] = Path(name)

    overview = (repo / "電機/02-電機核心/聽課總覽.html").resolve()
    files[overview] = Path("listening/index.html")
    lessons = {}
    for url in References(read(overview)).urls:
        parts = urlsplit(url)
        if parts.scheme or parts.netloc:
            continue
        relative = Path(unquote(parts.path))
        if len(relative.parts) != 3 or relative.name != "index.html":
            continue
        if not relative.parent.name.startswith("聽課-"):
            continue
        directory = (overview.parent / relative.parent).resolve()
        parent_slug = roots.get(directory.parent)
        if parent_slug is None or str(parent_slug) not in EXPECTED:
            raise ValueError(f"總覽指向未登記的聽課來源：{url}")
        lessons[directory] = parent_slug / directory.name
    counts = Counter(str(public.parent) for public in lessons.values())
    if dict(counts) != EXPECTED:
        raise ValueError(f"聽課範圍應為 7+8+8=23 門，實際 {dict(counts)}")

    publish = {overview}
    audio = set()
    tracked = set(subprocess.check_output(
        ["git", "-C", str(repo), "ls-files", "-z", "--", "*.mp3"]
    ).decode("utf-8").split("\0"))
    for directory, public in lessons.items():
        for required in ("index.html", "audio-course.css", "audio-course.js",
                         "lesson-data.js", "audio-manifest.js", "驗收紀錄.md"):
            if not (directory / required).is_file():
                raise ValueError(f"聽課必要檔缺失：{directory / required}")
        assets = web_files(directory)
        references = MP3_SRC.findall(read(directory / "audio-manifest.js"))
        for source in assets:
            publish.add(source)
            files[source] = public / source.name
            if source.suffix == ".html":
                references.extend(url for url in References(read(source)).urls
                                  if urlsplit(url).path.endswith(".mp3"))
        for url in references:
            parts = urlsplit(url)
            relative = Path(unquote(parts.path))
            if (parts.scheme or parts.netloc or len(relative.parts) != 2
                    or relative.parts[0] != "audio" or relative.suffix != ".mp3"
                    or relative.name.startswith(".")):
                raise ValueError(f"音訊不在課內 audio/ 白名單：{url}")
            source = directory / relative
            if source.is_symlink() or source.resolve() != source:
                raise ValueError(f"音訊不可經由符號連結：{source}")
            if source.relative_to(repo).as_posix() not in tracked:
                raise ValueError(f"引用音訊未經 Git 追蹤：{source}")
            with source.open("rb") as stream:
                header = stream.read(128)
            if len(header) < 128 or header.startswith(b"version https://git-lfs.github.com/spec/"):
                raise ValueError(f"音訊缺失或仍為 LFS 指標：{source}")
            publish.add(source)
            audio.add(source)
            files[source] = public / relative

    def rewrite(source, text):
        def attribute(match):
            url = html.unescape(match["url"])
            parts = urlsplit(url)
            if parts.scheme or parts.netloc or not parts.path:
                return match[0]
            target = (source.parent / unquote(parts.path)).resolve()
            if target.is_dir():
                target /= "index.html"
            if target.suffix == ".md" and target.is_file() and target.is_relative_to(repo):
                # 原筆記不進 Pages；唯有來源連結改到 GitHub 檔案頁。
                path = quote(target.relative_to(repo).as_posix())
                rewritten = f"https://github.com/justty32/engineer_study/blob/main/{path}"
                if parts.fragment:
                    rewritten += "#" + parts.fragment
            elif target in files:
                path = Path(os.path.relpath(files[target], files[source].parent)).as_posix()
                rewritten = urlunsplit(("", "", path, parts.query, parts.fragment))
            else:
                raise ValueError(f"聽課引用未發布的資源：{source}: {url}")
            return match["head"] + match["q"] + html.escape(rewritten, quote=True) + match["q"]
        return ATTR.sub(attribute, text)

    for source in sorted(publish):
        destination = site / files[source]
        destination.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix == ".html":
            destination.write_bytes(rewrite(source, read(source)).encode("utf-8"))
        else:
            shutil.copyfile(source, destination)

    # 原課內聽課子目錄連結毋須變動；只補三父課頁指向總覽的接線。
    for slug in EXPECTED:
        index = site / slug / "index.html"
        text = read(index).replace('href="../聽課總覽.html"', 'href="../listening/index.html"')
        index.write_bytes(text.encode("utf-8"))
    print(f"聽課發布：{len(lessons)} 門＋總覽，{len(publish)} 個成品；"
          f"MP3 {len(audio)} 個／{sum(p.stat().st_size for p in audio)} bytes")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--site", type=Path, required=True)
    args = parser.parse_args()
    assemble(args.repo.resolve(), args.site.resolve())
