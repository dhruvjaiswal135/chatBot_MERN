import {BaseSeeder} from './base.seeder';
import {userModel, roleModel, passwordModel} from '../../app/models';
import {encryptPassword} from '../../app/utils/encryption';
import {UserStatus} from '../migrations/user.migration';
import {Types} from 'mongoose';
import crypto from 'node:crypto';

export class UserSeeder extends BaseSeeder {
    async run(): Promise<void> {
        // First, ensure roles exist
        const superAdminRole = await roleModel.findBySlug('super-admin');
        if (!superAdminRole) {
            throw new Error('Super Admin role not found. Please run RoleSeeder first.');
        }

        const adminUser = {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@example.com',
            emailVerifiedAt: new Date(),
            phone: '+1234567890',
            phoneVerifiedAt: new Date(),
            avatar: 'admin-avatar.png',
            mfa_enabled: false,
            loginAttempts: 0,
            roleId: superAdminRole._id as Types.ObjectId,
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
            status: UserStatus.ACTIVE,
            remark: 'System super admin user'
        };

        // Check if admin user already exists
        const existingUser = await userModel.findByEmail(adminUser.email);

        if (!existingUser) {
            // Create the user
            const newUser = await userModel.create(adminUser);

            // Create password for the user
            const password = 'admin123'; // Default password
            const encryptedPassword = encryptPassword(password);
            const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt

            await passwordModel.create({
                userId: newUser._id as Types.ObjectId,
                password: encryptedPassword,
                salt,
                status: true,
                expired: false,
                expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            });

            console.log(`✅ Created super admin user: ${adminUser.email}`);
            console.log(`🔑 Default password: ${password}`);
            console.log(`⚠️ Please change the password after first login!`);
        } else {
            console.log(`⏭️ Super admin user already exists: ${adminUser.email}`);
        }
    }
} 