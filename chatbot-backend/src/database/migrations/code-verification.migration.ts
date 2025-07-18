import {Schema, Types} from 'mongoose';
import {BaseDocument} from '../../app/models/base.model';

export interface CodeVerificationDocument extends BaseDocument {
    reference: string;
    forLogin: boolean;
    phoneCode: number;
    emailCode: number;
    expired: boolean;
    verified: boolean;
    userId: Types.ObjectId;
    expiredAt: Date;
    resendAttempts: number;
    lastResentAt?: Date;
}

export const codeVerificationSchema = new Schema<CodeVerificationDocument>({
    reference: {
        type: String,
        required: true,
        unique: true
    },
    forLogin: {
        type: Boolean,
        required: true
    },
    phoneCode: {
        type: Number,
        required: true
    },
    emailCode: {
        type: Number,
        required: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiredAt: {
        type: Date,
        required: true
    },
    resendAttempts: {
        type: Number,
        default: 0
    },
    lastResentAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            return ret;
        }
    }
});

codeVerificationSchema.index({userId: 1});
codeVerificationSchema.index({expiredAt: 1});