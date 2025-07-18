import {Schema, Types} from 'mongoose';
import {BaseDocument} from '../../app/models/base.model';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    BANNED = 'BANNED'
}

export interface UserDocument extends BaseDocument {
    firstName: string;
    lastName?: string;
    email: string;
    emailVerifiedAt?: Date;
    phone?: string;
    phoneVerifiedAt?: Date;
    avatar?: string;
    mfa_enabled: boolean;
    mfa_secret?: string;
    loginAttempts: number;
    inactiveTill?: Date;
    roleId: Types.ObjectId;
    permissions?: Record<string, unknown>;
    status: UserStatus;
    remark?: string;
    deletedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
}

export const userSchema = new Schema<UserDocument>({
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 100,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 20,
        default: null
    },
    phoneVerifiedAt: {
        type: Date,
        default: null
    },
    avatar: {
        type: String,
        default: 'avatar.png',
        maxlength: 255
    },
    mfa_enabled: {
        type: Boolean,
        default: false
    },
    mfa_secret: {
        type: String,
        maxlength: 32,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    inactiveTill: {
        type: Date,
        default: null
    },
    roleId: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    permissions: {
        type: Schema.Types.Mixed,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE
    },
    remark: {
        type: String,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: Number,
        default: null
    },
    updatedBy: {
        type: Number,
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

userSchema.index({phone: 1});
userSchema.index({roleId: 1});
userSchema.index({status: 1});
userSchema.index({createdAt: 1});