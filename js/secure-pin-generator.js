// secure-pin-generator.js

document.addEventListener('DOMContentLoaded', () => {
    const outputBox = document.getElementById('pin-output');
    const lengthSlider = document.getElementById('pin-length');
    const lengthVal = document.getElementById('pin-length-val');
    const generateBtn = document.getElementById('generate-pin-btn');
    const copyBtn = document.getElementById('copy-pin-btn');

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
        const pin = generatePIN();
        outputBox.textContent = pin;
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

    function generatePIN() {
        const length = parseInt(lengthSlider.value);
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);
        
        let pin = '';
        for (let i = 0; i < length; i++) {
            pin += (array[i] % 10).toString();
        }
        return pin;
    }
});
