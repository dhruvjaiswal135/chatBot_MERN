"use client";

import { useState, useEffect, useCallback } from "react";
import { serviceStatus } from "@/lib/interfaces/service-status.interface";
import fetcher from "@/lib/utils/fetcher";
import { generateQRCodeImage, isValidQRData } from "@/lib/utils/qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { QrCode, Smartphone, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";

// Constants
const POLLING_INTERVAL = 3000; // 3 seconds

// Status configurations
const STATUS_CONFIG = {
    DISABLED: {
        icon: AlertCircle,
        color: 'text-red-500',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        title: 'Service Disabled'
    },
    INITIALIZING: {
        icon: Loader2,
        color: 'text-blue-500',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        title: 'Initializing...'
    },
    AUTHENTICATED: {
        icon: CheckCircle,
        color: 'text-green-500',
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        title: 'Connected Successfully'
    },
    QR_READY: {
        icon: QrCode,
        color: 'text-blue-500',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        title: 'QR Code Ready'
    },
    ERROR: {
        icon: AlertCircle,
        color: 'text-red-500',
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        title: 'Connection Error'
    }
} as const;

interface QRScannerProps {
    initialStatus: serviceStatus;
}

export default function QRScanner({ initialStatus }: QRScannerProps) {
    const [status, setStatus] = useState<serviceStatus>(initialStatus);
    const [isPolling, setIsPolling] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);

    const generateQR = useCallback(async (qrData: string) => {
        if (!isValidQRData(qrData)) {
            console.error('Invalid QR data format');
            return;
        }

        try {
            setIsGeneratingQR(true);
            const imageUrl = await generateQRCodeImage(qrData);
            setQrImageUrl(imageUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        } finally {
            setIsGeneratingQR(false);
        }
    }, []);

    const pollStatus = useCallback(async () => {
        try {
            setIsPolling(true);
            const newStatus: serviceStatus = await fetcher('/setup/init', {
                method: 'GET'
            }, false, false);
            
            setStatus(newStatus);
            setLastUpdate(new Date());
            
            // Generate QR code if status is QR_READY and we have QR data
            if (newStatus.status === 'QR_READY' && newStatus.qrCode && !qrImageUrl) {
                await generateQR(newStatus.qrCode);
            }
            
            // Stop polling if authenticated or error
            if (newStatus.status === 'AUTHENTICATED' || newStatus.status === 'ERROR') {
                setIsPolling(false);
            }
        } catch (error) {
            console.error('Error polling status:', error);
            setIsPolling(false);
        }
    }, [generateQR, qrImageUrl]);

    // Start polling when QR is ready
    useEffect(() => {
        if (status.status === 'QR_READY') {
            const interval = setInterval(pollStatus, POLLING_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [status.status, pollStatus]);

    // Generate QR code on initial load
    useEffect(() => {
        if (status.status === 'QR_READY' && status.qrCode && !qrImageUrl) {
            generateQR(status.qrCode);
        }
    }, [status.status, status.qrCode, qrImageUrl, generateQR]);

    const currentStatusConfig = STATUS_CONFIG[status.status] || STATUS_CONFIG.INITIALIZING;
    const StatusIcon = currentStatusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Header />
                <MainCard 
                    status={status}
                    statusConfig={currentStatusConfig}
                    StatusIcon={StatusIcon}
                    qrImageUrl={qrImageUrl}
                    isGeneratingQR={isGeneratingQR}
                    isPolling={isPolling}
                    onRefresh={pollStatus}
                    lastUpdate={lastUpdate}
                />
                <Footer />
            </div>
        </div>
    );
}

// Header Component
function Header() {
    return (
        <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500 p-3 rounded-full">
                    <Smartphone className="h-8 w-8 text-white" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                WhatsApp Web Setup
            </h1>
            <p className="text-gray-600">
                Scan the QR code with your phone to connect
            </p>
        </div>
    );
}

// Main Card Component
interface MainCardProps {
    status: serviceStatus;
    statusConfig: typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG];
    StatusIcon: React.ComponentType<{ className?: string }>;
    qrImageUrl: string | null;
    isGeneratingQR: boolean;
    isPolling: boolean;
    onRefresh: () => void;
    lastUpdate: Date;
}

function MainCard({ 
    status, 
    statusConfig, 
    StatusIcon, 
    qrImageUrl, 
    isGeneratingQR, 
    isPolling, 
    onRefresh, 
    lastUpdate 
}: MainCardProps) {
    return (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color} ${status.status === 'INITIALIZING' ? 'animate-spin' : ''}`} />
                </div>
                <CardTitle className="text-lg">
                    {statusConfig.title}
                </CardTitle>
                <CardDescription className="text-sm">
                    {status.message}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <StatusBadge status={status.status} badgeClass={statusConfig.badgeClass} />
                <Separator />
                
                {status.status === 'QR_READY' && (
                    <QRCodeSection 
                        qrImageUrl={qrImageUrl}
                        isGeneratingQR={isGeneratingQR}
                        isPolling={isPolling}
                        onRefresh={onRefresh}
                    />
                )}

                {status.status === 'INITIALIZING' && <LoadingState />}
                {status.status === 'AUTHENTICATED' && <SuccessState />}
                {status.status === 'ERROR' && <ErrorState onRetry={onRefresh} />}

                <Timestamp lastUpdate={lastUpdate} isPolling={isPolling} />
            </CardContent>
        </Card>
    );
}

// Status Badge Component
function StatusBadge({ status, badgeClass }: { status: string; badgeClass: string }) {
    return (
        <div className="flex justify-center">
            <Badge variant="outline" className={`${badgeClass} font-medium`}>
                {status}
            </Badge>
        </div>
    );
}

// QR Code Section Component
interface QRCodeSectionProps {
    qrImageUrl: string | null;
    isGeneratingQR: boolean;
    isPolling: boolean;
    onRefresh: () => void;
}

function QRCodeSection({ qrImageUrl, isGeneratingQR, isPolling, onRefresh }: QRCodeSectionProps) {
    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                    Open WhatsApp on your phone and scan this QR code
                </p>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block relative">
                    {isGeneratingQR ? (
                        <div className="w-48 h-48 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : qrImageUrl ? (
                        <img 
                            src={qrImageUrl} 
                            alt="QR Code" 
                            className="w-48 h-48 object-contain"
                        />
                    ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                            <QrCode className="h-12 w-12" />
                        </div>
                    )}
                    {isPolling && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    )}
                </div>
            </div>
            
            <Instructions />
            <RefreshButton onRefresh={onRefresh} isPolling={isPolling} />
        </div>
    );
}

// Instructions Component
function Instructions() {
    return (
        <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-blue-500 mt-0.5" />
                </div>
                <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to scan:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Open WhatsApp on your phone</li>
                        <li>Go to Settings → Linked Devices</li>
                        <li>Tap &ldquo;Link a Device&rdquo;</li>
                        <li>Point your phone camera at this QR code</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

// Refresh Button Component
function RefreshButton({ onRefresh, isPolling }: { onRefresh: () => void; isPolling: boolean }) {
    return (
        <div className="text-center">
            <Button 
                onClick={onRefresh} 
                disabled={isPolling}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
            >
                <RefreshCw className={`h-4 w-4 ${isPolling ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
            </Button>
        </div>
    );
}

// Loading State Component
function LoadingState() {
    return (
        <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Setting up WhatsApp Web...</p>
        </div>
    );
}

// Success State Component
function SuccessState() {
    return (
        <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-medium">Successfully Connected!</p>
            <p className="text-sm text-gray-600 mt-2">
                You can now use WhatsApp Web
            </p>
        </div>
    );
}

// Error State Component
function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Connection Failed</p>
            <p className="text-sm text-gray-600 mt-2">
                Please try again or check your connection
            </p>
            <Button onClick={onRetry} className="mt-4" variant="outline">
                Try Again
            </Button>
        </div>
    );
}

// Timestamp Component
function Timestamp({ lastUpdate, isPolling }: { lastUpdate: Date; isPolling: boolean }) {
    return (
        <>
            <Separator />
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    Last updated: {lastUpdate.toLocaleString()}
                </p>
                {isPolling && (
                    <p className="text-xs text-blue-500 mt-1">
                        Auto-refreshing...
                    </p>
                )}
            </div>
        </>
    );
}

// Footer Component
function Footer() {
    return (
        <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
                Make sure your phone has an active internet connection
            </p>
        </div>
    );
} 