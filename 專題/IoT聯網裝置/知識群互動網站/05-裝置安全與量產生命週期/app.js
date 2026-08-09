/* global document, localStorage, window */
'use strict';

const SETS = {
  identity: ['identity-unique', 'identity-key-nonexport', 'identity-cert-chain', 'identity-mutual-auth', 'identity-rotation', 'identity-revocation'],
  boot: ['boot-root-key', 'boot-bootloader-signature', 'boot-app-signature', 'boot-antirollback', 'boot-debug-lock', 'boot-fail-closed', 'boot-recovery'],
  update: ['update-authenticity', 'update-integrity', 'update-inactive-slot', 'update-atomic-switch', 'update-health-confirm', 'update-rollback', 'update-staged-rollout', 'update-observability'],
  provisioning: ['provisioning-station-auth', 'provisioning-unique-id', 'provisioning-key-nonexport', 'provisioning-cert-bind', 'provisioning-readback', 'provisioning-quarantine', 'provisioning-audit', 'provisioning-debug-lock'],
  production: ['production-test-points', 'production-fct', 'production-secure-update', 'production-rf-emc', 'production-fixture', 'production-provisioning', 'production-traceability', 'production-change-control'],
  lifecycle: ['lifecycle-identify', 'lifecycle-quarantine', 'lifecycle-revoke', 'lifecycle-rotate', 'lifecycle-patch', 'lifecycle-verify', 'lifecycle-wipe', 'lifecycle-audit']
};
const LABELS = {
  'identity-unique': 'unique identity', 'identity-key-nonexport': 'non-exportable private key', 'identity-cert-chain': 'certificate trust chain', 'identity-mutual-auth': 'mutual authentication', 'identity-rotation': 'rotation', 'identity-revocation': 'revocation',
  'boot-root-key': 'immutable root/key', 'boot-bootloader-signature': 'bootloader signature', 'boot-app-signature': 'application signature', 'boot-antirollback': 'anti-rollback', 'boot-debug-lock': 'debug lock', 'boot-fail-closed': 'fail closed', 'boot-recovery': 'signed recovery',
  'update-authenticity': 'signature authenticity', 'update-integrity': 'integrity/hash', 'update-inactive-slot': 'inactive slot', 'update-atomic-switch': 'atomic switch', 'update-health-confirm': 'boot health confirmation', 'update-rollback': 'rollback', 'update-staged-rollout': 'staged rollout/pause', 'update-observability': 'observability',
  'provisioning-station-auth': 'station authorization', 'provisioning-unique-id': 'unique serial/MAC', 'provisioning-key-nonexport': 'non-exportable key', 'provisioning-cert-bind': 'certificate binding', 'provisioning-readback': 'readback/online challenge', 'provisioning-quarantine': 'failure quarantine', 'provisioning-audit': 'audit trace', 'provisioning-debug-lock': 'debug lock',
  'production-test-points': 'test points/SWD', 'production-fct': 'ICT/FCT', 'production-secure-update': 'secure boot/OTA evidence', 'production-rf-emc': 'RF/EMC prescan', 'production-fixture': 'production fixture', 'production-provisioning': 'provisioning', 'production-traceability': 'traceability', 'production-change-control': 'change control',
  'lifecycle-identify': 'identify scope', 'lifecycle-quarantine': 'quarantine', 'lifecycle-revoke': 'revoke identity', 'lifecycle-rotate': 'rotate affected credentials', 'lifecycle-patch': 'patch', 'lifecycle-verify': 'verify recovery', 'lifecycle-wipe': 'wipe local data', 'lifecycle-audit': 'retain audit evidence'
};
const valid = (value, values) => typeof value === 'string' && values.includes(value);
const objectInput = input => input && typeof input === 'object' ? input : {};
const checks = (input, ids) => ids.every(id => typeof input === 'object' && typeof input[id] === 'boolean');
const checked = (input, ids) => ids.filter(id => input[id]).length;
const gate = (input, ids, required, feedback) => {
  if (!checks(input, ids)) return { valid: false };
  const missing = ids.filter(id => required.includes(id) && !input[id]);
  return { valid: true, first: missing[0] ? LABELS[missing[0]] : 'none', second: missing[1] ? LABELS[missing[1]] : 'none', count: checked(input, ids), blocker: missing[0] ? LABELS[missing[0]] : 'none', status: missing.length ? '⛔ 阻擋' : '✓ 通過', feedback: missing.length ? `第一缺口：${LABELS[missing[0]]}。${feedback}` : `Gate 通過。${feedback}` };
};

