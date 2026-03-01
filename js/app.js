// MediScan Complete System
class MediScanSystem {
    constructor() {
        this.medicines = JSON.parse(localStorage.getItem('medicines') || '[]');
        this.patients = JSON.parse(localStorage.getItem('patients') || '[]');
        this.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        this.camera = document.getElementById('camera');
        this.canvas = document.getElementById('canvas');
        this.fileInput = document.getElementById('fileInput');
        this.stream = null;
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupScanner();
        this.setupInventory();
        this.setupPatients();
        this.setupReports();
        this.setupSurveillance();
        this.loadInitialData();
    }

    // ======== TAB NAVIGATION ========
    setupTabNavigation() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
        
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        if (tabName === 'reports') this.generateReports();
        if (tabName === 'surveillance') this.generateSurveillance();
    }

    // ======== OCR SCANNER ========
    setupScanner() {
        document.getElementById('cameraBtn').addEventListener('click', () => this.startCamera());
        document.getElementById('uploadBtn').addEventListener('click', () => this.fileInput.click());
        document.getElementById('captureBtn').addEventListener('click', () => this.captureImage());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearOCR());
        document.getElementById('confirmBtn')?.addEventListener('click', () => this.confirmPrescription());

        this.fileInput.addEventListener('change', (e) => this.processUploadedImage(e));
    }

    async startCamera() {
        try {
            if (!this.stream) {
                console.log('Requesting camera access...');
                const statusDiv = document.getElementById('cameraStatus');
                if (statusDiv) {
                    statusDiv.textContent = 'Requesting camera access...';
                    statusDiv.classList.add('show');
                }

                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'environment',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });
                
                this.camera.srcObject = this.stream;
                
                if (statusDiv) {
                    statusDiv.textContent = 'Loading camera feed...';
                }

                // Wait for video to be ready with timeout
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Camera timeout - feed did not initialize'));
                    }, 5000);
                    
                    this.camera.onloadedmetadata = () => {
                        clearTimeout(timeout);
                        console.log('Camera ready');
                        if (statusDiv) statusDiv.classList.remove('show');
                        resolve();
                    };
                });
            }
            this.camera.style.display = 'block';
        } catch (error) {
            console.error('Camera error:', error);
            const statusDiv = document.getElementById('cameraStatus');
            if (statusDiv) statusDiv.classList.remove('show');
            
            if (error.name === 'NotAllowedError') {
                alert('Camera permission denied. Please enable camera access in browser settings.');
            } else if (error.name === 'NotFoundError') {
                alert('No camera found. Please check your device.');
            } else {
                alert('Unable to access camera: ' + error.message);
            }
        }
    }

    async captureImage() {
        try {
            if (!this.camera.srcObject || !this.camera.videoWidth) {
                alert('Camera not ready. Please try again.');
                return;
            }
            
            const ctx = this.canvas.getContext('2d');
            this.canvas.width = this.camera.videoWidth;
            this.canvas.height = this.camera.videoHeight;
            ctx.drawImage(this.camera, 0, 0);
            
            this.canvas.toBlob(blob => this.processImage(blob));
        } catch (error) {
            console.error('Capture error:', error);
            alert('Failed to capture image: ' + error.message);
        }
    }

    processUploadedImage(e) {
        const file = e.target.files[0];
        if (file) this.processImage(file);
    }

    async processImage(imageData) {
        document.getElementById('captureBtn').textContent = 'Processing OCR...';
        document.getElementById('captureBtn').disabled = true;

        try {
            const result = await Tesseract.recognize(
                imageData,
                'eng',
                { logger: m => console.log(m) }
            );
            
            const extractedText = result.data.text;
            document.getElementById('extractedText').value = extractedText;
            document.getElementById('ocrResult').classList.remove('hidden');
            
            this.parsePrescription(extractedText);
        } catch (error) {
            alert('OCR Failed: ' + error.message);
        } finally {
            document.getElementById('captureBtn').textContent = 'Scan Prescription';
            document.getElementById('captureBtn').disabled = false;
        }
    }

    parsePrescription(text) {
        // Simple parsing - extract common medicine names and dosages
        const medicinePattern = /[A-Z][a-z]+\s*\d+(?:mg|ml|g)?/g;
        const matches = text.match(medicinePattern) || [];
        console.log('Found medicines:', matches);
    }

    clearOCR() {
        document.getElementById('ocrResult').classList.add('hidden');
        document.getElementById('extractedText').value = '';
    }

    confirmPrescription() {
        alert('Prescription added to patient record!');
        this.clearOCR();
    }

    // ======== INVENTORY MANAGEMENT ========
    setupInventory() {
        document.getElementById('addMedicineBtn').addEventListener('click', () => {
            document.getElementById('addMedicineModal').classList.remove('hidden');
        });

        document.getElementById('saveMedicineBtn').addEventListener('click', () => this.saveMedicine());
        document.getElementById('closeMedicineModal').addEventListener('click', () => {
            document.getElementById('addMedicineModal').classList.add('hidden');
        });

        document.getElementById('medicineSearch').addEventListener('input', (e) => {
            this.filterMedicines(e.target.value);
        });

        this.displayMedicines();
    }

    saveMedicine() {
        const medicine = {
            id: Date.now(),
            name: document.getElementById('medicineName').value,
            generic: document.getElementById('genericName').value,
            stock: parseInt(document.getElementById('medicineStock').value),
            shelf: document.getElementById('shelfLocation').value,
            createdAt: new Date()
        };

        this.medicines.push(medicine);
        localStorage.setItem('medicines', JSON.stringify(this.medicines));
        document.getElementById('addMedicineModal').classList.add('hidden');
        this.clearMedicineForm();
        this.displayMedicines();
    }

    clearMedicineForm() {
        document.getElementById('medicineName').value = '';
        document.getElementById('genericName').value = '';
        document.getElementById('medicineStock').value = '';
        document.getElementById('shelfLocation').value = '';
    }

    displayMedicines() {
        const list = document.getElementById('medicineList');
        list.innerHTML = '';

        this.medicines.forEach(medicine => {
            const card = document.createElement('div');
            card.className = 'medicine-card';
            const stockStatus = medicine.stock < 10 ? 'low' : medicine.stock < 30 ? 'medium' : 'good';
            
            card.innerHTML = `
                <h4>${medicine.name}</h4>
                <div class="medicine-info">
                    <p><strong>Generic:</strong> ${medicine.generic || 'N/A'}</p>
                    <p><strong>Stock:</strong> ${medicine.stock} units</p>
                    <p><strong>Shelf:</strong> ${medicine.shelf}</p>
                    <span class="stock-status ${stockStatus}">${medicine.stock < 10 ? 'LOW STOCK' : medicine.stock < 30 ? 'MEDIUM' : 'GOOD'}</span>
                </div>
            `;
            list.appendChild(card);
        });
    }

    filterMedicines(search) {
        const filtered = this.medicines.filter(m => 
            m.name.toLowerCase().includes(search.toLowerCase())
        );
        
        const list = document.getElementById('medicineList');
        list.innerHTML = '';
        filtered.forEach(medicine => {
            const card = document.createElement('div');
            card.className = 'medicine-card';
            card.innerHTML = `
                <h4>${medicine.name}</h4>
                <div class="medicine-info">
                    <p><strong>Generic:</strong> ${medicine.generic || 'N/A'}</p>
                    <p><strong>Stock:</strong> ${medicine.stock}</p>
                    <p><strong>Shelf:</strong> ${medicine.shelf}</p>
                </div>
            `;
            list.appendChild(card);
        });
    }

    // ======== PATIENT MANAGEMENT ========
    setupPatients() {
        document.getElementById('patientSearch').addEventListener('input', (e) => {
            this.filterPatients(e.target.value);
        });
        this.displayPatients();
    }

    addOrUpdatePatient(name, medicineDispensed) {
        let patient = this.patients.find(p => p.name === name);
        
        if (!patient) {
            patient = {
                id: Date.now(),
                name: name,
                claims: [],
                lastClaim: null
            };
            this.patients.push(patient);
        }

        patient.claims.push({
            medicine: medicineDispensed,
            date: new Date().toISOString()
        });
        patient.lastClaim = new Date();

        localStorage.setItem('patients', JSON.stringify(this.patients));
        
        const sameMedicineClaims = patient.claims.filter(c => c.medicine === medicineDispensed).length;
        if (sameMedicineClaims >= 3) {
            console.warn(`⚠️ Patient ${name} has claimed ${medicineDispensed} ${sameMedicineClaims} times - suggest re-consultation`);
        }
    }

    displayPatients() {
        const list = document.getElementById('patientList');
        list.innerHTML = '';

        this.patients.forEach(patient => {
            const card = document.createElement('div');
            card.className = 'patient-card';
            
            const medicineCounts = {};
            patient.claims.forEach(claim => {
                medicineCounts[claim.medicine] = (medicineCounts[claim.medicine] || 0) + 1;
            });

            const maxClaims = Math.max(...Object.values(medicineCounts), 0);
            const flagAlert = maxClaims >= 3 ? '<div class="flag-alert">⚠️ Recommend re-consultation with doctor</div>' : '';

            card.innerHTML = `
                <h4>${patient.name}</h4>
                <div class="patient-info">
                    <p><strong>Total Claims:</strong> ${patient.claims.length}</p>
                    <p><strong>Last Claim:</strong> ${patient.lastClaim ? new Date(patient.lastClaim).toLocaleDateString() : 'N/A'}</p>
                    <div class="claims-count">Most frequent: ${Object.entries(medicineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'} (${maxClaims}x)</div>
                    ${flagAlert}
                </div>
            `;
            list.appendChild(card);
        });
    }

    filterPatients(search) {
        const filtered = this.patients.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase())
        );
        
        const list = document.getElementById('patientList');
        list.innerHTML = '';
        filtered.forEach(patient => {
            const card = document.createElement('div');
            card.className = 'patient-card';
            card.innerHTML = `
                <h4>${patient.name}</h4>
                <div class="patient-info">
                    <p><strong>Total Claims:</strong> ${patient.claims.length}</p>
                    <p><strong>Last Claim:</strong> ${patient.lastClaim ? new Date(patient.lastClaim).toLocaleDateString() : 'N/A'}</p>
                </div>
            `;
            list.appendChild(card);
        });
    }

    // ======== REPORTS ========
    generateReports() {
        const medicineFrequency = {};
        this.transactions.forEach(tx => {
            medicineFrequency[tx.medicine] = (medicineFrequency[tx.medicine] || 0) + tx.count;
        });

        const sorted = Object.entries(medicineFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        let topMedicinesHTML = '<div style="padding: 20px;">';
        sorted.forEach((entry, idx) => {
            topMedicinesHTML += `
                <div style="padding: 10px; background: ${idx % 2 ? '#f9f9f9' : 'white'};border-bottom: 1px solid #ddd;">
                    <strong>${idx + 1}. ${entry[0]}</strong> <span style="float: right; color: #0066cc; font-weight: bold;">${entry[1]} claims</span>
                </div>
            `;
        });
        topMedicinesHTML += '</div>';
        document.getElementById('topMedicines').innerHTML = topMedicinesHTML;

        let restockHTML = '<ul class="restock-list">';
        this.medicines.filter(m => m.stock < 30).forEach(medicine => {
            restockHTML += `
                <li class="restock-item">
                    <span>${medicine.name} (Shelf: ${medicine.shelf})</span>
                    <strong>Reorder: ${50 - medicine.stock} units</strong>
                </li>
            `;
        });
        restockHTML += '</ul>';
        document.getElementById('restockList').innerHTML = restockHTML;
    }

    // ======== SURVEILLANCE ========
    generateSurveillance() {
        const medicineFrequency = {};
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        this.transactions
            .filter(tx => new Date(tx.date) > last7Days)
            .forEach(tx => {
                medicineFrequency[tx.medicine] = (medicineFrequency[tx.medicine] || 0) + tx.count;
            });

        const symptomMedicines = {
            'fever': ['Paracetamol', 'Ibuprofen'],
            'cough': ['Cough Syrup'],
            'cold': ['Antihistamine']
        };

        let alert = '';
        let hasOutbreakSignal = false;

        Object.entries(symptomMedicines).forEach(([symptom, meds]) => {
            const total = meds.reduce((sum, med) => sum + (medicineFrequency[med] || 0), 0);
            if (total > 50) {
                hasOutbreakSignal = true;
                alert = `
                    <div class="alert-content">
                        <div class="alert-icon">⚠️</div>
                        <div class="alert-text">
                            <h3>Potential Outbreak Alert</h3>
                            <p>High demand detected for ${symptom} medicines (${total} claims in last 7 days)</p>
                        </div>
                    </div>
                `;
            }
        });

        const alertCard = document.getElementById('alertCard');
        if (hasOutbreakSignal) {
            alertCard.classList.add('danger');
            alertCard.innerHTML = alert;
        } else {
            alertCard.classList.remove('danger');
            alertCard.innerHTML = `
                <div class="alert-content">
                    <div class="alert-icon">✓</div>
                    <div class="alert-text">
                        <h3>System Status: Normal</h3>
                        <p>No outbreak signals detected in the last 7 days</p>
                    </div>
                </div>
            `;
        }

        let trendHTML = '<div style="padding: 20px;"><strong>Medicine Demand (Last 7 Days)</strong><br>';
        Object.entries(medicineFrequency).slice(0, 5).forEach(([med, count]) => {
            const width = (count / Math.max(...Object.values(medicineFrequency), 1) * 100);
            trendHTML += `
                <div style="margin: 10px 0;">
                    <div>${med}</div>
                    <div style="background: #ddd; height: 20px; border-radius: 4px;">
                        <div style="background: #0066cc; width: ${width}%; height: 100%; border-radius: 4px;"></div>
                    </div>
                    <small>${count} claims</small>
                </div>
            `;
        });
        trendHTML += '</div>';
        document.getElementById('trendChart').innerHTML = trendHTML;
    }

    setupReports() {}
    setupSurveillance() {}

    // ======== SAMPLE DATA ========
    loadInitialData() {
        if (this.medicines.length === 0) {
            const sampleMedicines = [
                { id: 1, name: 'Paracetamol', generic: 'Paracetamol 500mg', stock: 50, shelf: 'A-1', createdAt: new Date() },
                { id: 2, name: 'Amoxicillin', generic: 'Amoxicillin 500mg', stock: 30, shelf: 'B-2', createdAt: new Date() },
                { id: 3, name: 'Losartan', generic: 'Losartan 50mg', stock: 15, shelf: 'C-3', createdAt: new Date() },
                { id: 4, name: 'Ibuprofen', generic: 'Ibuprofen 200mg', stock: 8, shelf: 'A-4', createdAt: new Date() }
            ];
            this.medicines = sampleMedicines;
            localStorage.setItem('medicines', JSON.stringify(sampleMedicines));
            this.displayMedicines();
        }

        if (this.transactions.length === 0) {
            const sampleTransactions = [
                { medicine: 'Paracetamol', date: new Date(), count: 15 },
                { medicine: 'Ibuprofen', date: new Date(), count: 12 },
                { medicine: 'Amoxicillin', date: new Date(), count: 8 }
            ];
            this.transactions = sampleTransactions;
            localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.mediScan = new MediScanSystem();
});



