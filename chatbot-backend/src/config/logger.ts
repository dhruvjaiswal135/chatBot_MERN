import pino from 'pino';
import {config} from './app';

const pinoConfig: pino.LoggerOptions = {
    level: config.logging.level || 'info',
};

if (config.nodeEnv !== 'production') {
    pinoConfig.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    };
}

const logger = pino(pinoConfig);

export default logger;
