export interface Permission {
    [resource: string]: {
        [action: string]: boolean;
    };
}

export interface UserPermissions {
    rolePermissions?: Permission | undefined;
    userPermissions?: Permission | undefined;
}

/**
 * Check if user has permission for a specific resource and action
 * @param userPermissions - User's permissions object
 * @param resource - Resource name (e.g., 'users', 'roles', 'settings')
 * @param action - Action name (e.g., 'create', 'read', 'update', 'delete')
 * @returns boolean - True if user has permission, false otherwise
 */
export const hasPermission = (
    userPermissions: UserPermissions,
    resource: string,
    action: string
): boolean => {
    // Check user-specific permissions first (override role permissions)
    if (userPermissions.userPermissions?.[resource]?.[action] !== undefined) {
        return userPermissions.userPermissions[resource][action];
    }

    // Check role permissions
    if (userPermissions.rolePermissions?.[resource]?.[action] !== undefined) {
        return userPermissions.rolePermissions[resource][action];
    }

    // Default to false if no permission is found
    return false;
};

/**
 * Check if user has any permission for a specific resource
 * @param userPermissions - User's permissions object
 * @param resource - Resource name
 * @returns boolean - True if user has any permission for the resource
 */
export const hasAnyPermission = (
    userPermissions: UserPermissions,
    resource: string
): boolean => {
    const rolePerms = userPermissions.rolePermissions?.[resource];
    const userPerms = userPermissions.userPermissions?.[resource];

    // Check if any permission is true in role permissions
    if (rolePerms && Object.values(rolePerms).some(perm => perm === true)) {
        return true;
    }

    // Check if any permission is true in user permissions
    if (userPerms && Object.values(userPerms).some(perm => perm === true)) {
        return true;
    }

    return false;
};

/**
 * Get all permissions for a specific resource
 * @param userPermissions - User's permissions object
 * @param resource - Resource name
 * @returns object - All permissions for the resource
 */
export const getResourcePermissions = (
    userPermissions: UserPermissions,
    resource: string
): Record<string, boolean> => {
    const rolePerms = userPermissions.rolePermissions?.[resource] || {};
    const userPerms = userPermissions.userPermissions?.[resource] || {};

    // Merge role and user permissions, with user permissions taking precedence
    return {...rolePerms, ...userPerms};
};

/**
 * Check if user has all required permissions
 * @param userPermissions - User's permissions object
 * @param requiredPermissions - Object with required permissions
 * @returns boolean - True if user has all required permissions
 */
export const hasAllPermissions = (
    userPermissions: UserPermissions,
    requiredPermissions: Record<string, string[]>
): boolean => {
    for (const [resource, actions] of Object.entries(requiredPermissions)) {
        for (const action of actions) {
            if (!hasPermission(userPermissions, resource, action)) {
                return false;
            }
        }
    }
    return true;
};

/**
 * Check if user has at least one of the required permissions
 * @param userPermissions - User's permissions object
 * @param requiredPermissions - Object with required permissions
 * @returns boolean - True if user has at least one required permission
 */
export const hasAnyOfPermissions = (
    userPermissions: UserPermissions,
    requiredPermissions: Record<string, string[]>
): boolean => {
    for (const [resource, actions] of Object.entries(requiredPermissions)) {
        for (const action of actions) {
            if (hasPermission(userPermissions, resource, action)) {
                return true;
            }
        }
    }
    return false;
}; 