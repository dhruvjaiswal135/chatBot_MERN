import {Schema} from 'mongoose';
import {BaseDocument} from '../../app/models/base.model';

export interface RoleDocument extends BaseDocument {
    name: string;
    slug: string;
    permissions?: Record<string, unknown>;
    status: boolean;
    deletedAt?: Date;
    createdBy?: number;
    updatedBy?: number;
}

export const roleSchema = new Schema<RoleDocument>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50
    },
    permissions: {
        type: Schema.Types.Mixed,
        default: null
    },
    status: {
        type: Boolean,
        default: true
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

roleSchema.index({status: 1});
roleSchema.index({createdAt: 1});