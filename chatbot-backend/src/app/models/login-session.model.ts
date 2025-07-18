import {loginSessionSchema} from "../../database/migrations/login-session.migration";
import {LoginSessionDocument} from "../../database/migrations/login-session.migration";
import {BaseModel} from './base.model';


export class LoginSessionModel extends BaseModel<LoginSessionDocument> {
    constructor() {
        super(loginSessionSchema, 'LoginSession');
    }

    // Custom methods for LoginSession model
    public async findBySessionToken(sessionToken: string): Promise<LoginSessionDocument | null> {
        return this.model.findOne({sessionToken, status: true}).populate('userId').exec();
    }

    public async findActiveByUserId(userId: string): Promise<LoginSessionDocument[]> {
        return this.model.find({userId, status: true}).exec();
    }

    public async deactivateSession(sessionToken: string): Promise<LoginSessionDocument | null> {
        return this.model.findOneAndUpdate(
            {sessionToken},
            {status: false},
            {new: true}
        ).exec();
    }

    public async deactivateAllUserSessions(userId: string): Promise<void> {
        await this.model.updateMany(
            {userId},
            {status: false}
        ).exec();
    }

    public async updateLastUsed(sessionToken: string): Promise<LoginSessionDocument | null> {
        return this.model.findOneAndUpdate(
            {sessionToken},
            {lastUsed: new Date()},
            {new: true}
        ).exec();
    }

    public async cleanupExpiredSessions(): Promise<void> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await this.model.deleteMany({
            lastUsed: {$lt: thirtyDaysAgo}
        }).exec();
    }

    public async update(id: string, data: Partial<LoginSessionDocument>): Promise<LoginSessionDocument | null> {
        return this.updateById(id, data);
    }
}

export const loginSessionModel = new LoginSessionModel(); 