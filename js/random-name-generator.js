// random-name-generator.js

document.addEventListener('DOMContentLoaded', () => {
    const outputBox = document.getElementById('name-output');
    const generateBtn = document.getElementById('generate-name-btn');
    const copyBtn = document.getElementById('copy-name-btn');
    const genderRadios = document.getElementsByName('gender');

    const firstNamesMale = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'];
    const firstNamesFemale = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

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

    generateBtn.addEventListener('click', () => {
        let gender = 'both';
        for (const radio of genderRadios) {
            if (radio.checked) {
                gender = radio.value;
                break;
            }
        }

        let first;
        if (gender === 'male') {
            first = firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)];
        } else if (gender === 'female') {
            first = firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
        } else {
            const pool = firstNamesMale.concat(firstNamesFemale);
            first = pool[Math.floor(Math.random() * pool.length)];
        }

        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        outputBox.textContent = `${first} ${last}`;
        copyBtn.disabled = false;
        copyBtn.textContent = 'コピー';
    });

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(outputBox.textContent);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'コピーしました！';
            setTimeout(() => copyBtn.textContent = originalText, 1500);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    });
});
