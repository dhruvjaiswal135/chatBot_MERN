import { codeVerificationSchema } from '../../database/migrations/code-verification.migration';
import type { CodeVerificationDocument } from '../../database/migrations/code-verification.migration';
import { BaseModel } from './base.model';

export { CodeVerificationDocument };

export class CodeVerificationModel extends BaseModel<CodeVerificationDocument> {
  constructor() {
    super(codeVerificationSchema, 'CodeVerification');
  }

  // Custom methods for CodeVerification model
  public async findByReference(reference: string): Promise<CodeVerificationDocument | null> {
    return this.model.findOne({ reference }).exec();
  }

  public async findActiveByUserId(userId: string): Promise<CodeVerificationDocument[]> {
    return this.model.find({ 
      userId, 
      expired: false, 
      verified: false 
    }).exec();
  }

  public async markAsExpired(reference: string): Promise<CodeVerificationDocument | null> {
    return this.model.findOneAndUpdate(
      { reference },
      { expired: true },
      { new: true }
    ).exec();
  }

  public async markAsVerified(reference: string): Promise<CodeVerificationDocument | null> {
    return this.model.findOneAndUpdate(
      { reference },
      { verified: true },
      { new: true }
    ).exec();
  }

  public async incrementResendAttempts(reference: string): Promise<CodeVerificationDocument | null> {
    return this.model.findOneAndUpdate(
      { reference },
      { 
        $inc: { resendAttempts: 1 },
        lastResentAt: new Date()
      },
      { new: true }
    ).exec();
  }

  public async update(id: string, data: Partial<CodeVerificationDocument>): Promise<CodeVerificationDocument | null> {
    return this.updateById(id, data);
  }

  public async delete(id: string): Promise<CodeVerificationDocument | null> {
    return this.deleteById(id);
  }
}

export const codeVerificationModel = new CodeVerificationModel(); 