// random-username-generator.js
// 形容詞＋名詞ベースのユーザー名生成（乱数は Web Crypto API を使用）

document.addEventListener('DOMContentLoaded', () => {
    const U = window.SiteUtils;
    const outputBox = document.getElementById('username-output');
    const lengthSlider = document.getElementById('username-length');
    const lengthVal = document.getElementById('username-length-val');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const generateBtn = document.getElementById('generate-username-btn');
    const copyBtn = document.getElementById('copy-username-btn');

    const adjectives = ['Swift', 'Bold', 'Silent', 'Mighty', 'Clever', 'Quick', 'Happy', 'Grand', 'Epic', 'Fancy', 'Smart', 'Sharp', 'Cool', 'Vivid', 'Wild', 'Chill', 'Pro', 'Elite', 'Lone', 'Hyper'];
    const nouns = ['Lion', 'Hawk', 'Wolf', 'Eagle', 'Tiger', 'Panda', 'Shark', 'Falcon', 'Ghost', 'Knight', 'Shadow', 'Storm', 'Pixel', 'Coder', 'Gamer', 'Nova', 'Alpha', 'Zenith', 'Titan', 'Aura'];

    let lastUsername = '';

    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
    });

    generateBtn.addEventListener('click', () => {
        lastUsername = generateUsername();
        outputBox.textContent = lastUsername;
        outputBox.classList.remove('placeholder');
        copyBtn.disabled = false;
    });

    U.bindCopyButton(copyBtn, () => lastUsername);

    function generateUsername() {
        const adj = adjectives[U.secureRandomInt(adjectives.length)];
        const noun = nouns[U.secureRandomInt(nouns.length)];
        let username = adj + noun;

        if (includeNumbers.checked) {
            username += String(U.secureRandomInt(10000));
        }

        if (includeSymbols.checked) {
            const sym = ['_', '-'][U.secureRandomInt(2)];
            const pos = 1 + U.secureRandomInt(username.length - 1);
            username = username.slice(0, pos) + sym + username.slice(pos);
        }

        // 指定の長さに合わせる
        const targetLength = parseInt(lengthSlider.value, 10);
        if (username.length > targetLength) {
            username = username.substring(0, targetLength);
        } else {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            while (username.length < targetLength) {
                username += U.secureRandomChar(chars);
            }
        }

        return username;
    }
});
