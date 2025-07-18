import {Request, Response, NextFunction} from 'express';
import {verifyToken} from "../../utils/jwt";
import {SessionService} from "../services/session.service";
import {sendErrorResponse} from "../../utils/response";
import {UserDocument} from "../../../database/migrations/user.migration";
import {LoginSessionDocument} from "../../../database/migrations/login-session.migration";

export interface AuthenticatedRequest extends Request {
    user?: UserDocument;
    session?: LoginSessionDocument;
}

const authMiddleware = (isRefresh: boolean = false) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const headerToken = req.headers.authorization;
    if (!headerToken || !headerToken.startsWith('Bearer ')) {
        return sendErrorResponse(res, isRefresh ? 'Refresh token required' : 'Access token required', {}, 401);
    }
    const authKey = headerToken.substring(7);
    const decoded = verifyToken(authKey) as {
        t: string;
        m: number;
    };
    if (!decoded) {
        return sendErrorResponse(res, isRefresh ? 'Refresh token invalid or expired' : 'Access token invalid or expired', {}, 401);
    }
    const sessionGuard = new SessionService();
    const session: boolean | LoginSessionDocument = await sessionGuard.getSession(decoded.t);
    if (!session || typeof session === 'boolean') {
        return sendErrorResponse(res, isRefresh ? 'Refresh session not found or invalidated' : 'Access session not found or invalidated', {}, 401);
    }
    if (!session.status) {
        return sendErrorResponse(res, 'Session is inactive', {}, 401);
    }
    req.user = session.userId as unknown as UserDocument;
    req.session = session;
    next();
};

export const authCheck = authMiddleware(false);
export const authRefresh = authMiddleware(true);