function calculateThreatModel(input = {}) {
  input = objectInput(input);
  const { vector, impact, scale, update } = input;
  if (!valid(vector, ['remote', 'physical', 'supply-chain']) || !valid(impact, ['data', 'control', 'safety']) || !valid(scale, ['single', 'fleet']) || !valid(update, ['available', 'none'])) return { valid: false };
  let first, second;
  if (update === 'none') [first, second] = ['可維護性', '更新與修復流程'];
  else if (vector === 'supply-chain') [first, second] = ['簽章 artifact／信任根', 'station 授權與 audit'];
  else if (vector === 'physical') [first, second] = ['不可匯出金鑰', 'secure boot／debug lock'];
  else if (scale === 'fleet') [first, second] = ['每裝置身分／雙向認證', '撤銷／隔離／簽章 OTA'];
  else [first, second] = ['TLS 身分驗證', '最小權限與更新'];
  const priority = impact === 'safety' ? '高影響' : '一般影響';
  const feedback = `初篩警告：${impact === 'safety' ? '要求 safe state 與故障證據。' : ''}結果不表示已完成 threat model。`;
  return { valid: true, priority, firstControl: first, secondControl: second, status: '⚠ 初篩警告', feedback };
}

function calculateDeviceIdentity(input = {}) {
  input = objectInput(input);
  return gate(input.checks, SETS.identity, SETS.identity, '通過只代表身分生命週期設計有基本閉環；仍需 KMS/HSM、憑證政策、後端授權與實機驗證。');
}
function calculateSecureBoot(input = {}) {
  input = objectInput(input);
  if (!valid(input.case, ['normal', 'tampered-image', 'downgrade', 'debug-attach'])) return { valid: false };
  const required = ['boot-root-key', 'boot-bootloader-signature', 'boot-app-signature', 'boot-fail-closed', 'boot-recovery'];
  if (input.case === 'downgrade') required.push('boot-antirollback');
  if (input.case === 'debug-attach') required.push('boot-debug-lock');
  return gate(input.checks, SETS.boot, required, 'CRC 只能檢查意外損壞，不能替代數位簽章的真實性；debug lock 不可阻斷授權 recovery。');
}
function calculateOtaBudget(input = {}) {
  input = objectInput(input);
  const names = ['flash', 'boot', 'image', 'slots', 'scratch', 'config', 'rate', 'deliveryFactor'];
  if (names.some(name => typeof input[name] !== 'number' || !Number.isFinite(input[name])) || input.flash <= 0 || input.boot < 0 || input.image <= 0 || input.slots < 1 || !Number.isInteger(input.slots) || input.scratch < 0 || input.config < 0 || input.rate <= 0 || input.deliveryFactor < 1) return { valid: false };
  const required = input.boot + input.image * input.slots + input.scratch + input.config;
  const headroom = input.flash - required;
  const transfer = input.image * input.deliveryFactor;
  const seconds = transfer / input.rate;
  const blocked = headroom < 0;
  return { valid: true, required, headroom, transfer, transferSeconds: seconds, verdict: blocked ? '容量不足' : input.slots < 2 ? '警告：沒有 A/B rollback' : '容量通過', status: blocked ? '⛔ 阻擋' : input.slots < 2 ? '⚠ 警告' : '✓ 通過', feedback: blocked ? '容量不足，無法配置所需映像與保留空間。' : `${input.slots < 2 ? '警告：沒有 A/B rollback。' : ''}教學預算不含檔案系統、對齊、delta update、TLS/協定 overhead、斷點續傳、flash wear 與真實網路功耗。` };
}
function calculateUpdateRecovery(input = {}) {
  input = objectInput(input);
  const required = { 'power-loss': SETS.update.slice(0, 6), 'signature-fail': ['update-authenticity', 'update-integrity', 'update-observability'], 'first-boot-fail': ['update-inactive-slot', 'update-atomic-switch', 'update-health-confirm', 'update-rollback', 'update-observability'], 'fleet-regression': ['update-health-confirm', 'update-rollback', 'update-staged-rollout', 'update-observability'] };
  if (!valid(input.case, Object.keys(required))) return { valid: false };
  return gate(input.checks, SETS.update, required[input.case], 'Gate 通過不表示韌體沒有漏洞，只表示失敗處理路徑完整。');
}
function calculateProvisioningLine(input = {}) {
  input = objectInput(input);
  const required = ['new-device', 'rework'].includes(input.case) ? SETS.provisioning : SETS.provisioning.slice(0, 7);
  if (!valid(input.case, ['new-device', 'rework', 'certificate-rotation'])) return { valid: false };
  return gate(input.checks, SETS.provisioning, required, `Provisioning 失敗品不得流入下一站；log 不可保存可重建 private key 的明文秘密。${input.case === 'certificate-rotation' ? '不得解鎖已鎖裝置。' : ''}`);
}
function calculateProductionGate(input = {}) {
  input = objectInput(input);
  const lengths = { EVT: 2, DVT: 4, PVT: 7, MP: 8 };
  if (!Object.prototype.hasOwnProperty.call(lengths, input.stage)) return { valid: false };
  return gate(input.checks, SETS.production, SETS.production.slice(0, lengths[input.stage]), '通過只是該階段的學習 gate，不等於良率達標、認證完成或可直接出貨。');
}
function calculateFleetLifecycle(input = {}) {
  input = objectInput(input);
  const required = { compromised: ['lifecycle-identify', 'lifecycle-quarantine', 'lifecycle-revoke', 'lifecycle-rotate', 'lifecycle-patch', 'lifecycle-verify', 'lifecycle-audit'], 'certificate-expired': ['lifecycle-identify', 'lifecycle-rotate', 'lifecycle-verify', 'lifecycle-audit'], 'lost-device': ['lifecycle-identify', 'lifecycle-quarantine', 'lifecycle-revoke', 'lifecycle-audit'], retire: ['lifecycle-identify', 'lifecycle-revoke', 'lifecycle-wipe', 'lifecycle-audit'] };
  if (!valid(input.case, Object.keys(required))) return { valid: false };
  return gate(input.checks, SETS.lifecycle, required[input.case], '退役要同時處理後端身分與裝置資料；恢復服務前要驗證，不能只看 OTA 任務成功。');
}

