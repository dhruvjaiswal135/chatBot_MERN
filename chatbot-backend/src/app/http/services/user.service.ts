import {Types} from 'mongoose';
import {userModel, UserDocument, UserStatus} from '../../models/user.model';
import {passwordModel} from '../../models';
import {roleModel} from '../../models';
import {encryptPassword, verifyPassword} from '../../utils/encryption';

export interface CreateUserData {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    password: string;
    roleId: string;
    avatar?: string;
    permissions?: Record<string, unknown>;
}

export interface UpdateUserData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    roleId?: string;
    avatar?: string;
    permissions?: Record<string, unknown>;
    status?: UserStatus;
    remark?: string;
}

export interface UserListOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: UserStatus;
    roleId?: string;
}

export interface UserFilter {
    $or?: Array<{
        firstName?: { $regex: string; $options: string };
        lastName?: { $regex: string; $options: string };
        email?: { $regex: string; $options: string };
        phone?: { $regex: string; $options: string };
    }>;
    status?: UserStatus;
    roleId?: Types.ObjectId;
    deletedAt?: null;
}

export interface UserSort {
    [key: string]: 1 | -1;
}

export class UserService {
    async list(options: UserListOptions = {}): Promise<{
        users: UserDocument[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const {page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', status, roleId} = options;
        const skip = (page - 1) * limit;

        // Build filter
        const filter: UserFilter = {deletedAt: null};

        if (search) {
            filter.$or = [
                {firstName: {$regex: search, $options: 'i'}},
                {lastName: {$regex: search, $options: 'i'}},
                {email: {$regex: search, $options: 'i'}},
                {phone: {$regex: search, $options: 'i'}}
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (roleId) {
            filter.roleId = new Types.ObjectId(roleId);
        }

        // Build sort
        const sort: UserSort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute queries
        const [users, total] = await Promise.all([
            userModel.getModel().find(filter)
                .populate('roleId')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            userModel.count(filter)
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async create(userData: CreateUserData): Promise<UserDocument> {
        // Check if user already exists
        const existingUser = await userModel.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Check if phone is provided and unique
        if (userData.phone) {
            const existingPhoneUser = await userModel.findByPhone(userData.phone);
            if (existingPhoneUser) {
                throw new Error('User with this phone number already exists');
            }
        }

        // Verify role exists
        const role = await roleModel.findById(userData.roleId);
        if (!role) {
            throw new Error('Invalid role ID');
        }

        // Create user without password
        const userDataToCreate: Partial<UserDocument> = {
            firstName: userData.firstName,
            email: userData.email,
            roleId: new Types.ObjectId(userData.roleId),
            avatar: userData.avatar || 'avatar.png',
            status: UserStatus.ACTIVE
        };

        if (userData.lastName !== undefined) {
            userDataToCreate.lastName = userData.lastName;
        }
        if (userData.phone !== undefined) {
            userDataToCreate.phone = userData.phone;
        }
        if (userData.permissions !== undefined) {
            userDataToCreate.permissions = userData.permissions;
        }

        const user = await userModel.create(userDataToCreate);

        // Create password record using RSA encryption
        const encryptedPassword = encryptPassword(userData.password);

        await passwordModel.create({
            userId: user._id as Types.ObjectId,
            password: encryptedPassword,
            salt: '', // Not needed with RSA encryption
            status: true,
            expired: false,
            expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        });

        return user.populate('roleId');
    }

    async findById(id: string): Promise<UserDocument | null> {
        return userModel.findById(id);
    }

    async findByEmail(email: UserDocument['email']): Promise<UserDocument | null> {
        return userModel.findByEmail(email);
    }

    async findByPhone(phone: string): Promise<UserDocument | null> {
        return userModel.findByPhone(phone);
    }

    async update(id: string, updateData: UpdateUserData): Promise<UserDocument | null> {
        // If updating email, check if it's already taken
        if (updateData.email) {
            const existingUser = await userModel.findByEmail(updateData.email);
            if (existingUser && (existingUser._id as Types.ObjectId).toString() !== id) {
                throw new Error('Email is already taken by another user');
            }
        }

        // If updating phone, check if it's already taken
        if (updateData.phone) {
            const existingUser = await userModel.findByPhone(updateData.phone);
            if (existingUser && (existingUser._id as Types.ObjectId).toString() !== id) {
                throw new Error('Phone number is already taken by another user');
            }
        }

        // If updating role, verify it exists
        if (updateData.roleId) {
            const role = await roleModel.findById(updateData.roleId);
            if (!role) {
                throw new Error('Invalid role ID');
            }
        }

        // Prepare update data
        const updateFields: Partial<UserDocument> = {};
        if (updateData.firstName !== undefined) {
            updateFields.firstName = updateData.firstName;
        }
        if (updateData.lastName !== undefined) {
            updateFields.lastName = updateData.lastName;
        }
        if (updateData.email !== undefined) {
            updateFields.email = updateData.email;
        }
        if (updateData.phone !== undefined) {
            updateFields.phone = updateData.phone;
        }
        if (updateData.roleId !== undefined) {
            updateFields.roleId = new Types.ObjectId(updateData.roleId);
        }
        if (updateData.avatar !== undefined) {
            updateFields.avatar = updateData.avatar;
        }
        if (updateData.permissions !== undefined) {
            updateFields.permissions = updateData.permissions;
        }
        if (updateData.status !== undefined) {
            updateFields.status = updateData.status;
        }
        if (updateData.remark !== undefined) {
            updateFields.remark = updateData.remark;
        }

        // If updating password, create new password record
        if (updateData.password) {
            const encryptedPassword = encryptPassword(updateData.password);

            // Deactivate old passwords
            await passwordModel.deactivateAllUserPasswords(id);

            // Create new password record
            await passwordModel.create({
                userId: new Types.ObjectId(id),
                password: encryptedPassword,
                salt: '', // Not needed with RSA encryption
                status: true,
                expired: false,
                expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            });
        }

        return userModel.updateById(id, updateFields);
    }

    async delete(id: string): Promise<UserDocument | null> {
        // Soft delete the user
        return userModel.softDelete(id);
    }

    async hardDelete(id: string): Promise<UserDocument | null> {
        // Hard delete the user and all related records
        await passwordModel.getModel().deleteMany({userId: new Types.ObjectId(id)});
        return userModel.deleteById(id);
    }

    async updateLastLogin(userId: string): Promise<UserDocument | null> {
        return userModel.updateLastLogin(userId);
    }

    async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
        const activePassword = await passwordModel.findActiveByUserId((user._id as Types.ObjectId).toString());
        if (!activePassword) {
            return false;
        }

        return verifyPassword(password, activePassword.password);
    }

    async updateStatus(userId: string, status: UserStatus): Promise<UserDocument | null> {
        return userModel.updateStatus(userId, status);
    }

    async incrementLoginAttempts(userId: string): Promise<UserDocument | null> {
        return userModel.incrementLoginAttempts(userId);
    }

    async resetLoginAttempts(userId: string): Promise<UserDocument | null> {
        return userModel.resetLoginAttempts(userId);
    }

    async findByRole(roleId: string): Promise<UserDocument[]> {
        return userModel.findByRole(roleId);
    }

    async findActiveUsers(): Promise<UserDocument[]> {
        return userModel.findActiveUsers();
    }
}