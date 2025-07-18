export interface serviceStatus {
    auth?: boolean;
    status: 'DISABLED' | 'INITIALIZING' | 'AUTHENTICATED' | 'QR_READY' | 'ERROR';
    qrCode?: string;
    message: string;
    timestamp: Date;
  }