const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const cameraView = document.getElementById('cameraView');
const previewView = document.getElementById('previewView');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const saveBtn = document.getElementById('saveBtn');

let stream;
let capturedImageData;

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
    } catch (error) {
        alert('Unable to access camera');
        console.error(error);
    }
}

function capture() {
    const ctx = canvas.getContext('2d');
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    ctx.drawImage(camera, 0, 0);
    
    capturedImageData = canvas.toDataURL('image/jpeg', 0.9);
    preview.src = capturedImageData;
    
    camera.style.display = 'none';
    preview.classList.remove('hidden');
    cameraView.classList.remove('active');
    previewView.classList.add('active');
}

function retake() {
    camera.style.display = 'block';
    preview.classList.add('hidden');
    cameraView.classList.add('active');
    previewView.classList.remove('active');
}

function save() {
    const prescription = {
        id: Date.now(),
        image: capturedImageData,
        date: new Date().toLocaleDateString()
    };
    
    let prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    prescriptions.push(prescription);
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    
    alert('Prescription saved!');
    retake();
}

captureBtn.addEventListener('click', capture);
retakeBtn.addEventListener('click', retake);
saveBtn.addEventListener('click', save);

init();

