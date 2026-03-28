// password-strength-checker.js

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const strengthMeter = document.getElementById('strength-meter');
    const strengthLabel = document.getElementById('strength-label');
    const entropyValue = document.getElementById('entropy-value');
    const feedbackList = document.getElementById('feedback-list');
    const suggestions = document.getElementById('suggestions');

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

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (!password) {
            strengthMeter.value = 0;
            strengthLabel.textContent = '強度: N/A';
            entropyValue.textContent = 'エントロピー: 0 bits';
            feedbackList.style.display = 'none';
            return;
        }

        const stats = analyzePassword(password);
        updateUI(stats);
    });

    function analyzePassword(password) {
        let poolSize = 0;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);

        if (hasUpper) poolSize += 26;
        if (hasLower) poolSize += 26;
        if (hasNumbers) poolSize += 10;
        if (hasSymbols) poolSize += 32;

        const entropy = Math.log2(Math.pow(poolSize || 1, password.length));
        
        const feedback = [];
        if (password.length < 8) feedback.push('パスワードが短すぎます（最低8文字）。');
        if (password.length < 12) feedback.push('セキュリティを高めるため、12文字以上の使用を検討してください。');
        if (!hasUpper) feedback.push('大文字を追加してください。');
        if (!hasLower) feedback.push('小文字を追加してください。');
        if (!hasNumbers) feedback.push('数字を追加してください。');
        if (!hasSymbols) feedback.push('記号を追加してください。');
        
        // Simple pattern checks
        if (/(.)\1\1/.test(password)) feedback.push('同じ文字の繰り返し（例: "aaa"）を避けてください。');
        if (/123|abc|qwerty/i.test(password)) feedback.push('一般的な連続パターンを避けてください。');

        return { entropy, feedback, length: password.length };
    }

    function updateUI(stats) {
        entropyValue.textContent = `エントロピー: ${stats.entropy.toFixed(2)} bits`;
        
        let strength = '弱い';
        let meterValue = 20;

        if (stats.entropy > 80 && stats.length >= 12) {
            strength = '非常に強い';
            meterValue = 100;
        } else if (stats.entropy > 60) {
            strength = '強い';
            meterValue = 80;
        } else if (stats.entropy > 40) {
            strength = '普通';
            meterValue = 50;
        } else {
            strength = '弱い';
            meterValue = 20;
        }

        strengthLabel.textContent = `強度: ${strength}`;
        strengthMeter.value = meterValue;

        // Feedback
        suggestions.innerHTML = '';
        if (stats.feedback.length > 0) {
            stats.feedback.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                suggestions.appendChild(li);
            });
            feedbackList.style.display = 'block';
        } else {
            feedbackList.style.display = 'none';
        }
    }
});
