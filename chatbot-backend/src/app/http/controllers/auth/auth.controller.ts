import {Request, Response} from 'express';
import {validateInput} from '@th3hero/request-validator';
import {UserService} from "../../services/user.service";
import {verifyPassword} from "../../../utils/encryption";
import {generateTokenAndRefresh} from "../../../utils/jwt";
import {passwordModel} from "../../../models";
import {codeVerificationModel} from "../../../models";
import {LoginSessionDocument, loginSessionModel} from '../../../models/login-session.model';
import {UserDocument} from '../../../models/user.model';
import {generateOTP, generateRandomString} from '../../../utils/random';
import {sendSuccessResponse, sendErrorResponse} from '../../../utils/response';
import {Types} from 'mongoose';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
    user?: UserDocument;
    session?: LoginSessionDocument
}

// Validation schemas - using the correct format for @th3hero/request-validator
const loginSchema = {
    email: 'required|email',
    password: 'required|min:1'
};

const loginValidateSchema = {
    reference: 'required|min:1',
    code: 'required|digits:6'
};

const resendOTPSchema = {
    reference: 'required|min:1'
};

// Constants
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_DAYS = 1;
const OTP_EXPIRY_MINUTES = 10;

export class AuthController {
    private readonly userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    /**
     * Handle failed login attempts
     */
    private async handleFailedLogin(userInfo: UserDocument): Promise<void> {
        const attempt = (userInfo.loginAttempts || 0) + 1;
        if (attempt >= MAX_LOGIN_ATTEMPTS) {
            const inactiveTill = new Date();
            inactiveTill.setDate(inactiveTill.getDate() + LOCKOUT_DURATION_DAYS);
            await this.userService.incrementLoginAttempts(userInfo._id?.toString() || '');
        } else {
            await this.userService.incrementLoginAttempts(userInfo._id?.toString() || '');
        }
    }

    /**
     * Create OTP verification record
     */
    private async createOTPVerification(userId: string): Promise<{ reference: string; code: number }> {
        const code = generateOTP();
        const reference = generateRandomString(64);
        await codeVerificationModel.create({
            reference,
            forLogin: true,
            phoneCode: code,
            emailCode: code,
            userId: new Types.ObjectId(userId),
            expiredAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
            lastResentAt: new Date()
        });
        return {reference, code};
    }

    /**
     * Validate user status and check for lockout
     */
    private async validateUserStatus(userInfo: UserDocument): Promise<void> {
        if ((userInfo.loginAttempts || 0) >= MAX_LOGIN_ATTEMPTS) {
            if (userInfo.inactiveTill && new Date(userInfo.inactiveTill) < new Date()) {
                await this.userService.resetLoginAttempts(userInfo._id?.toString() || '');
            } else {
                const lockoutTime = userInfo.inactiveTill?.toLocaleString('en-US') || 'unknown time';
                throw new Error(`Account locked till: ${lockoutTime}`);
            }
        }
    }

    /**
     * Initial login step - validates credentials and sends OTP
     */
    public login = async (req: Request, res: Response): Promise<void> => {
        try {
            const validation = await validateInput(req, loginSchema);
            if (validation.failed) return sendErrorResponse(res, 'Validation failed', validation.errors, 422);
            const {email, password} = req.body;
            const userInfo = await this.userService.findByEmail(email);
            if (!userInfo) return sendErrorResponse(res, 'Invalid combination of credentials', null, 403);
            // Validate user status and check lockout
            try {
                await this.validateUserStatus(userInfo);
            } catch (error) {
                return sendErrorResponse(res, (error as Error).message, null, 401);
            }
            const passwordRecord = await passwordModel.findActiveByUserId(userInfo._id?.toString() || '');
            if (!passwordRecord) return sendErrorResponse(res, 'Invalid combination of credentials', null, 401);
            const isValidPassword = verifyPassword(password, passwordRecord.password);
            if (!isValidPassword) {
                await this.handleFailedLogin(userInfo);
                return sendErrorResponse(res, 'Invalid combination of credentials', null, 401);
            }
            await this.userService.resetLoginAttempts(userInfo._id?.toString() || '');
            // Handle MFA
            if (!userInfo.mfa_enabled) {
                const {reference, code} = await this.createOTPVerification(userInfo._id?.toString() || '');
                // TODO: Send OTP via email/SMS here
                console.log(`OTP for ${email}: ${code}`);
                return sendSuccessResponse(res, 'OTP sent successfully', {
                    reference,
                    user: {email: userInfo.email}
                });
            } else {
                // TODO: Implement Google Authenticator logic
                return sendErrorResponse(res, 'Google Authenticator not implemented', null, 501);
            }
        } catch (error) {
            console.error('Login error:', error);
            return sendErrorResponse(res, 'An error occurred during login', null, 500);
        }
    };

