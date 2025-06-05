const symbolMap = {
    '🍒': 'cherry.png',
    '🍋': 'lemon.png',
    '🔔': 'bell.png',
    '💎': 'diamond.png',
    '7️⃣': 'seven.png',
    '⭐': 'star.png',
    '🍀': 'clover.png'
};

const symbols = Object.keys(symbolMap);
const reels = [[], [], [], [], []];

const payouts = {
    '🍒': 5,
    '🍋': 10,
    '🔔': 15,
    '💎': 20,
    '7️⃣': 50,
    '⭐': 30,
    '🍀': 100
};

let serverSeed = "example_server_seed";
let clientSeed = "user_seed";
let nonce = 0;
let freeSpinsLeft = 0;

function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", buffer).then(hashBuffer => {
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    });
}

async function generateRandom(symbolCount, indexOffset) {
    const hashInput = clientSeed + ':' + serverSeed + ':' + (nonce + indexOffset);
    const hash = await sha256(hashInput);
    const num = parseInt(hash.slice(0, 8), 16);
    return num % symbolCount;
}

async function spin() {
    document.getElementById('spinSound').play();
    if (freeSpinsLeft === 0) nonce++;
    if (freeSpinsLeft > 0) freeSpinsLeft--;

    for (let i = 0; i < 5; i++) {
        let reel = document.getElementById('reel' + (i + 1));
        reel.innerHTML = '';
        reels[i] = [];
        for (let j = 0; j < 3; j++) {
            const index = await generateRandom(symbols.length, i * 3 + j);
            const symbol = symbols[index];
            reels[i].push(symbol);
            let img = document.createElement('img');
            img.src = 'symbols/' + symbolMap[symbol];
            img.alt = symbol;
            img.width = 40;
            reel.appendChild(img);
        }
    }
    checkWin();

    if (freeSpinsLeft > 0) {
        setTimeout(spin, 1500);
    }
}

function checkWin() {
    let middleRow = reels.map(reel => reel[1]);
    let result = document.getElementById('result');
    let counts = {};
    middleRow.forEach(sym => {
        counts[sym] = (counts[sym] || 0) + 1;
    });

    let maxCount = 0;
    let topSymbol = '';
    for (let sym in counts) {
        if (counts[sym] > maxCount) {
            maxCount = counts[sym];
            topSymbol = sym;
        }
    }

    if (maxCount >= 3) {
        const payout = payouts[topSymbol] * maxCount;
        result.textContent = `🎉 You matched ${maxCount} ${topSymbol}'s! Payout: ${payout}`;
        document.getElementById('winSound').play();
    } else {
        result.textContent = `No win. Result: ${middleRow.join(' ')}`;
    }

    if (counts['⭐'] >= 3) {
        freeSpinsLeft += 5;
        result.textContent += ` 🎁 You won 5 free spins!`;
    }
}