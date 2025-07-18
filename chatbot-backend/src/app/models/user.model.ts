import {UserStatus, userSchema} from "../../database/migrations/user.migration";
import type {UserDocument} from "../../database/migrations/user.migration";
import {BaseModel} from './base.model';

export {UserDocument, UserStatus};

export class UserModel extends BaseModel<UserDocument> {
    constructor() {
        super(userSchema, 'User');
    }

    // Custom methods for User model
    public async findByEmail(email: string): Promise<UserDocument | null> {
        return this.model.findOne({email: email.toLowerCase()}).populate('roleId').exec();
    }

    public async findByPhone(phone: string): Promise<UserDocument | null> {
        return this.model.findOne({phone}).populate('roleId').exec();
    }

    public async findActiveUsers(): Promise<UserDocument[]> {
        return this.model.find({status: UserStatus.ACTIVE}).populate('roleId').exec();
    }

    public async findByRole(roleId: string): Promise<UserDocument[]> {
        return this.model.find({roleId, status: UserStatus.ACTIVE}).populate('roleId').exec();
    }

    public async updateLastLogin(userId: string): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(
            userId,
            {lastLoginAt: new Date()},
            {new: true}
        ).populate('roleId').exec();
    }

    public async incrementLoginAttempts(userId: string): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(
            userId,
            {$inc: {loginAttempts: 1}},
            {new: true}
        ).populate('roleId').exec();
    }

    public async resetLoginAttempts(userId: string): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(
            userId,
            {loginAttempts: 0},
            {new: true}
        ).populate('roleId').exec();
    }

    public async updateStatus(userId: string, status: UserStatus): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(
            userId,
            {status},
            {new: true}
        ).populate('roleId').exec();
    }

    public async softDelete(userId: string): Promise<UserDocument | null> {
        return this.model.findByIdAndUpdate(
            userId,
            {deletedAt: new Date()},
            {new: true}
        ).populate('roleId').exec();
    }

    public async findNotDeleted(filter: Record<string, unknown> = {}): Promise<UserDocument[]> {
        return this.model.find({...filter, deletedAt: null}).populate('roleId').exec();
    }

    public async update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null> {
        return this.updateById(id, data);
    }
}

export const userModel = new UserModel();
