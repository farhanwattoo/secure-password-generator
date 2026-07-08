// extra-generators.js
// ホームのタブ内ジェネレーター（パスフレーズ・覚えやすいパスワード・ランダム文字列・PIN）

document.addEventListener('DOMContentLoaded', () => {
  const U = window.SiteUtils;

  // --- タブ切替 -------------------------------------------------------------
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');

  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.tab;
      tabLinks.forEach(l => {
        const active = l === link;
        l.classList.toggle('active', active);
        l.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      tabContents.forEach(c => { c.hidden = c.id !== target; });
    });
  });

  // 出力とコピー・ボタンの共通配線
  function setupGenerator(outputId, generateId, copyId, generateFn) {
    const output = document.getElementById(outputId);
    const generateBtn = document.getElementById(generateId);
    const copyBtn = document.getElementById(copyId);
    let lastValue = '';
    generateBtn.addEventListener('click', () => {
      lastValue = generateFn();
      output.textContent = lastValue;
      output.classList.remove('placeholder');
      copyBtn.disabled = false;
    });
    U.bindCopyButton(copyBtn, () => lastValue);
  }

  function bindSlider(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const value = document.getElementById(valueId);
    slider.addEventListener('input', () => { value.textContent = slider.value; });
    return slider;
  }

  // --- パスフレーズ -----------------------------------------------------------
  // 256語 = 1語あたり 8 bits のエントロピー
  const WORDS = [
    'apple', 'anchor', 'autumn', 'bacon', 'badge', 'bamboo', 'banana', 'basket',
    'beach', 'berry', 'bird', 'blanket', 'blossom', 'bottle', 'branch', 'bread',
    'breeze', 'bridge', 'bright', 'brush', 'bubble', 'butter', 'button', 'cabin',
    'cactus', 'camera', 'candle', 'canyon', 'carbon', 'carpet', 'castle', 'cedar',
    'cherry', 'circle', 'cloud', 'clover', 'coast', 'coconut', 'coffee', 'comet',
    'copper', 'coral', 'cotton', 'cousin', 'coyote', 'crayon', 'cricket', 'crystal',
    'daisy', 'dance', 'dawn', 'desert', 'diamond', 'dolphin', 'donkey', 'dragon',
    'dream', 'drift', 'eagle', 'earth', 'echo', 'ember', 'engine', 'falcon',
    'feather', 'fiddle', 'field', 'finch', 'flame', 'flute', 'forest', 'fossil',
    'fountain', 'fox', 'frost', 'galaxy', 'garden', 'garlic', 'gecko', 'giant',
    'ginger', 'glacier', 'globe', 'golden', 'goose', 'grape', 'gravel', 'green',
    'guitar', 'hammer', 'harbor', 'harvest', 'hazel', 'heron', 'hidden', 'hill',
    'honey', 'horizon', 'hummus', 'iceberg', 'igloo', 'island', 'ivory', 'jacket',
    'jaguar', 'jasmine', 'jelly', 'jungle', 'juniper', 'kayak', 'kettle', 'kitten',
    'kiwi', 'ladder', 'lagoon', 'lantern', 'lark', 'lava', 'lemon', 'lettuce',
    'light', 'lilac', 'lily', 'lizard', 'lobster', 'locket', 'lotus', 'lunar',
    'magnet', 'mango', 'maple', 'marble', 'meadow', 'melon', 'mesa', 'meteor',
    'mint', 'mirror', 'mocha', 'monkey', 'moon', 'morning', 'moss', 'mountain',
    'muffin', 'mural', 'mustard', 'nebula', 'nectar', 'needle', 'night', 'noodle',
    'north', 'nutmeg', 'ocean', 'olive', 'onion', 'opal', 'orange', 'orbit',
    'orchid', 'osprey', 'otter', 'owl', 'oyster', 'paddle', 'palm', 'panda',
    'paper', 'parrot', 'peach', 'pearl', 'pebble', 'pelican', 'pencil', 'pepper',
    'petal', 'piano', 'pigeon', 'pillow', 'pine', 'pirate', 'planet', 'plum',
    'pocket', 'polar', 'pond', 'poppy', 'portal', 'prairie', 'prism', 'pumpkin',
    'puzzle', 'quartz', 'quill', 'rabbit', 'raccoon', 'radish', 'rain', 'rainbow',
    'raven', 'reef', 'ribbon', 'river', 'robin', 'rocket', 'rose', 'ruby',
    'saddle', 'sage', 'salmon', 'sand', 'sapphire', 'scarf', 'shadow', 'shell',
    'silver', 'sketch', 'sky', 'sleigh', 'smile', 'snow', 'socket', 'sparrow',
    'spice', 'spiral', 'spring', 'spruce', 'square', 'star', 'stone', 'storm',
    'stream', 'sugar', 'summer', 'sunset', 'swan', 'thunder', 'tiger', 'timber',
    'topaz', 'trail', 'train', 'tulip', 'tundra', 'turtle', 'valley', 'velvet',
    'violet', 'volcano', 'wagon', 'walnut', 'water', 'willow', 'winter', 'zebra'
  ];

  const passphraseWords = bindSlider('passphrase-words', 'passphrase-words-val');
  const passphraseSeparator = document.getElementById('passphrase-separator');
  const passphraseCapitalize = document.getElementById('passphrase-capitalize');
  const passphraseNumber = document.getElementById('passphrase-number');

  setupGenerator('passphrase-output', 'passphrase-generate', 'passphrase-copy', () => {
    const count = parseInt(passphraseWords.value, 10);
    const words = [];
    for (let i = 0; i < count; i++) {
      let word = WORDS[U.secureRandomInt(WORDS.length)];
      if (passphraseCapitalize.checked) word = word.charAt(0).toUpperCase() + word.slice(1);
      words.push(word);
    }
    if (passphraseNumber.checked) {
      words[U.secureRandomInt(words.length)] += String(U.secureRandomInt(100));
    }
    return words.join(passphraseSeparator.value);
  });

  // --- 覚えやすいパスワード（発音可能な音節ベース） ---------------------------------
  const CONSONANTS = 'bcdfghjklmnprstvwz';
  const VOWELS = 'aeiou';

  const memorableSyllables = bindSlider('memorable-syllables', 'memorable-syllables-val');
  const memorableDigits = document.getElementById('memorable-digits');
  const memorableCapitalize = document.getElementById('memorable-capitalize');

  setupGenerator('memorable-output', 'memorable-generate', 'memorable-copy', () => {
    const count = parseInt(memorableSyllables.value, 10);
    let result = '';
    for (let i = 0; i < count; i++) {
      result += U.secureRandomChar(CONSONANTS) + U.secureRandomChar(VOWELS);
      // 音節の半分程度に子音を足して単調さを避ける
      if (U.secureRandomInt(2) === 1) result += U.secureRandomChar(CONSONANTS);
    }
    if (memorableCapitalize.checked) result = result.charAt(0).toUpperCase() + result.slice(1);
    if (memorableDigits.checked) result += String(10 + U.secureRandomInt(90));
    return result;
  });

  // --- ランダム文字列 ----------------------------------------------------------
  const STRING_POOLS = {
    alnum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    hex: '0123456789abcdef',
    base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  };

  const randomStringLength = bindSlider('random-string-length', 'random-string-length-val');
  const randomStringType = document.getElementById('random-string-type');

  setupGenerator('random-string-output', 'random-string-generate', 'random-string-copy', () => {
    const pool = STRING_POOLS[randomStringType.value] || STRING_POOLS.alnum;
    const length = parseInt(randomStringLength.value, 10);
    let result = '';
    for (let i = 0; i < length; i++) result += U.secureRandomChar(pool);
    return result;
  });

  // --- ランダムPIN ------------------------------------------------------------
  const pinTabLength = bindSlider('pin-tab-length', 'pin-tab-length-val');

  setupGenerator('pin-tab-output', 'pin-tab-generate', 'pin-tab-copy', () => {
    const length = parseInt(pinTabLength.value, 10);
    let pin = '';
    for (let i = 0; i < length; i++) pin += String(U.secureRandomInt(10));
    return pin;
  });
});
