import {sendSuccessResponse} from "../../utils/response";
import {Request, Response} from "express";
import {config} from "../../../config/app";
import * as process from "node:process";

export abstract class Controller {
    // This is a base controller class that can be extended by other controllers
}

export class BaseController extends Controller {
    public baseURL = async (_req: Request, res: Response): Promise<void> => {
        return sendSuccessResponse(res, config.appName, {
            message: config.appName,
            version: config.version,
            status: 'running'
        }, 200);
    };

    public healthCheck = async (_req: Request, res: Response): Promise<void> => {
        return sendSuccessResponse(res, 'Health Status Check', {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: config.nodeEnv
        }, 200);
    };
}

export const baseController = new BaseController();