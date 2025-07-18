import {RoleSeeder} from './role.seeder';
import {UserSeeder} from './user.seeder';

export class DatabaseSeeder {
    private seeders = [
        new RoleSeeder(),
        new UserSeeder()
    ];

    /**
     * Run all seeders in order
     */
    async run(): Promise<void> {
        console.log('🌱 Starting database seeding...');

        for (const seeder of this.seeders) {
            await seeder.execute();
        }

        console.log('✅ Database seeding completed successfully!');
    }

    /**
     * Run specific seeder by name
     */
    async runSeeder(seederName: string): Promise<void> {
        const seeder = this.seeders.find(s => s.constructor.name === seederName);

        if (!seeder) {
            throw new Error(`Seeder '${seederName}' not found. Available seeders: ${this.seeders.map(s => s.constructor.name).join(', ')}`);
        }

        await seeder.execute();
    }
}

// Export individual seeders for direct use
export {RoleSeeder} from './role.seeder';
export {UserSeeder} from './user.seeder';