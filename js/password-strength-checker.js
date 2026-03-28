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
            strengthLabel.textContent = 'Strength: N/A';
            entropyValue.textContent = 'Entropy: 0 bits';
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
        if (password.length < 8) feedback.push('Password is too short (min 8 characters).');
        if (password.length < 12) feedback.push('Consider using at least 12 characters for better security.');
        if (!hasUpper) feedback.push('Add uppercase letters.');
        if (!hasLower) feedback.push('Add lowercase letters.');
        if (!hasNumbers) feedback.push('Add numbers.');
        if (!hasSymbols) feedback.push('Add special characters.');
        
        // Simple pattern checks
        if (/(.)\1\1/.test(password)) feedback.push('Avoid repeating characters (e.g. "aaa").');
        if (/123|abc|qwerty/i.test(password)) feedback.push('Avoid common sequences.');

        return { entropy, feedback, length: password.length };
    }

    function updateUI(stats) {
        entropyValue.textContent = `Entropy: ${stats.entropy.toFixed(2)} bits`;
        
        let strength = 'Weak';
        let meterValue = 20;

        if (stats.entropy > 80 && stats.length >= 12) {
            strength = 'Very Strong';
            meterValue = 100;
        } else if (stats.entropy > 60) {
            strength = 'Strong';
            meterValue = 80;
        } else if (stats.entropy > 40) {
            strength = 'Medium';
            meterValue = 50;
        } else {
            strength = 'Weak';
            meterValue = 20;
        }

        strengthLabel.textContent = `Strength: ${strength}`;
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
