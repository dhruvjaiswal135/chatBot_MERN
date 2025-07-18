import { serviceStatus } from "@/lib/interfaces/service-status.interface";
import fetcher from "@/lib/utils/fetcher";
import { redirect } from "next/navigation";
import QRScanner from "@/components/setup/qr-scanner";

/**
 * Setup page for WhatsApp Web QR code scanning
 * Fetches initial status and renders the QR scanner component
 */
export default async function SetupPage() {
    try {
        const status: serviceStatus = await fetcher('/setup/init', {
            method: 'GET'
        }, false, false);
        
        // Redirect to login if authentication is required
        if (status.auth) {
            redirect('/auth/login');
        }
        
        return <QRScanner initialStatus={status} />;
    } catch (error) {
        // Let the error boundary handle the error
        throw error;
    }
}