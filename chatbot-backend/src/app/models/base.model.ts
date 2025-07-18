import {Document, Schema, Model, model, FilterQuery} from 'mongoose';

export interface BaseDocument extends Document {
    createdAt: Date;
    updatedAt: Date;
}

export abstract class BaseModel<T extends BaseDocument> {
    protected model: Model<T>;
    protected schema: Schema;

    constructor(schema: Schema, modelName: string) {
        this.schema = schema;

        // Add common fields to all models
        this.schema.add({
            createdAt: {
                type: Date,
                default: Date.now,
                required: true
            },
            updatedAt: {
                type: Date,
                default: Date.now,
                required: true
            }
        });

        // Add pre-save middleware to update updatedAt
        this.schema.pre('save', function (next) {
            this.updatedAt = new Date();
            next();
        });

        // Add pre-update middleware
        this.schema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
            this.set({updatedAt: new Date()});
            next();
        });

        this.model = model<T>(modelName, this.schema);
    }

    public getModel(): Model<T> {
        return this.model;
    }

    public async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    public async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }

    public async find(filter: FilterQuery<T> = {}): Promise<T[]> {
        return this.model.find(filter).exec();
    }

    public async create(data: Partial<T>): Promise<T> {
        return this.model.create(data);
    }

    public async updateById(id: string, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, {new: true}).exec();
    }

    public async deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }

    public async count(filter: FilterQuery<T> = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    public async exists(filter: FilterQuery<T>): Promise<boolean> {
        const count = await this.model.countDocuments(filter).exec();
        return count > 0;
    }
} 