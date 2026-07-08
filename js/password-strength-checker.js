// password-strength-checker.js
// 入力されたパスワードの強度をローカルで分析する（送信なし）

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const strengthBar = document.getElementById('strength-bar');
    const strengthFill = document.getElementById('strength-fill');
    const strengthLabel = document.getElementById('strength-label');
    const entropyValue = document.getElementById('entropy-value');
    const feedbackList = document.getElementById('feedback-list');
    const suggestions = document.getElementById('suggestions');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        if (!password) {
            strengthFill.style.width = '0';
            strengthFill.className = 'strength-fill';
            strengthBar.setAttribute('aria-valuenow', '0');
            strengthLabel.textContent = '強度: N/A';
            entropyValue.textContent = 'エントロピー: 0 bits';
            feedbackList.hidden = true;
            return;
        }
        updateUI(analyzePassword(password));
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

        // length * log2(pool) — Math.pow だと長いパスワードで Infinity になるため使わない
        const entropy = poolSize > 0 ? password.length * Math.log2(poolSize) : 0;

        const feedback = [];
        if (password.length < 8) feedback.push('パスワードが短すぎます（最低8文字）。');
        else if (password.length < 12) feedback.push('セキュリティを高めるため、12文字以上の使用を検討してください。');
        if (!hasUpper) feedback.push('大文字を追加してください。');
        if (!hasLower) feedback.push('小文字を追加してください。');
        if (!hasNumbers) feedback.push('数字を追加してください。');
        if (!hasSymbols) feedback.push('記号を追加してください。');

        if (/(.)\1\1/.test(password)) feedback.push('同じ文字の繰り返し（例: "aaa"）を避けてください。');
        if (/123|abc|qwerty|password|asdf/i.test(password)) feedback.push('一般的な連続パターンや単語を避けてください。');

        return { entropy, feedback, length: password.length };
    }

    function updateUI(stats) {
        entropyValue.textContent = `エントロピー: ${stats.entropy.toFixed(1)} bits`;

        let label, cls, meterValue;
        if (stats.entropy >= 80 && stats.length >= 12) { label = '非常に強い'; cls = 'very-strong'; meterValue = 100; }
        else if (stats.entropy >= 60) { label = '強い'; cls = 'strong'; meterValue = 75; }
        else if (stats.entropy >= 40) { label = '普通'; cls = 'fair'; meterValue = 50; }
        else { label = '弱い'; cls = 'weak'; meterValue = 25; }

        strengthLabel.textContent = `強度: ${label}`;
        strengthFill.className = `strength-fill ${cls}`;
        strengthFill.style.width = `${meterValue}%`;
        strengthBar.setAttribute('aria-valuenow', String(meterValue));

        suggestions.innerHTML = '';
        if (stats.feedback.length > 0) {
            stats.feedback.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                suggestions.appendChild(li);
            });
            feedbackList.hidden = false;
        } else {
            feedbackList.hidden = true;
        }
    }
});
