import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import influencersRouter from "./influencers";
import campaignsRouter from "./campaigns";
import requestsRouter from "./requests";
import messagesRouter from "./messages";
import dashboardRouter from "./dashboard";
import { tryAuth } from "../lib/auth";

const router: IRouter = Router();

router.use(tryAuth);
router.use(healthRouter);
router.use(authRouter);
router.use(profilesRouter);
router.use(influencersRouter);
router.use(campaignsRouter);
router.use(requestsRouter);
router.use(messagesRouter);
router.use(dashboardRouter);

export default router;
