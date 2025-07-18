import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {getProjectRoot} from "./directory";

const projectRoot = getProjectRoot();

// Read encryption keys
const publicKey = fs.readFileSync(path.resolve(projectRoot, 'storage/keys/encryption/public.key'), 'utf8');
const privateKey = fs.readFileSync(path.resolve(projectRoot, 'storage/keys/encryption/private.key'), 'utf8');

/**
 * Encrypt a password using the public key
 * @param password - Plain text password to encrypt
 * @returns Encrypted password (base64 encoded)
 */
export const encryptPassword = (password: string): string => {
    const buffer = Buffer.from(password, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        buffer
    );
    return encrypted.toString('base64');
};

/**
 * Decrypt a password using the private key
 * @param encryptedPassword - Encrypted password (base64 encoded)
 * @returns Decrypted password
 */
export const decryptPassword = (encryptedPassword: string): string => {
    const buffer = Buffer.from(encryptedPassword, 'base64');
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        buffer
    );
    return decrypted.toString('utf8');
};

/**
 * Verify if a plain text password matches an encrypted password
 * @param plainPassword - Plain text password to verify
 * @param encryptedPassword - Encrypted password to compare against
 * @returns True if passwords match, false otherwise
 */
export const verifyPassword = (plainPassword: string, encryptedPassword: string): boolean => {
    try {
        const decrypted = decryptPassword(encryptedPassword);
        return plainPassword === decrypted;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}; 