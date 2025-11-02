import { Router } from "express";
import { requestContext } from "@/infra/http/middlewares/request-context";

const healthRouter = Router();

healthRouter.get("/health", (req, res) => {
    const ctx = requestContext.getStore();
    const traceId = ctx?.traceId ?? "no-trace";
    res.setHeader("X-Request-Id", traceId);
    res.status(200).json({ status: "ok", traceId });
});

export { healthRouter };
