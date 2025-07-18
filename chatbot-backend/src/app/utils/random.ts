import crypto from 'node:crypto';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};

/**
 * Generate a random string of specified length
 */
export const generateRandomString = (length: number): string => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
}; 