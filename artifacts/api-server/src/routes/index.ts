import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import applicationsRouter from "./applications";
import interviewsRouter from "./interviews";
import analyticsRouter from "./analytics";
import copilotRouter from "./copilot";
import onboardingRouter from "./onboarding";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Public routes
router.use(healthRouter);
router.use(authRouter);

// Specific public endpoints inside candidatesRouter handled selectively, but wait, 
// if we mount candidatesRouter under requireAuth, then all candidate routes are protected.
// It's better to mount candidatesRouter BEFORE requireAuth, and protect its internal routes, 
// OR we can just add a middleware here that checks the path.

// Let's add a global auth middleware with path exclusions
router.use((req, res, next) => {
  const publicPaths = [
    "/healthz",
    "/auth/login",
    "/candidates/login",
  ];
  
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  // POST /candidates (Registration) and POST /auth/register are public for now
  if (req.method === "POST" && (req.path === "/candidates" || req.path === "/auth/register")) {
    return next();
  }

  // Otherwise require auth
  requireAuth(req, res, next);
});

router.use(jobsRouter);
router.use(candidatesRouter);
router.use(applicationsRouter);
router.use(interviewsRouter);
router.use(analyticsRouter);
router.use(copilotRouter);
router.use(onboardingRouter);

export default router;
