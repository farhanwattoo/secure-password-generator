// random-username-generator.js

document.addEventListener('DOMContentLoaded', () => {
    const outputBox = document.getElementById('username-output');
    const lengthSlider = document.getElementById('username-length');
    const lengthVal = document.getElementById('username-length-val');
    const includeNumbers = document.getElementById('include-numbers');
    const includeSymbols = document.getElementById('include-symbols');
    const generateBtn = document.getElementById('generate-username-btn');
    const copyBtn = document.getElementById('copy-username-btn');

    const adjectives = ['Swift', 'Bold', 'Silent', 'Mighty', 'Clever', 'Quick', 'Happy', 'Grand', 'Epic', 'Fancy', 'Smart', 'Sharp', 'Cool', 'Vivid', 'Wild', 'Chill', 'Pro', 'Elite', 'Lone', 'Hyper'];
    const nouns = ['Lion', 'Hawk', 'Wolf', 'Eagle', 'Tiger', 'Panda', 'Shark', 'Falcon', 'Ghost', 'Knight', 'Shadow', 'Storm', 'Pixel', 'Coder', 'Gamer', 'Nova', 'Alpha', 'Zenith', 'Titan', 'Aura'];

    // Theme toggle initialization
    const themeToggle = document.getElementById('theme-toggle');
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    themeToggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
    setTheme(localStorage.getItem('theme') || 'light');

    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
    });

    generateBtn.addEventListener('click', () => {
        const username = generateUsername();
        outputBox.textContent = username;
        copyBtn.disabled = false;
    });

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(outputBox.textContent);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = originalText, 1500);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    });

    function generateUsername() {
        let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        let noun = nouns[Math.floor(Math.random() * nouns.length)];
        let username = adj + noun;

        if (includeNumbers.checked) {
            const num = Math.floor(Math.random() * 9999);
            username += num;
        }

        if (includeSymbols.checked) {
            const symbols = ['_', '-'];
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            const pos = Math.floor(Math.random() * (username.length - 1)) + 1;
            username = username.slice(0, pos) + sym + username.slice(pos);
        }

        // Adjust to length if needed
        const targetLength = parseInt(lengthSlider.value);
        if (username.length > targetLength) {
            username = username.substring(0, targetLength);
        } else if (username.length < targetLength) {
            // Fill with random chars if too short (rare with adjectives+nouns)
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            while (username.length < targetLength) {
                username += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        }

        return username;
    }
});
