import {Schema, Types} from 'mongoose';
import {BaseDocument} from '../../app/models/base.model';

export interface PasswordDocument extends BaseDocument {
    userId: Types.ObjectId;
    password: string;
    salt: string;
    status: boolean;
    expired: boolean;
    expiredAt: Date;
}

export const passwordSchema = new Schema<PasswordDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true,
        maxlength: 32
    },
    status: {
        type: Boolean,
        default: true
    },
    expired: {
        type: Boolean,
        default: false
    },
    expiredAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            // Don't expose password and salt in JSON responses
            delete ret.password;
            delete ret.salt;
            return ret;
        }
    }
});

passwordSchema.index({userId: 1});
passwordSchema.index({expiredAt: 1});