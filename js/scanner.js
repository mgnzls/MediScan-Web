// Prescription Scanner Functionality
class PrescriptionScanner {
    constructor() {
        this.modal = document.getElementById('scannerModal');
        this.cameraFeed = document.getElementById('cameraFeed');
        this.captureCanvas = document.getElementById('captureCanvas');
        this.capturedImageDiv = document.getElementById('capturedImage');
        this.prescriptionImage = document.getElementById('prescriptionImage');
        
        this.scanPrescriptionBtn = document.getElementById('scanPrescriptionBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.captureBtn = document.getElementById('captureBtn');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.confirmBtn = document.getElementById('confirmBtn');
        
        this.stream = null;
        this.capturedImageData = null;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.scanPrescriptionBtn.addEventListener('click', () => this.openScanner());
        this.closeModalBtn.addEventListener('click', () => this.closeScanner());
        this.captureBtn.addEventListener('click', () => this.captureImage());
        this.retakeBtn.addEventListener('click', () => this.retakeImage());
        this.confirmBtn.addEventListener('click', () => this.savePrescrip());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeScanner();
            }
        });
    }
    
    async openScanner() {
        this.modal.classList.add('active');
        
        try {
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use rear camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            this.cameraFeed.srcObject = this.stream;
        } catch (error) {
            console.error('Camera access denied:', error);
            alert('Unable to access camera. Please check permissions.');
            this.closeScanner();
        }
    }
    
    closeScanner() {
        this.modal.classList.remove('active');
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.resetScanner();
    }
    
    captureImage() {
        const context = this.captureCanvas.getContext('2d');
        
        // Set canvas size to match video dimensions
        this.captureCanvas.width = this.cameraFeed.videoWidth;
        this.captureCanvas.height = this.cameraFeed.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(this.cameraFeed, 0, 0);
        
        // Get image data
        this.capturedImageData = this.captureCanvas.toDataURL('image/jpeg', 0.9);
        
        // Display captured image
        this.prescriptionImage.src = this.capturedImageData;
        document.querySelector('.camera-feed').style.display = 'none';
        this.capturedImageDiv.classList.remove('hidden');
    }
    
    retakeImage() {
        this.capturedImageDiv.classList.add('hidden');
        document.querySelector('.camera-feed').style.display = 'block';
        this.capturedImageData = null;
    }
    
    savePrescrip() {
        if (!this.capturedImageData) {
            alert('No image captured');
            return;
        }
        
        // Save prescription data (you can modify this to send to backend)
        const prescriptionData = {
            timestamp: new Date().toISOString(),
            image: this.capturedImageData,
            patientId: 'patient_123' // This should be dynamic
        };
        
        // Store in localStorage for demo
        let prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
        prescriptions.push(prescriptionData);
        localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
        
        // Show success message
        alert('Prescription saved successfully!');
        
        // Add to dispensing history (create new row in table)
        this.addToHistory();
        
        // Close scanner
        this.closeScanner();
    }
    
    addToHistory() {
        const tableBody = document.querySelector('.data-table tbody');
        
        if (!tableBody) return;
        
        const newRow = document.createElement('tr');
        const today = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        newRow.innerHTML = `
            <td>${today}</td>
            <td>Prescription (Scanned)</td>
            <td>1</td>
            <td><span class="badge badge-success">Recorded</span></td>
        `;
        
        tableBody.insertBefore(newRow, tableBody.firstChild);
    }
    
    resetScanner() {
        this.capturedImageDiv.classList.add('hidden');
        document.querySelector('.camera-feed').style.display = 'block';
        this.capturedImageData = null;
    }
}

// Initialize scanner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrescriptionScanner();
});
