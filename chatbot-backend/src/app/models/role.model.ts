import {roleSchema} from '../../database/migrations/role.migration';
import type {RoleDocument} from '../../database/migrations/role.migration';
import {BaseModel} from './base.model';

export {RoleDocument};

export class RoleModel extends BaseModel<RoleDocument> {
    constructor() {
        super(roleSchema, 'Role');
    }

    // Custom methods for Role model
    public async findBySlug(slug: string): Promise<RoleDocument | null> {
        return this.model.findOne({slug, status: true}).exec();
    }

    public async findActiveRoles(): Promise<RoleDocument[]> {
        return this.model.find({status: true}).exec();
    }
}

export const roleModel = new RoleModel(); 