// secure-pin-generator.js
// 数値PINの生成。剰余バイアスのない暗号乱数（SiteUtils.secureRandomInt）を使用。

document.addEventListener('DOMContentLoaded', () => {
    const U = window.SiteUtils;
    const outputBox = document.getElementById('pin-output');
    const lengthSlider = document.getElementById('pin-length');
    const lengthVal = document.getElementById('pin-length-val');
    const generateBtn = document.getElementById('generate-pin-btn');
    const copyBtn = document.getElementById('copy-pin-btn');

    let lastPin = '';

    lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
    });

    generateBtn.addEventListener('click', () => {
        lastPin = generatePIN();
        outputBox.textContent = lastPin;
        outputBox.classList.remove('placeholder');
        copyBtn.disabled = false;
    });

    U.bindCopyButton(copyBtn, () => lastPin);

    function generatePIN() {
        const length = parseInt(lengthSlider.value, 10);
        let pin = '';
        for (let i = 0; i < length; i++) {
            pin += String(U.secureRandomInt(10));
        }
        return pin;
    }
});
