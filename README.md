# MediScan - City Health Pharmacy Management System

A modern web-based pharmacy management system with prescription scanning capabilities for the City of Tanauan Health Department.

## Features

- **Login System** - Secure authentication for staff
- **Patient Records** - View and manage patient dispensing history
- **Prescription Scanner** - Real-time camera-based prescription scanning
- **Inventory Management** - Track pharmaceutical inventory
- **Outbreak Analytics** - Monitor health trends and analytics

## Pages

- `login.html` - Authentication page
- `patient-records.html` - Patient history and prescription scanning
- `outbreak-analytics.html` - Analytics and reporting
- `medscan-ui/html/index.html` - Dispensing module

## Tech Stack

- HTML5
- CSS3 (Responsive Design)
- JavaScript (Vanilla JS)
- Camera/MediaDevices API for prescription scanning

## Getting Started

### Local Development

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/MediScan.git
```

2. Open in a browser
```bash
# Simply open any HTML file in your browser
# Or use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
```

### Mobile Camera Scanner

The prescription scanner works on:
- Desktop (webcam)
- Mobile (rear camera)
- Tablets

Just open the patient records page and tap "Scan Prescription".

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Click Deploy

Your app will be live at `https://yourapp.vercel.app`

### Features on Live Site

- Camera scanner works on HTTPS
- Prescription data stored in browser local storage
- Mobile-optimized interface

## File Structure

```
MediScan/
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── scanner.js (Prescription scanning logic)
├── assets/
│   └── logo.png
├── html/
│   └── index.html
├── login.html
├── patient-records.html
├── outbreak-analytics.html
└── vercel.json
```

## Prescription Scanner

### How It Works

1. Click "Scan Prescription" button
2. Allow camera access
3. Position prescription in frame
4. Capture image
5. Confirm and save to patient records

### Data Storage

Prescriptions are stored in browser localStorage with:
- Timestamp
- Image data (base64)
- Patient ID
- Automatic history update

## Browser Support

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Mobile browsers with camera support

## Security Note

⚠️ Current version stores data in browser local storage. For production:
- Add backend authentication
- Implement secure API
- Use proper database (e.g., PostgreSQL)
- Add encryption for sensitive data

## Future Enhancements

- [ ] Backend API integration
- [ ] Database for persistent storage
- [ ] OCR for prescription text extraction
- [ ] Barcode/QR code scanning
- [ ] User role management
- [ ] Audit logging
- [ ] Multi-language support

## Support

For issues or feedback, contact the City Health Department IT team.

## License

© 2026 City Health Department. Official use only.
