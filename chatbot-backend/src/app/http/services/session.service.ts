import {loginSessionModel, LoginSessionDocument} from "../../models/login-session.model";

export class SessionService {
    async getSession(sessionId: string): Promise<any> {
        try {
            const sessionData = await loginSessionModel.findBySessionToken(sessionId) as LoginSessionDocument;
            if (!sessionData) {
                return false;
            }
            return sessionData;
        } catch {
            return false;
        }
    }
}