import dotenv from 'dotenv';
import type {ConnectOptions} from 'mongoose';

dotenv.config();

export interface AppConfig {
    port: number;
    nodeEnv: string;
    appName: string;
    appUrl: string;
    version: number;
    cors: {
        origin: string | string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    jwt: {
        expiresIn: string;
        refreshExpiresIn: string;
    };
    database: {
        uri: string;
        options: ConnectOptions;
    };
    logging: {
        level: string;
    };
}

export const config: AppConfig = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    appName: process.env.APP_NAME || 'Chatbot Backend',
    appUrl: process.env.APP_URL || 'http://localhost:3001',
    version: parseInt(process.env.APP_VERSION || '1', 10),
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
    },
    jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '72h'
    },
    database: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://thealokkumarsingh:Alok8800@twitter.mjmla.mongodb.net/chatbot_db?retryWrites=true&w=majority',
        options: {
            maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
            serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '60000', 10),
            socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '60000', 10),
            connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT || '60000', 10),
            retryWrites: true,
            w: 'majority' as const
        }
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
}; 