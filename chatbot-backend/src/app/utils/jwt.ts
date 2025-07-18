import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import jwt, {SignOptions} from 'jsonwebtoken';
import {config} from '../../config/app';
import {getProjectRoot} from "./directory";

const projectRoot = getProjectRoot();

const privateKey = fs.readFileSync(path.resolve(projectRoot, 'storage/keys/api/private.key'), 'utf8');
const publicKey = fs.readFileSync(path.resolve(projectRoot, 'storage/keys/api/public.key'), 'utf8');

export interface TokenPayload {
    t: string;
    m: number; // token mode: 0 = auth, 1 = refresh
}

export interface TokenResponse {
    token: string;
    token_expiry: Date;
    keys: {
        auth: string;
        refresh: string;
    };
}

const algoOptions = {
    algorithm: 'RS256'
};

/**
 * Generate JWT access and refresh tokens
 */
export const generateTokenAndRefresh = (): TokenResponse => {
    const token = crypto.randomBytes(11).toString('hex');
    const now = new Date();

    const expiresIn = config.jwt?.expiresIn || '1m';
    const minutes = parseInt(expiresIn.replace(/[^0-9]/g, ''), 10) || 1;
    const token_expiry = new Date(now.getTime() + minutes * 60 * 1000);

    const auth = jwt.sign({t: token, m: 0}, privateKey, {
        ...algoOptions,
        expiresIn: config.jwt.expiresIn
    } as SignOptions);
    const refresh = jwt.sign({t: token, m: 1}, privateKey, {
        ...algoOptions,
        expiresIn: config.jwt.refreshExpiresIn
    } as SignOptions);

    return {token, token_expiry, keys: {auth, refresh}};
};

/**
 * Verify and decode a generic JWT token
 */
export const verifyToken = (token: string): Record<string, unknown> | null => {
    try {
        return jwt.verify(token, publicKey, {algorithms: ['RS256']}) as Record<string, unknown>;
    } catch {
        return null;
    }
};
