// password-generator.js
// Handles UI interactions and password generation using crypto.getRandomValues

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
});
// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

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
const outputBox = document.getElementById('password-output');
const strengthMeter = document.getElementById('strength-meter');
const strengthLabel = document.getElementById('strength-label');
const entropyValue = document.getElementById('entropy-value');

let lastPassword = '';

// Update length display
lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
});

function getCharSet() {
  const sets = [];
  const similar = 'Il1O0';
  const ambiguous = '{}[]()/\\\'"`~,;:.<>'; // characters often ambiguous
  if (uppercase.checked) {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (excludeSimilar.checked) chars = chars.replace(/[IL]/g, '');
    sets.push(chars);
  }
  if (lowercase.checked) {
    let chars = 'abcdefghijklmnopqrstuvwxyz';
    if (excludeSimilar.checked) chars = chars.replace(/[il]/g, '');
    sets.push(chars);
  }
  if (numbers.checked) {
    let chars = '0123456789';
    if (excludeSimilar.checked) chars = chars.replace(/[01]/g, '');
    sets.push(chars);
  }
  if (symbols.checked) {
    let chars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if (excludeAmbiguous.checked) {
      chars = chars.replace(/[\[\]{}()\\/\'\"`~,;:.<>]/g, '');
    }
    sets.push(chars);
  }
  return sets;
}

function getRandomChar(pool) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const index = array[0] % pool.length;
  return pool.charAt(index);
}

function generatePassword() {
  const length = parseInt(lengthSlider.value, 10);
  const charSets = getCharSet();
  if (charSets.length === 0) return '';
  let password = '';
  const maxAttempts = length * 5; // safeguard
  let attempts = 0;
  while (password.length < length && attempts < maxAttempts) {
    const set = charSets[Math.floor(Math.random() * charSets.length)];
    const char = getRandomChar(set);
    if (noRepeats.checked && password.includes(char)) {
      attempts++;
      continue;
    }
    if (noSequences.checked && password.length >= 2) {
      const prev = password.charCodeAt(password.length - 1);
      const prev2 = password.charCodeAt(password.length - 2);
      if (char.charCodeAt(0) === prev + 1 && prev === prev2 + 1) {
        attempts++;
        continue;
      }
    }
    password += char;
  }
  // Apply prefix/suffix
  const prefix = prefixInput.value || '';
  const suffix = suffixInput.value || '';
  return prefix + password + suffix;
}

function calculateEntropy(password) {
  // Estimate based on pool size and length
  const poolSize = (uppercase.checked ? 26 : 0) +
    (lowercase.checked ? 26 : 0) +
    (numbers.checked ? 10 : 0) +
    (symbols.checked ? 32 : 0); // approximate symbol count
  const effectiveLength = password.length;
  const entropy = Math.log2(Math.pow(poolSize, effectiveLength));
  return entropy;
}

function updateStrength(password) {
  const entropy = calculateEntropy(password);
  entropyValue.textContent = `Entropy: ${entropy.toFixed(2)} bits`;
  let strength = 'Weak';
  let meterValue = 20;
  if (entropy > 60) { strength = 'Very Strong'; meterValue = 100; }
  else if (entropy > 45) { strength = 'Strong'; meterValue = 80; }
  else if (entropy > 30) { strength = 'Medium'; meterValue = 50; }
  else { strength = 'Weak'; meterValue = 20; }
  strengthLabel.textContent = `Strength: ${strength}`;
  strengthMeter.value = meterValue;
}

function displayPassword(pwd) {
  outputBox.textContent = pwd;
  outputBox.focus();
  copyBtn.disabled = false;
  regenerateBtn.disabled = false;
  updateStrength(pwd);
}

generateBtn.addEventListener('click', () => {
  const pwd = generatePassword();
  lastPassword = pwd;
  displayPassword(pwd);
});

regenerateBtn.addEventListener('click', () => {
  if (!lastPassword) return;
  const pwd = generatePassword();
  lastPassword = pwd;
  displayPassword(pwd);
});

copyBtn.addEventListener('click', async () => {
  const pwd = outputBox.textContent;
  try {
    await navigator.clipboard.writeText(pwd);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
  } catch (e) {
    console.error('Copy failed', e);
  }
});

multipleBtn.addEventListener('click', () => {
  const count = prompt('How many passwords?', '5');
  const n = parseInt(count, 10);
  if (isNaN(n) || n <= 0) return;
  const passwords = [];
  for (let i = 0; i < n; i++) {
    passwords.push(generatePassword());
  }
  alert('Generated passwords:\n' + passwords.join('\n'));
});

// Tab navigation for additional generators
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

tabLinks.forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.tab;
    tabLinks.forEach(l => l.classList.toggle('active', l === link));
    tabContents.forEach(c => {
      c.style.display = c.id === target ? 'block' : 'none';
    });
  });
});

// Initialize display values
lengthValue.textContent = lengthSlider.value;
