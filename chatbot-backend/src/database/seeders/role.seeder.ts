import {BaseSeeder} from './base.seeder';
import {roleModel} from '../../app/models';

export class RoleSeeder extends BaseSeeder {
    async run(): Promise<void> {
        const roles = [
            {
                name: 'Super Admin',
                slug: 'super-admin',
                permissions: {
                    users: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    },
                    roles: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    },
                    settings: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    },
                    analytics: {
                        read: true,
                        export: true
                    },
                    system: {
                        manage: true,
                        backup: true,
                        restore: true
                    },
                    profile: {
                        read: true,
                        update: true,
                        delete: true
                    },
                    chat: {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    }
                },
                status: true
            },
            {
                name: 'Admin',
                slug: 'admin',
                permissions: {
                    users: {
                        create: true,
                        read: true,
                        update: true,
                        delete: false
                    },
                    roles: {
                        create: false,
                        read: true,
                        update: false,
                        delete: false
                    },
                    settings: {
                        create: false,
                        read: true,
                        update: true,
                        delete: false
                    },
                    analytics: {
                        read: true,
                        export: false
                    },
                    system: {
                        manage: false,
                        backup: false,
                        restore: false
                    },
                    profile: {
                        read: true,
                        update: true,
                        delete: false
                    },
                    chat: {
                        create: true,
                        read: true,
                        update: true,
                        delete: false
                    }
                },
                status: true
            },
            {
                name: 'User',
                slug: 'user',
                permissions: {
                    users: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false
                    },
                    roles: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false
                    },
                    settings: {
                        create: false,
                        read: false,
                        update: false,
                        delete: false
                    },
                    analytics: {
                        read: false,
                        export: false
                    },
                    system: {
                        manage: false,
                        backup: false,
                        restore: false
                    },
                    profile: {
                        read: true,
                        update: true,
                        delete: false
                    },
                    chat: {
                        create: true,
                        read: true,
                        update: false,
                        delete: false
                    }
                },
                status: true
            }
        ];

        for (const roleData of roles) {
            const existingRole = await roleModel.findBySlug(roleData.slug);

            if (!existingRole) {
                await roleModel.create(roleData);
                console.log(`✅ Created role: ${roleData.name}`);
            } else {
                console.log(`⏭️ Role already exists: ${roleData.name}`);
            }
        }
    }
} 