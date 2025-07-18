import {passwordSchema} from '../../database/migrations/password.migration';
import type {PasswordDocument} from '../../database/migrations/password.migration';
import {BaseModel} from './base.model';

export {PasswordDocument};

export class PasswordModel extends BaseModel<PasswordDocument> {
    constructor() {
        super(passwordSchema, 'Password');
    }

    // Custom methods for Password model
    public async findActiveByUserId(userId: string): Promise<PasswordDocument | null> {
        return this.model.findOne({
            userId,
            status: true,
            expired: false,
            expiredAt: {$gt: new Date()}
        }).exec();
    }

    public async deactivateAllUserPasswords(userId: string): Promise<void> {
        await this.model.updateMany(
            {userId},
            {status: false}
        ).exec();
    }

    public async markAsExpired(passwordId: string): Promise<PasswordDocument | null> {
        return this.model.findByIdAndUpdate(
            passwordId,
            {expired: true},
            {new: true}
        ).exec();
    }

    public async cleanupExpiredPasswords(): Promise<void> {
        await this.model.deleteMany({
            expiredAt: {$lt: new Date()}
        }).exec();
    }
}

export const passwordModel = new PasswordModel(); 