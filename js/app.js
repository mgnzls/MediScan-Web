const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const result = document.getElementById('result');
const resultText = document.getElementById('resultText');
const scanAgainBtn = document.getElementById('scanAgainBtn');

let stream;
let scanning = true;

async function init() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        camera.srcObject = stream;
        camera.onloadedmetadata = () => {
            canvas.width = camera.videoWidth;
            canvas.height = camera.videoHeight;
            scanQRCode();
        };
    } catch (error) {
        alert('Unable to access camera');
        console.error(error);
    }
}

function scanQRCode() {
    if (!scanning) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, canvas.width, canvas.height);
    
    if (qrCode) {
        displayResult(qrCode.data);
    } else {
        requestAnimationFrame(scanQRCode);
    }
}

function displayResult(data) {
    scanning = false;
    resultText.textContent = data;
    result.classList.remove('hidden');
    
    // Store in localStorage
    let codes = JSON.parse(localStorage.getItem('scannedCodes') || '[]');
    codes.push({
        id: Date.now(),
        data: data,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('scannedCodes', JSON.stringify(codes));
}

function scanAgain() {
    result.classList.add('hidden');
    scanning = true;
    scanQRCode();
}

scanAgainBtn.addEventListener('click', scanAgain);
init();


