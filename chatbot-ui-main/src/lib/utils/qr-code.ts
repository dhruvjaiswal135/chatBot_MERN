import QRCode from 'qrcode';

// QR Code configuration
const QR_CONFIG = {
    width: 256,
    margin: 2,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    }
} as const;

/**
 * Generates a QR code image from raw data
 * @param qrData - The raw QR code data string
 * @returns Promise<string> - Data URL of the generated QR code image
 */
export async function generateQRCodeImage(qrData: string): Promise<string> {
    if (!qrData?.trim()) {
        throw new Error('QR data is required');
    }

    try {
        const qrImageDataUrl = await QRCode.toDataURL(qrData, QR_CONFIG);
        return qrImageDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code image');
    }
}

/**
 * Validates if the QR data looks like a valid WhatsApp QR code
 * @param qrData - The QR data to validate
 * @returns boolean - True if the data appears to be valid
 */
export function isValidQRData(qrData: string): boolean {
    if (!qrData?.trim()) {
        return false;
    }
    
    // WhatsApp QR codes typically contain base64-like data with commas
    // and are usually longer than 50 characters
    return qrData.includes(',') && qrData.length > 50;
} 