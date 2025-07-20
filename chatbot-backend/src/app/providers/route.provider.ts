import {Router} from "express";
import {routes} from '../../routes/api/index';

import {baseController} from "../http/controllers/controller";
import {config} from "../../config/app";

const router = Router();

router.route('/').get(baseController.baseURL);
router.route('/health').get(baseController.healthCheck);
router.use(`/v${config.version}`, routes);

export default router;