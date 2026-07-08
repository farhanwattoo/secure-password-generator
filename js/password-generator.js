// password-generator.js
// メインのパスワード生成ロジック。乱数はすべて Web Crypto API（剰余バイアスなし）を使用。

document.addEventListener('DOMContentLoaded', () => {
  const U = window.SiteUtils;

  // UI Elements
  const lengthSlider = document.getElementById('length');
  const lengthValue = document.getElementById('length-value');
  const uppercase = document.getElementById('uppercase');
  const lowercase = document.getElementById('lowercase');
  const numbers = document.getElementById('numbers');
  const symbols = document.getElementById('symbols');
  const excludeSimilar = document.getElementById('exclude-similar');
  const excludeAmbiguous = document.getElementById('exclude-ambiguous');
  const noRepeats = document.getElementById('no-repeats');
  const noSequences = document.getElementById('no-sequences');
  const prefixInput = document.getElementById('prefix');
  const suffixInput = document.getElementById('suffix');
  const generateBtn = document.getElementById('generate-btn');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const multipleBtn = document.getElementById('multiple-btn');
  const multipleCount = document.getElementById('multiple-count');
  const multiOutput = document.getElementById('multi-output');
  const outputBox = document.getElementById('password-output');
  const strengthBar = document.getElementById('strength-bar');
  const strengthFill = document.getElementById('strength-fill');
  const strengthLabel = document.getElementById('strength-label');
  const entropyValue = document.getElementById('entropy-value');
  const generatorNote = document.getElementById('generator-note');

  let lastPassword = '';

  lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
  });

  const SIMILAR_UPPER = /[IO]/g;   // 1/l と紛らわしい I、0 と紛らわしい O
  const SIMILAR_LOWER = /[ilo]/g;  // 1/I と紛らわしい i・l、0 と紛らわしい o
  const SIMILAR_DIGIT = /[01]/g;
  const AMBIGUOUS = /[\[\]{}()\\/'"`~,;:.<>|]/g;

  function getCharSets() {
    const sets = [];
    if (uppercase.checked) {
      let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (excludeSimilar.checked) chars = chars.replace(SIMILAR_UPPER, '');
      sets.push(chars);
    }
    if (lowercase.checked) {
      let chars = 'abcdefghijklmnopqrstuvwxyz';
      if (excludeSimilar.checked) chars = chars.replace(SIMILAR_LOWER, '');
      sets.push(chars);
    }
    if (numbers.checked) {
      let chars = '0123456789';
      if (excludeSimilar.checked) chars = chars.replace(SIMILAR_DIGIT, '');
      sets.push(chars);
    }
    if (symbols.checked) {
      let chars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
      if (excludeAmbiguous.checked) chars = chars.replace(AMBIGUOUS, '');
      sets.push(chars);
    }
    return sets;
  }

  function showNote(message) {
    generatorNote.textContent = message;
    generatorNote.hidden = !message;
  }

  function isSequence(code, prevCode, prev2Code) {
    return (code === prevCode + 1 && prevCode === prev2Code + 1) ||
      (code === prevCode - 1 && prevCode === prev2Code - 1);
  }

  // 制約（繰り返し禁止・連続禁止）を満たす文字を候補プールから選ぶ
  function pickChar(source, chars, index) {
    for (let attempts = 0; attempts < 50; attempts++) {
      const char = U.secureRandomChar(source);
      if (noRepeats.checked && chars.includes(char)) continue;
      if (noSequences.checked && index >= 2) {
        const code = char.charCodeAt(0);
        if (isSequence(code, chars[index - 1].charCodeAt(0), chars[index - 2].charCodeAt(0))) continue;
      }
      return char;
    }
    // 稀に候補が尽きた場合は、制約を満たす残りの文字から確実に選ぶ
    let candidates = [...new Set(source)];
    if (noRepeats.checked) candidates = candidates.filter(c => !chars.includes(c));
    if (noSequences.checked && index >= 2) {
      const prev = chars[index - 1].charCodeAt(0);
      const prev2 = chars[index - 2].charCodeAt(0);
      const nonSeq = candidates.filter(c => !isSequence(c.charCodeAt(0), prev, prev2));
      if (nonSeq.length > 0) candidates = nonSeq;
    }
    if (candidates.length === 0) candidates = [...new Set(source)];
    return candidates[U.secureRandomInt(candidates.length)];
  }

  function generatePassword() {
    showNote('');
    const charSets = getCharSets();
    if (charSets.length === 0) {
      showNote('文字の種類を少なくとも1つ選択してください。');
      return null;
    }

    let length = parseInt(lengthSlider.value, 10);
    const pool = charSets.join('');

    // 「繰り返しを避ける」有効時は、プールのユニーク文字数を超える長さは作れない
    if (noRepeats.checked) {
      const uniqueCount = new Set(pool).size;
      if (length > uniqueCount) {
        length = uniqueCount;
        showNote(`「文字の繰り返しを避ける」が有効なため、長さを ${uniqueCount} 文字に調整しました。`);
      }
    }

    // 選択された各文字種を最低1文字含めることを保証する。
    // どの位置にどの文字種を割り当てるかを事前にシャッフルして決める。
    const plan = new Array(length).fill(null);
    charSets.slice(0, length).forEach((set, i) => { plan[i] = set; });
    U.secureShuffle(plan);

    const chars = [];
    for (let i = 0; i < length; i++) {
      chars.push(pickChar(plan[i] || pool, chars, i));
    }

    const prefix = prefixInput.value || '';
    const suffix = suffixInput.value || '';
    return prefix + chars.join('') + suffix;
  }

  // 実際に使用したプールサイズと生成部分の長さからエントロピーを算出
  // （プレフィックス／サフィックスは固定文字列のためエントロピーには加算しない）
  function calculateEntropy(coreLength) {
    const poolSize = getCharSets().join('').length;
    if (poolSize <= 1 || coreLength <= 0) return 0;
    return coreLength * Math.log2(poolSize);
  }

  function updateStrength(password) {
    const coreLength = password.length - (prefixInput.value || '').length - (suffixInput.value || '').length;
    const entropy = calculateEntropy(coreLength);
    entropyValue.textContent = `エントロピー: ${entropy.toFixed(1)} bits`;

    let label, cls, meterValue;
    if (entropy >= 80) { label = '非常に強い'; cls = 'very-strong'; meterValue = 100; }
    else if (entropy >= 60) { label = '強い'; cls = 'strong'; meterValue = 75; }
    else if (entropy >= 40) { label = '普通'; cls = 'fair'; meterValue = 50; }
    else { label = '弱い'; cls = 'weak'; meterValue = 25; }

    strengthLabel.textContent = `強度: ${label}`;
    strengthFill.className = `strength-fill ${cls}`;
    strengthFill.style.width = `${meterValue}%`;
    strengthBar.setAttribute('aria-valuenow', String(meterValue));
  }

  function displayPassword(pwd) {
    outputBox.textContent = pwd;
    outputBox.classList.remove('placeholder');
    copyBtn.disabled = false;
    regenerateBtn.disabled = false;
    updateStrength(pwd);
  }

  function runGenerate() {
    const pwd = generatePassword();
    if (pwd === null) return;
    lastPassword = pwd;
    displayPassword(pwd);
  }

  generateBtn.addEventListener('click', runGenerate);
  regenerateBtn.addEventListener('click', runGenerate);

  U.bindCopyButton(copyBtn, () => lastPassword);

  // 複数生成: prompt/alert ではなくページ内にリスト表示する
  multipleBtn.addEventListener('click', () => {
    const n = Math.min(50, Math.max(1, parseInt(multipleCount.value, 10) || 5));
    multiOutput.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const pwd = generatePassword();
      if (pwd === null) return;
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = pwd;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'secondary';
      btn.textContent = 'コピー';
      U.bindCopyButton(btn, () => pwd);
      li.appendChild(span);
      li.appendChild(btn);
      multiOutput.appendChild(li);
    }
    multiOutput.classList.add('visible');
  });

  lengthValue.textContent = lengthSlider.value;
});
