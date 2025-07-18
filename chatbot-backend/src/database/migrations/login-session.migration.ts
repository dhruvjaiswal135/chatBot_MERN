import {Schema, Types} from 'mongoose';
import {BaseDocument} from '../../app/models/base.model';

export interface LoginSessionDocument extends BaseDocument {
    userId: Types.ObjectId;
    sessionToken: string;
    userAgent: Record<string, unknown>;
    ipAddress: string;
    status: boolean;
    lastUsed: Date;
}

export const loginSessionSchema = new Schema<LoginSessionDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionToken: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255
    },
    userAgent: {
        type: Schema.Types.Mixed,
        required: true
    },
    ipAddress: {
        type: String,
        required: true,
        maxlength: 45
    },
    status: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            return ret;
        }
    }
});

loginSessionSchema.index({userId: 1});
loginSessionSchema.index({lastUsed: 1});