const CALCULATORS = {
  'threat-model': calculateThreatModel,
  'device-identity': calculateDeviceIdentity,
  'secure-boot': calculateSecureBoot,
  'ota-budget': calculateOtaBudget,
  'update-recovery': calculateUpdateRecovery,
  'provisioning-line': calculateProvisioningLine,
  'production-gate': calculateProductionGate,
  'fleet-lifecycle': calculateFleetLifecycle
};

const OUTPUTS = {
  'threat-model': {
    'threat-priority': 'priority',
    'threat-first-control': 'firstControl',
    'threat-second-control': 'secondControl',
    'threat-status': 'status',
    'threat-feedback': 'feedback'
  },
  'device-identity': gateOutputs('identity'),
  'secure-boot': gateOutputs('boot'),
  'ota-budget': {
    'ota-required-kib': 'required',
    'ota-headroom-kib': 'headroom',
    'ota-transfer-kib': 'transfer',
    'ota-transfer-seconds': 'transferSeconds',
    'ota-verdict': 'verdict',
    'ota-status': 'status',
    'ota-feedback': 'feedback'
  },
  'update-recovery': gateOutputs('update'),
  'provisioning-line': gateOutputs('provisioning'),
  'production-gate': gateOutputs('production'),
  'fleet-lifecycle': gateOutputs('lifecycle')
};

function gateOutputs(prefix) {
  return Object.fromEntries(
    ['first', 'second', 'count', 'blocker', 'status', 'feedback']
      .map(property => [`${prefix}-${property}`, property])
  );
}

