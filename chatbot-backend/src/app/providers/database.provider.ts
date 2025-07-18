import mongoose from 'mongoose';
import {config} from '../../config/app';

export class DatabaseProvider {
    private static instance: DatabaseProvider;
    private isConnected = false;

    private constructor() {
    }

    public static getInstance(): DatabaseProvider {
        if (!DatabaseProvider.instance) {
            DatabaseProvider.instance = new DatabaseProvider();
        }
        return DatabaseProvider.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            return;
        }
        try {
            mongoose.set('strictQuery', false);
            await mongoose.connect(config.database.uri, config.database.options);
            this.isConnected = true;
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
                this.isConnected = false;
            });
            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });
            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
                this.isConnected = true;
            });
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose.connection.close();
            this.isConnected = false;
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
}

export const databaseProvider = DatabaseProvider.getInstance(); 