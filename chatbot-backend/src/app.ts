import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import {errorHandler} from './app/http/middleware/error.middleware';
import {notFoundHandler} from './app/http/middleware/not-found.middleware';
import routeProvider from './app/providers/route.provider';
import {databaseProvider} from './app/providers/database.provider';
import {config} from './config/app';
import logger from './config/logger';
import * as console from "node:console";

const app = express();

// Initialize database connection
const initializeDatabase = async () => {
    try {
        await databaseProvider.connect();
    } catch {
        process.exit(1);
    }
};

// Initialize database on startup
initializeDatabase().then(() => console.log('✅ MongoDB connected successfully'));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/', limiter);

// Body parsing middleware
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({extended: true, limit: '5mb'}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(pinoHttp({logger}));

// Static content access code.
app.use('/', express.static('storage/assets/public'));

app.use('/', routeProvider);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);


export default app; 