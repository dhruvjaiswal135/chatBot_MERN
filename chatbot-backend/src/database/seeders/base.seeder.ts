import {DatabaseProvider} from '../../app/providers/database.provider';

export abstract class BaseSeeder {
    protected db: DatabaseProvider;

    constructor() {
        this.db = DatabaseProvider.getInstance();
    }

    /**
     * Connect to database
     */
    protected async connect(): Promise<void> {
        await this.db.connect();
    }

    /**
     * Disconnect from database
     */
    protected async disconnect(): Promise<void> {
        await this.db.disconnect();
    }

    /**
     * Run the seeder
     */
    abstract run(): Promise<void>;

    /**
     * Execute the seeder with connection management
     */
    async execute(): Promise<void> {
        try {
            console.log(`Starting ${this.constructor.name}...`);
            await this.connect();
            await this.run();
            console.log(`${this.constructor.name} completed successfully!`);
        } catch (error) {
            console.error(`Error in ${this.constructor.name}:`, error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
} 