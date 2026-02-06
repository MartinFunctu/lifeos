import type { Express } from "express";
import { createServer, type Server } from "http";
import * as handlers from "./handlers";
import { authMiddleware } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
    // Public routes
    app.get("/api/health", handlers.getHealth);
    app.post("/api/login", handlers.login);

    // Protected Canvas API routes
    app.get("/api/canvas/nodes", authMiddleware, handlers.getCanvasNodes);
    app.post("/api/canvas/nodes", authMiddleware, handlers.createCanvasNode);
    app.patch("/api/canvas/nodes/:id", authMiddleware, handlers.updateCanvasNode);
    app.delete("/api/canvas/nodes/:id", authMiddleware, handlers.deleteCanvasNode);

    app.get("/api/canvas/edges", authMiddleware, handlers.getCanvasEdges);
    app.post("/api/canvas/edges", authMiddleware, handlers.createCanvasEdge);
    app.delete("/api/canvas/edges/:id", authMiddleware, handlers.deleteCanvasEdge);

    // Protected AI Chat route
    app.post("/api/chat", authMiddleware, handlers.chatWithAgent);

    const httpServer = createServer(app);

    return httpServer;
}

