// random-name-generator.js
// 英語圏の姓名をランダムに組み合わせて生成する

document.addEventListener('DOMContentLoaded', () => {
    const U = window.SiteUtils;
    const outputBox = document.getElementById('name-output');
    const generateBtn = document.getElementById('generate-name-btn');
    const copyBtn = document.getElementById('copy-name-btn');
    const genderRadios = document.getElementsByName('gender');

    const firstNamesMale = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'];
    const firstNamesFemale = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    let lastName = '';

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
            first = firstNamesMale[U.secureRandomInt(firstNamesMale.length)];
        } else if (gender === 'female') {
            first = firstNamesFemale[U.secureRandomInt(firstNamesFemale.length)];
        } else {
            const pool = firstNamesMale.concat(firstNamesFemale);
            first = pool[U.secureRandomInt(pool.length)];
        }

        const last = lastNames[U.secureRandomInt(lastNames.length)];
        lastName = `${first} ${last}`;
        outputBox.textContent = lastName;
        outputBox.classList.remove('placeholder');
        copyBtn.disabled = false;
    });

    U.bindCopyButton(copyBtn, () => lastName);
});
