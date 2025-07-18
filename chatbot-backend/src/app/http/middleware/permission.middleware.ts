import { Request, Response, NextFunction } from 'express';
import { hasPermission, hasAllPermissions, hasAnyOfPermissions, UserPermissions, Permission } from '../../utils/permissions';
import { UserDocument } from '../../models/user.model';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

/**
 * Middleware to check if user has a specific permission
 * @param resource - Resource name (e.g., 'users', 'roles')
 * @param action - Action name (e.g., 'create', 'read', 'update', 'delete')
 */
export const requirePermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      const userPermissions: UserPermissions = {
        rolePermissions: (user.roleId as any)?.permissions as Permission | undefined,
        userPermissions: user.permissions as Permission | undefined
      };

      if (!hasPermission(userPermissions, resource, action)) {
        res.status(403).json({ 
          success: false, 
          message: `Insufficient permissions. Required: ${resource}:${action}` 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };
};

/**
 * Middleware to check if user has all required permissions
 * @param requiredPermissions - Object with required permissions
 */
export const requireAllPermissions = (requiredPermissions: Record<string, string[]>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      const userPermissions: UserPermissions = {
        rolePermissions: (user.roleId as any)?.permissions as Permission | undefined,
        userPermissions: user.permissions as Permission | undefined
      };

      if (!hasAllPermissions(userPermissions, requiredPermissions)) {
        res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };
};

/**
 * Middleware to check if user has at least one of the required permissions
 * @param requiredPermissions - Object with required permissions
 */
export const requireAnyPermission = (requiredPermissions: Record<string, string[]>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      const userPermissions: UserPermissions = {
        rolePermissions: (user.roleId as any)?.permissions as Permission | undefined,
        userPermissions: user.permissions as Permission | undefined
      };

      if (!hasAnyOfPermissions(userPermissions, requiredPermissions)) {
        res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };
};

/**
 * Middleware to check if user has any permission for a specific resource
 * @param resource - Resource name
 */
export const requireResourceAccess = (resource: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      const userPermissions: UserPermissions = {
        rolePermissions: (user.roleId as any)?.permissions as Permission | undefined,
        userPermissions: user.permissions as Permission | undefined
      };

      const hasAccess = userPermissions.rolePermissions?.[resource] || userPermissions.userPermissions?.[resource];
      
      if (!hasAccess) {
        res.status(403).json({ 
          success: false, 
          message: `No access to resource: ${resource}` 
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  };
}; 