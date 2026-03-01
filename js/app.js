class PrescriptionScanner {
    constructor() {
        this.video = document.getElementById('cameraFeed');
        this.canvas = document.getElementById('captureCanvas');
        this.captureBtn = document.getElementById('captureBtn');
        this.previewSection = document.getElementById('previewSection');
        this.previewImage = document.getElementById('previewImage');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.galleryContainer = document.getElementById('galleryContainer');
        
        this.stream = null;
        this.capturedImage = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.startCamera();
        this.loadGallery();
    }

    setupEventListeners() {
        this.captureBtn.addEventListener('click', () => this.captureImage());
        this.retakeBtn.addEventListener('click', () => this.retake());
        this.saveBtn.addEventListener('click', () => this.save());
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            this.video.srcObject = this.stream;
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    }

    captureImage() {
        const context = this.canvas.getContext('2d');
        
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        context.drawImage(this.video, 0, 0);
        
        this.capturedImage = this.canvas.toDataURL('image/jpeg', 0.9);
        this.previewImage.src = this.capturedImage;
        
        this.previewSection.classList.remove('hidden');
    }

    retake() {
        this.previewSection.classList.add('hidden');
        this.capturedImage = null;
    }

    save() {
        if (!this.capturedImage) return;

        const prescription = {
            id: Date.now(),
            image: this.capturedImage,
            timestamp: new Date().toLocaleString()
        };

        let prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        prescriptions.unshift(prescription);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));

        this.previewSection.classList.add('hidden');
        this.capturedImage = null;
        this.loadGallery();
    }

    loadGallery() {
        const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        
        this.galleryContainer.innerHTML = '';

        if (prescriptions.length === 0) {
            this.galleryContainer.innerHTML = '<p class="empty-message">No prescriptions scanned yet</p>';
            return;
        }

        prescriptions.forEach(prescription => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${prescription.image}" alt="Prescription ${prescription.id}"/>
                <button class="delete-btn" onclick="event.stopPropagation(); scanner.delete(${prescription.id})">×</button>
            `;
            
            item.addEventListener('click', () => this.viewImage(prescription));
            this.galleryContainer.appendChild(item);
        });
    }

    viewImage(prescription) {
        this.previewImage.src = prescription.image;
        this.previewSection.classList.remove('hidden');
    }

    delete(id) {
        let prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        prescriptions = prescriptions.filter(p => p.id !== id);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        this.loadGallery();
    }
}

// Initialize app
let scanner;
document.addEventListener('DOMContentLoaded', () => {
    scanner = new PrescriptionScanner();
});