function init(root = document) {
  const storageKey = 'engineerStudy.iotSecurityProduction.v1';
  const modules = [...root.querySelectorAll('[data-module]')];

  function read(module) {
    const values = {};
    module.querySelectorAll('select, input').forEach(element => {
      values[element.id] = element.type === 'checkbox'
        ? element.checked
        : element.type === 'number'
          ? (element.value === '' ? NaN : Number(element.value))
          : element.value;
    });
    return values;
  }

  function valuesFor(module) {
    const key = module.dataset.module;
    const values = read(module);
    if (key === 'threat-model') {
      return {
        vector: values['threat-vector'],
        impact: values['threat-impact'],
        scale: values['threat-scale'],
        update: values['threat-update']
      };
    }
    if (key === 'ota-budget') {
      return {
        flash: values['ota-flash-kib'],
        boot: values['ota-boot-kib'],
        image: values['ota-image-kib'],
        slots: values['ota-slots'],
        scratch: values['ota-scratch-kib'],
        config: values['ota-config-kib'],
        rate: values['ota-rate-kib-s'],
        deliveryFactor: values['ota-delivery-factor']
      };
    }

    const setName = {
      'device-identity': 'identity',
      'secure-boot': 'boot',
      'update-recovery': 'update',
      'provisioning-line': 'provisioning',
      'production-gate': 'production',
      'fleet-lifecycle': 'lifecycle'
    }[key];
    const select = module.querySelector('select');
    return {
      case: select ? select.value : undefined,
      stage: select ? select.value : undefined,
      checks: Object.fromEntries(
        SETS[setName].map(id => [id, !!module.querySelector(`#${id}`)?.checked])
      )
    };
  }

  function formatOutput(id, value) {
    if (typeof value !== 'number') return value;
    const formatted = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 2 }).format(value);
    if (id === 'ota-transfer-seconds') return `${formatted} s`;
    if (id.startsWith('ota-')) return `${formatted} KiB`;
    return formatted;
  }

  function render(module, result) {
    const outputMap = OUTPUTS[module.dataset.module];
    Object.entries(outputMap).forEach(([id, property]) => {
      const output = module.querySelector(`#${id}`);
      if (output) output.textContent = result.valid === false ? '' : formatOutput(id, result[property] ?? '');
    });

    const panel = module.querySelector('.results');
    if (!panel) return;
    panel.classList.remove('is-pass', 'is-warning', 'is-blocked', 'is-invalid');
    if (result.valid === false) panel.classList.add('is-invalid');
    else if (String(result.status).includes('阻擋')) panel.classList.add('is-blocked');
    else if (String(result.status).includes('警告')) panel.classList.add('is-warning');
    else if (String(result.status).includes('通過')) panel.classList.add('is-pass');
  }

  function update(module) {
    const result = CALCULATORS[module.dataset.module](valuesFor(module));
    render(module, result);
    return result;
  }

  function setComplete(module, complete) {
    const control = module.querySelector('[data-complete]');
    if (!control) return;
    control.classList.toggle('is-complete', complete);
    control.setAttribute('aria-pressed', String(complete));
    control.textContent = complete ? '已完成' : '標記完成';
  }

  function isComplete(module) {
    return module.querySelector('[data-complete]')?.getAttribute('aria-pressed') === 'true';
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function save() {
    const done = Object.fromEntries(modules.map(module => [module.dataset.module, isComplete(module)]));
    try {
      localStorage.setItem(storageKey, JSON.stringify(done));
    } catch (_) {}

    const count = Object.values(done).filter(Boolean).length;
    const label = root.querySelector('#progress-label');
    if (label) label.textContent = `已完成 ${count} / ${modules.length} 個模組`;
    const fill = root.querySelector('#progress-fill');
    if (fill) fill.style.width = `${modules.length ? count / modules.length * 100 : 0}%`;
    const track = root.querySelector('.progress-track');
    if (track) track.setAttribute('aria-valuenow', String(count));
  }

  const savedProgress = readProgress();
  modules.forEach(module => {
    setComplete(module, savedProgress[module.dataset.module] === true);
    module.querySelectorAll('select, input').forEach(element => {
      element.addEventListener('input', () => update(module));
      element.addEventListener('change', () => update(module));
    });
    module.querySelector('[data-reset-module]')?.addEventListener('click', () => {
      module.querySelector('form')?.reset();
      update(module);
    });
    module.querySelector('[data-complete]')?.addEventListener('click', () => {
      setComplete(module, !isComplete(module));
      save();
    });
    update(module);
  });

  const navLinks = [...root.querySelectorAll('[data-nav]')];
  navLinks.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    navLinks.forEach(item => item.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'page');
    const reduceMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    root.querySelector(`[data-module="${link.dataset.nav}"]`)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }));
  if (navLinks[0]) navLinks[0].setAttribute('aria-current', 'page');

  root.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', event => event.preventDefault());
  });
  root.querySelector('#reset-progress')?.addEventListener('click', () => {
    modules.forEach(module => setComplete(module, false));
    save();
  });

  save();
  return { update };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { calculateThreatModel, calculateDeviceIdentity, calculateSecureBoot, calculateOtaBudget, calculateUpdateRecovery, calculateProvisioningLine, calculateProductionGate, calculateFleetLifecycle, init };
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => init());