    /**
     * Validate OTP and complete login
     */
    public loginValidate = async (req: Request, res: Response): Promise<void> => {
        try {
            const validation = await validateInput(req, loginValidateSchema);
            if (validation.failed) {
                return sendErrorResponse(res, 'Validation failed', validation.errors, 400);
            }

            const {reference, code} = req.body;

            // Find code verification
            const codeVerification = await codeVerificationModel.findByReference(reference);
            if (!codeVerification) {
                return sendErrorResponse(res, 'Invalid reference', null, 401);
            }

            // Check if OTP is expired
            if (codeVerification.expiredAt && new Date(codeVerification.expiredAt) < new Date()) {
                return sendErrorResponse(res, 'OTP expired', null, 401);
            }

            // Verify OTP code
            if (codeVerification.emailCode !== parseInt(code)) {
                return sendErrorResponse(res, 'Invalid OTP', null, 401);
            }

            // Delete the used OTP
            await codeVerificationModel.delete(codeVerification._id?.toString() || '');

            // Get user information
            const user = await this.userService.findById(codeVerification.userId.toString());
            if (!user) {
                return sendErrorResponse(res, 'User not found', null, 401);
            }

            // Update last login
            await this.userService.updateLastLogin(user._id?.toString() || '');

            // Generate JWT tokens
            const tokens = generateTokenAndRefresh();

            // Create login session
            await loginSessionModel.create({
                userId: user._id as Types.ObjectId,
                sessionToken: tokens.token,
                userAgent: {userAgent: req.get('User-Agent') || ''},
                ipAddress: req.ip || req.connection.remoteAddress || '',
                lastUsed: new Date()
            });

            return sendSuccessResponse(res, 'Login successful', {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roleId: user.roleId
                },
                tokens: tokens.keys,
                expiresIn: tokens.token_expiry
            });
        } catch (error) {
            console.error('Login validation error:', error);
            return sendErrorResponse(res, 'An error occurred during login validation', null, 500);
        }
    };

    /**
     * Resend OTP
     */
    public resendOTP = async (req: Request, res: Response): Promise<void> => {
        try {
            const validation = await validateInput(req, resendOTPSchema);
            if (validation.failed) {
                return sendErrorResponse(res, 'Validation failed', validation.errors, 400);
            }

            const {reference} = req.body;

            // Find code verification
            const codeVerification = await codeVerificationModel.findByReference(reference);
            if (!codeVerification) {
                return sendErrorResponse(res, 'Invalid reference', null, 401);
            }

            // Check if OTP is expired
            if (codeVerification.expiredAt && new Date(codeVerification.expiredAt) < new Date()) {
                return sendErrorResponse(res, 'OTP expired', null, 401);
            }

            // Check if resend is allowed (not too frequent)
            const lastResent = new Date(codeVerification.lastResentAt || new Date());
            const now = new Date();
            const timeDiff = now.getTime() - lastResent.getTime();
            const minutesDiff = timeDiff / (1000 * 60);

            if (minutesDiff < 1) { // Minimum 1 minute between resends
                return sendErrorResponse(res, 'Please wait before requesting another OTP', null, 429);
            }

            // Generate new OTP
            const newCode = generateOTP();
            const newExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

            // Update the verification record
            await codeVerificationModel.update(codeVerification._id?.toString() || '', {
                emailCode: newCode,
                phoneCode: newCode,
                expiredAt: newExpiry,
                lastResentAt: now
            });

            // TODO: Send new OTP via email/SMS here
            console.log(`New OTP sent: ${newCode}`);

            return sendSuccessResponse(res, 'OTP resent successfully', {
                reference,
                expiresIn: OTP_EXPIRY_MINUTES * 60 // seconds
            });
        } catch (error) {
            console.error('Resend OTP error:', error);
            return sendErrorResponse(res, 'An error occurred while resending OTP', null, 500);
        }
    };

    /**
     * Logout user
     */
    public logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            await loginSessionModel.deactivateSession(req.session?.sessionToken as string);
            return sendSuccessResponse(res, 'Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            return sendErrorResponse(res, 'An error occurred during logout', null, 500);
        }
    };

    /**
     * Get current user information
     */
    public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                return sendErrorResponse(res, 'User not authenticated', null, 401);
            }
            return sendSuccessResponse(res, 'User information retrieved successfully', {
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    roleId: req.user.roleId,
                    mfa_enabled: req.user.mfa_enabled,
                    status: req.user.status
                }
            });
        } catch (error) {
            return sendErrorResponse(res, 'An error occurred while retrieving user information', {error: error}, 500);
        }
    };

    public refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        const tokens = generateTokenAndRefresh();
        await loginSessionModel.updateById(req.session?._id as string, {
            sessionToken: tokens.token
        });
        const user = req.user;
        return sendSuccessResponse(res, 'Token refreshed successfully', {
            user: {
                id: user?._id,
                email: user?.email,
                firstName: user?.firstName,
                lastName: user?.lastName,
                roleId: user?.roleId
            },
            tokens: tokens.keys,
            expiresIn: tokens.token_expiry
        });
    };
}