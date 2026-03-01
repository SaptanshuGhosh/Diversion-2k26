// --- Breach Check Logic ---
async function checkPasswordPwned(password) {
    // SHA-1 hash the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);
    // Use a proxy if needed, or direct endpoint if CORS is not an issue
    // const response = await fetch(`http://localhost:3001/api/hibp/${prefix}`); // Use this if you have a proxy
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`); // Use this for direct (may fail due to CORS)
    const text = await response.text();
    const lines = text.split('\n');
    for (const line of lines) {
        const [hashSuffix, count] = line.trim().split(':');
        if (hashSuffix === suffix) {
            return parseInt(count, 10);
        }
    }
    return 0;
}

// --- UI Event for Breach Check ---
document.addEventListener('DOMContentLoaded', function() {
    const breachBtn = document.getElementById('breachCheckBtn');
    if (breachBtn) {
        breachBtn.addEventListener('click', async function() {
            const pwd = document.getElementById('test').value;
            const resultDiv = document.getElementById('breachResult');
            resultDiv.textContent = 'Checking...';
            resultDiv.className = '';
            if (!pwd) {
                resultDiv.textContent = 'Please enter a password above to check.';
                resultDiv.className = 'breach-warning';
                return;
            }
            try {
                const count = await checkPasswordPwned(pwd);
                if (count > 0) {
                    resultDiv.innerHTML = `<div style='font-size:1.1rem;'><b>Password:</b> <span style='background:#222;padding:2px 8px;border-radius:6px;color:#fff;font-family:monospace;'>${pwd}</span></div><div style='margin-top:8px;'><b>Alert:</b> <span style='color:#ff4444;'>This strong password has been exposed in multiple data breaches. Please consider choosing a different one, as it's part of a breach list.</span></div>`;
                    resultDiv.className = 'breach-warning';
                } else {
                    resultDiv.innerHTML = `<span style='color:#00ff15;font-size:1.1rem;'><b>✔️ This password was not found in any known breaches.</b></span>`;
                    resultDiv.className = 'breach-safe';
                }
            } catch (e) {
                resultDiv.innerHTML = `<span style='color:#ff4444;'>Error checking breach database.<br>This feature may not work in some browsers due to security restrictions (CORS).<br>For full functionality, use a backend proxy server to access the HaveIBeenPwned API.</span>`;
                resultDiv.className = 'breach-warning';
            }
        });
    }
});
// --- Password Strength Check for Password Checker ---
function strength_check(password) {
    let i = 0;
    if (/[A-Z]/.test(password)) i += 26;
    if (/[a-z]/.test(password)) i += 26;
    if (/[0-9]/.test(password)) i += 10;
    if (/[!@#$%^&*_\-=:.]/.test(password)) i += 13;
    const totalCombinations = Math.pow(i, password.length);
    let t = (totalCombinations / 150000000000) / 3600;
    let timeValue = 0;
    let timeUnit = "";
    if (t * 60 < 1) {
        timeValue = Math.round(t * 3600);
        timeUnit = "seconds";
    } else if (t < 1) {
        timeValue = Math.round(t * 60);
        timeUnit = "minutes";
    } else if (t <= 24) {
        timeValue = Math.round(t);
        timeUnit = "hours";
    } else if (t <= 30 * 24) {
        timeValue = Math.round(t / 24);
        timeUnit = "days";
    } else if (t < 365 * 24) {
        timeValue = Math.round(t / (24 * 30));
        timeUnit = "months";
    } else if (t < 10 * 365 * 24) {
        timeValue = Math.round(t / (24 * 365));
        timeUnit = "years";
    } else if (t < 10 * 365 * 24 * 100) {
        timeValue = Math.round(t / (10 * 24 * 365));
        timeUnit = "decades";
    } else {
        timeValue = t / (100 * 10 * 24 * 365);
        timeUnit = "centuries";
    }
    let timeStr = (typeof timeValue === 'number' && timeValue > 1e6) ? timeValue.toExponential(2) : timeValue;
    let label = "Very Weak ❗👎";
    if (t >= 1e10) {
        label = "Very Strong 💪";
    } else if (t >= 1e7) {
        label = "Strong 👍";
    } else if (t >= 1e4) {
        label = "Moderate 😐";
    } else if (t >= 1e2) {
        label = "Weak 😑";
    }
    return `<div style=\"margin-bottom:24px;\"><span class=\"strength-label\">${label}</span></div><div style=\"margin-top:24px;\"><span class=\"crack-label\">Time to crack: ${timeStr} ${timeUnit}</span></div>`;
}
// --- Copy Button for Passphrase ---
document.getElementById("copy").addEventListener("click", function() {
    var copyText = document.getElementById("Pass_Phrase").value;
    if (copyText) {
        navigator.clipboard.writeText(copyText)
            .then(() => {
                alert("Text copied to clipboard!");
            })
            .catch(err => {
                alert("Failed to copy text");
            });
    } else {
        alert("Nothing to copy!");
    }
});
let password = "";
let passphrase = "";
let l = 0, char, num, upper, lower, c = 0, x = 0, strong, t;
const words = [
    'Correct', 'Horse', 'Battery', 'Staple', 'Elephant', 'Dragon', 'Rocket', 'Galaxy',
    'Symphony', 'Whisper', 'Mountain', 'Ocean', 'Sunrise', 'Jupiter', 'Coffee', 'Bicycle',
    'Computer', 'Keyboard', 'Penguin', 'Diamond', 'Umbrella', 'Harmony', 'Blizzard', 'Adventure',
    'Paradise', 'Champion', 'Lantern', 'Universe', 'Treasure', 'Journey', 'Satellite', 'Waterfall',
    'Firefly', 'Meadow', 'Crystal', 'Volcano', 'Tornado', 'Hurricane', 'Thunder', 'Lightning',
    'Breeze', 'Starfish', 'Dolphin', 'Seahorse', 'Octopus', 'Jellyfish', 'Sunflower', 'Daisy',
    'Tulip', 'Carnation', 'Magnolia', 'Orchid', 'Lavender', 'Rosebud', 'Fireworks', 'Firecracker',
    'Campfire', 'Stream', 'Riverbed', 'Cloudscape', 'Rainbow', 'Moonbeam', 'Starlight', 'Dandelion',
    'Pebble', 'Sandcastle', 'Waterdrop', 'Leafy', 'Twiggy', 'Mossy', 'Bumpy', 'Sparkle',
    'Glisten', 'Apple', 'Banana', 'Cat', 'Dog', 'Flower', 'Garden', 'House',
    'Ice', 'Jump', 'Kite', 'Lemon', 'Night', 'Pizza', 'Queen', 'River',
    'Sun', 'Tree', 'Violet', 'Water', 'Xylophone', 'Yellow', 'Zebra',
];
const specialChars = '!@#$%^&*_-=:.'; 
const digits = '0123456789';

const emojiSeparators = ["🙂","🔥","😅","😂","😭","👍"];
const customWords = ["Football","Basketball","Chess","Coding","Music","Dance","Yoga","Reading"];

const mySlider = document.getElementById('slide');
const sliderValueDisplay = document.getElementById('SL');
sliderValueDisplay.textContent = mySlider.value;


// --- Enhanced Passphrase Generator ---
function gen_passphrase() {
    let wo = mySlider.value;
    let spec = document.getElementById("check1").checked;
    let number = document.getElementById("check2").checked;
    let useEmoji = document.getElementById("useEmoji")?.checked ?? false;
    let wordList = words;
    let pp = [];
    for (let i = 0; i < wo; i++) {
        let ran = Math.floor(Math.random() * wordList.length);
        pp.push(wordList[ran]);
    }
    let separator = " ";
    if (useEmoji) {
        // Always inject a digit if number is checked
        if (number) {
            let idx = Math.floor(Math.random() * wo);
            pp[idx] = pp[idx] + digits[Math.floor(Math.random() * digits.length)];
        }
        // Always inject a special char if special is checked
        if (spec) {
            let idx = Math.floor(Math.random() * wo);
            pp[idx] = pp[idx] + specialChars[Math.floor(Math.random() * specialChars.length)];
        }
        // Insert emoji separator at 1 or 2 random positions
        let positions = [];
        let maxEmojis = Math.min(2, wo - 1);
        while (positions.length < maxEmojis) {
            let pos = Math.floor(Math.random() * (wo - 1));
            if (!positions.includes(pos)) positions.push(pos);
        }
        let ranEmoji = Math.floor(Math.random() * emojiSeparators.length);
        let emoji = emojiSeparators[ranEmoji];
        let result = "";
        for (let i = 0; i < wo; i++) {
            result += pp[i];
            if (i < wo - 1) {
                if (positions.includes(i)) {
                    result += emoji;
                } else {
                    // fallback to other separator if needed
                    if (spec && number) {
                        let ran = Math.floor(Math.random() * specialChars.length);
                        result += specialChars[ran];
                    } else if (spec) {
                        let ran = Math.floor(Math.random() * specialChars.length);
                        result += specialChars[ran];
                    } else if (number) {
                        let ran = Math.floor(Math.random() * digits.length);
                        result += digits[ran];
                    } else {
                        result += " ";
                    }
                }
            }
        }
        passphrase = result;
    } else {
        if (spec && number) {
            // Inject both a digit and a special char into random words
            let idx1 = Math.floor(Math.random() * wo);
            let idx2 = Math.floor(Math.random() * wo);
            pp[idx1] = pp[idx1] + digits[Math.floor(Math.random() * digits.length)];
            pp[idx2] = pp[idx2] + specialChars[Math.floor(Math.random() * specialChars.length)];
            let ran = Math.floor(Math.random() * specialChars.length);
            separator = specialChars[ran];
        } else if (spec) {
            // Always inject a special char if special is checked
            let idx = Math.floor(Math.random() * wo);
            pp[idx] = pp[idx] + specialChars[Math.floor(Math.random() * specialChars.length)];
            let ran = Math.floor(Math.random() * specialChars.length);
            separator = specialChars[ran];
        } else if (number) {
            // Always inject a digit if number is checked
            let idx = Math.floor(Math.random() * wo);
            pp[idx] = pp[idx] + digits[Math.floor(Math.random() * digits.length)];
            let ran = Math.floor(Math.random() * digits.length);
            separator = digits[ran];
        }
        passphrase = pp.join(separator);
    }
    document.getElementById("Pass_Phrase").value = passphrase;
    // Show passphrase strength below COPY button
    const strengthHtml = get_passphrase_strength_html(passphrase);
    document.getElementById("passphrase-strength").innerHTML = strengthHtml;

}

function get_passphrase_strength_html(passphrase) {
    // Use the same logic as strength_check but with better formatting
    let i = 0;
    if (/[A-Z]/.test(passphrase)) i += 26;
    if (/[a-z]/.test(passphrase)) i += 26;
    if (/[0-9]/.test(passphrase)) i += 10;
    if (/[!@#$%^&*_\-=:.]/.test(passphrase)) i += 13;
    const totalCombinations = Math.pow(i, passphrase.length);
    let t = (totalCombinations / 150000000000) / 3600;
    let timeValue = 0;
    let timeUnit = "";
    if (t * 60 < 1) {
        timeValue = Math.round(t * 3600);
        timeUnit = "seconds";
    } else if (t < 1) {
        timeValue = Math.round(t * 60);
        timeUnit = "minutes";
    } else if (t <= 24) {
        timeValue = Math.round(t);
        timeUnit = "hours";
    } else if (t <= 30 * 24) {
        timeValue = Math.round(t / 24);
        timeUnit = "days";
    } else if (t < 365 * 24) {
        timeValue = Math.round(t / (24 * 30));
        timeUnit = "months";
    } else if (t < 10 * 365 * 24) {
        timeValue = Math.round(t / (24 * 365));
        timeUnit = "years";
    } else if (t < 10 * 365 * 24 * 100) {
        timeValue = Math.round(t / (10 * 24 * 365));
        timeUnit = "decades";
    } else {
        timeValue = t / (100 * 10 * 24 * 365);
        timeUnit = "centuries";
    }
    // Format large numbers
    let timeStr = (typeof timeValue === 'number' && timeValue > 1e6) ? timeValue.toExponential(2) : timeValue;
    // Strength label based on time to crack
    let label = "Very Weak ❗👎";
    if (t >= 1e10) {
        label = "Very Strong 💪";
    } else if (t >= 1e7) {
        label = "Strong 👍";
    } else if (t >= 1e4) {
        label = "Moderate 😐";
    } else if (t >= 1e2) {
        label = "Weak 😑";
    }
    return `<div style=\"margin-bottom:24px;\"><span class=\"strength-label\">${label}</span></div><div style=\"margin-top:24px;\"><span class=\"crack-label\">Time to crack: ${timeStr} ${timeUnit}</span></div>`;
}

// --- Event Listeners for Live Updates ---
mySlider.addEventListener('input', function() {
    sliderValueDisplay.textContent = this.value;
    gen_passphrase();
});
document.getElementById('check1').addEventListener('change', gen_passphrase);
document.getElementById('check2').addEventListener('change', gen_passphrase);
document.getElementById('useEmoji').addEventListener('change', gen_passphrase);

// Initial call
gen_passphrase();

function generatePassword(cha, no, up, lo, pl) {
    let characters = "";
    let char = "";
    let pass = "";
    if (up) {
        characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        r = Math.floor(Math.random() * char.length);
        pass += char.substring(r, r + 1);
    }
    if (lo) {
        characters += "abcdefghijklmnopqrstuvwxyz";
        char = "abcdefghijklmnopqrstuvwxyz";
        r = Math.floor(Math.random() * char.length);
        pass += char.substring(r, r + 1);
    }
    if (cha) {
        characters += "!@#$%^&*_-=:.";
        char = "!@#$%^&*_-=:.";
        r = Math.floor(Math.random() * char.length);
        pass += char.substring(r, r + 1);
    }
    if (no) {
        characters += "0123456789";
        char = "0123456789";
        r = Math.floor(Math.random() * char.length);
        pass += char.substring(r, r + 1);
    }

    char = "";
    for (let i = pass.length; i < pl; i++) {
        let randomNumber = Math.floor(Math.random() * characters.length);
        pass += characters.substring(randomNumber, randomNumber + 1);
    }
    return pass;
}

function shuffle() {
    let a = password.split("");
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * a.length);
        let temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a.join("");
}


function repeat() {
    password = generatePassword(char, num, upper, lower, l);
    password = shuffle();
    document.getElementById("pass").innerHTML = `Your Password is: <span style="color:#00ff15; font-size: 40px;background-color: #000000ff;">${password}</span>`;
    c++;
    if (c >= 70) {
        clearInterval(x);
        c = 0;
        passwordStrengthIndicator(password);
    }
}

function submit() {
    document.getElementById("btn2").disabled = true;
    l = document.getElementById("length").value;
    char = Array.from(document.getElementsByName("box")).find(r => r.checked)?.value === "true";
    num = Array.from(document.getElementsByName("box2")).find(r => r.checked)?.value === "true";
    upper = Array.from(document.getElementsByName("box3")).find(r => r.checked)?.value === "true";
    lower = Array.from(document.getElementsByName("box4")).find(r => r.checked)?.value === "true";
    repeat();
    x = setInterval(repeat, 40);
    setTimeout(function () {
        document.getElementById("btn2").disabled = false;
    }, 3000);
}

function str_check() {
    const t = document.getElementById("test").value;
    document.getElementById("btn3").disabled = true; // Disable button immediately
        if (t && t.length > 0) {
            // Calculate requirements feedback
            let feedback = [];
            if (t.length < 8) feedback.push("Password should be at least 8 characters long.");
            if (!/[A-Z]/.test(t)) feedback.push("Password should include at least one uppercase letter.");
            if (!/[a-z]/.test(t)) feedback.push("Password should include at least one lowercase letter.");
            if (!/[0-9]/.test(t)) feedback.push("Password should include at least one digit.");
            if (!/[!@#$%^&*_\-=:.]/.test(t)) feedback.push("Password should include at least one special character.");
            let html = strength_check(t);
            if (feedback.length > 0) {
                html += `<div style='color:yellow;font-size:1.1rem;margin-top:10px;'>Feedback:<ul style='margin:0;padding-left:20px;'>`;
                feedback.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }
        document.getElementById("stren").innerHTML = html;
        document.getElementById("stren").scrollIntoView({behavior: 'smooth', block: 'center'});
        } else {
            document.getElementById("stren").innerHTML = '<span style="color:yellow;">Please enter a password to check its strength.</span>';
    }
    setTimeout(function () {
        document.getElementById("btn3").disabled = false; // Re-enable button after 1 seconds
    }, 1000);
}

