document.addEventListener("DOMContentLoaded", function () {

    // MUSIC
    const audio = new Audio("hbd.mp3");
    audio.loop = true;

    const startScreen = document.getElementById("startScreen");
    const startBtn = document.getElementById("startBtn");

    startBtn.addEventListener("click", async function () {

        // 1. PLAY MUSIC (guaranteed because user clicked)
        try {
            await audio.play();
            console.log("Music playing ✔️");
        } catch (e) {
            console.log("Music blocked ❌", e);
        }

        // 2. HIDE START SCREEN
        startScreen.style.display = "none";

        // 3. START MICROPHONE + CANDLE FEATURES
        initCake();
    });

    // MAIN CODE MOVED INTO A FUNCTION
    function initCake() {

        const cake = document.querySelector(".cake");
        const candleCountDisplay = document.getElementById("candleCount");

        let candles = [];
        let audioContext;
        let analyser;
        let microphone;

        function updateCandleCount() {
            const activeCandles = candles.filter(
                (candle) => !candle.classList.contains("out")
            ).length;
            candleCountDisplay.textContent = activeCandles;
        }

        function addCandle(left, top) {
            const candle = document.createElement("div");
            candle.className = "candle";
            candle.style.left = left + "px";
            candle.style.top = top + "px";

            const flame = document.createElement("div");
            flame.className = "flame";
            candle.appendChild(flame);

            cake.appendChild(candle);
            candles.push(candle);
            updateCandleCount();
        }

        // Place candles
        cake.addEventListener("click", function (event) {
            const rect = cake.getBoundingClientRect();
            const left = event.clientX - rect.left;
            const top = event.clientY - rect.top;
            addCandle(left, top);
        });

        function isBlowing() {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let average = sum / bufferLength;

            return average > 30; // MORE SENSITIVE
        }

        function blowOutCandles() {
            let blownOut = 0;

            if (candles.length > 0 &&
                candles.some(c => !c.classList.contains("out"))) {

                if (isBlowing()) {
                    candles.forEach((candle) => {
                        if (!candle.classList.contains("out") && Math.random() > 0.5) {
                            candle.classList.add("out");
                            blownOut++;
                        }
                    });
                }

                if (blownOut > 0) updateCandleCount();

                // All candles out → confetti
                if (candles.every(c => c.classList.contains("out"))) {
                    triggerConfetti();
                    endlessConfetti();
                }
            }
        }

        // MICROPHONE ACCESS
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);

                microphone.connect(analyser);
                analyser.fftSize = 256;

                setInterval(blowOutCandles, 200);
            })
            .catch(function (err) {
                console.log("Mic error: " + err);
            });
    }
});

// CONFETTI
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function endlessConfetti() {
    let count = 0;
    let confettiInterval = setInterval(function () {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0 }
        });
        count++;
        if (count >= 10) clearInterval(confettiInterval);
    }, 1000);
}
