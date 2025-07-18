import {Router} from "express";
import {AuthController} from "../../../app/http/controllers/auth/auth.controller";
import {authCheck, authRefresh} from "../../../app/http/middleware/auth.middleware";

const auth = new AuthController();
const router = Router();

router.route('/login').post(auth.login);
router.route('/login/validate').post(auth.loginValidate);
router.route('/resend/otp').post(auth.resendOTP);
router.route('/logout').post(authCheck, auth.logout);
router.route('/me').get(authCheck, auth.me);
router.route('/refresh').post(authRefresh, auth.refreshToken);

    router.stack.forEach(function(r: any){
    if (r.route && r.route.path){
        console.log(r.route.path)
    }
}   );

export {router as auth};