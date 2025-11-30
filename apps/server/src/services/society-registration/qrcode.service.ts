/**
 * QR Code Service
 * Provides registration URL data for QR code generation on the frontend
 */

interface SocietyInfo {
  name: string
  logo?: string | null
  description?: string | null
}

export class QRCodeService {
  /**
   * Get registration URL for QR code generation
   * The actual QR code will be generated on the frontend
   */
  getRegistrationUrl(url: string): string {
    return url
  }

  /**
   * Generate printable QR code HTML with society branding
   */
  generatePrintableQRCode(url: string, societyInfo: SocietyInfo): string {
    const qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration QR Code - ${societyInfo.name}</title>
  <style>
    @media print {
      @page {
        margin: 0;
        size: A4 portrait;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .container {
      background: white;
      padding: 60px;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 600px;
    }

    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 30px;
      border-radius: 50%;
      object-fit: cover;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 16px;
      color: #1a1a1a;
    }

    .description {
      font-size: 16px;
      color: #666;
      margin: 0 0 40px;
      line-height: 1.6;
    }

    .qr-code {
      margin: 40px 0;
      padding: 20px;
      background: white;
      border: 2px solid #e5e5e5;
      border-radius: 12px;
      display: inline-block;
    }

    .qr-code img {
      display: block;
      width: 400px;
      height: 400px;
    }

    .instructions {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 30px 0 16px;
    }

    .url {
      font-size: 14px;
      color: #666;
      word-break: break-all;
      padding: 12px 20px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 20px 0;
    }

    .print-button {
      background: #000;
      color: white;
      border: none;
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      margin-top: 30px;
    }

    .print-button:hover {
      background: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    ${societyInfo.logo ? `<img src="${societyInfo.logo}" alt="${societyInfo.name} Logo" class="logo">` : ''}

    <h1>${societyInfo.name}</h1>

    ${societyInfo.description ? `<p class="description">${societyInfo.description}</p>` : ''}

    <div class="qr-code">
      <img src="${qrCodeDataUrl}" alt="Registration QR Code">
    </div>

    <p class="instructions">Scan to Join</p>
    <p style="font-size: 14px; color: #999;">Scan this QR code with your phone camera to register</p>

    <div class="url">${url}</div>

    <button class="print-button no-print" onclick="window.print()">Print QR Code</button>
  </div>
</body>
</html>
    `.trim()
  }
}
