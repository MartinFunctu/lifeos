import { Request, Response } from "express";
import { db } from "./db";
import { users, canvasNodes, canvasEdges } from "../shared/schema";
import { eq } from "drizzle-orm";
import { loginSchema } from "../shared/schema";
import jwt from "jsonwebtoken";
import { logger } from "./logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

// Placeholder handler
export const getHealth = async (_req: Request, res: Response) => {
    res.json({ status: "ok" });
};

export const login = async (req: Request, res: Response) => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        res.status(400).json({ message: "Invalid input" });
        return;
    }

    const { email, password } = parseResult.data;

    const user = await db.query.users.findFirst({
        where: eq(users.username, email),
    });

    if (!user || user.password !== password) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
    }

    const payload = {
        id: user.id,
        username: user.username,
        email: user.username, // Assuming username is email based on schema and login logic
    };

    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });

    res.json({
        token,
        user: payload,
    });
};

// Canvas Nodes handlers
import { AuthenticatedRequest } from "./middleware";
import { and } from "drizzle-orm";

export const getCanvasNodes = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const nodes = await db.select().from(canvasNodes).where(eq(canvasNodes.userId, userId));
        res.json(nodes);
    } catch (error) {
        logger.error("Failed to fetch canvas nodes", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to fetch nodes" });
    }
};

export const createCanvasNode = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id, type, label, x, y, data } = req.body;
        const [node] = await db.insert(canvasNodes).values({
            id,
            userId,
            type: type || "default",
            label,
            x: x || 0,
            y: y || 0,
            data: data || {},
        }).returning();
        logger.info(`Created canvas node: ${id} for user: ${userId}`);
        res.status(201).json(node);
    } catch (error) {
        logger.error("Failed to create canvas node", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to create node" });
    }
};

export const updateCanvasNode = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const { x, y, label, data } = req.body;

        const updateData: Record<string, unknown> = {};
        if (x !== undefined) updateData.x = x;
        if (y !== undefined) updateData.y = y;
        if (label !== undefined) updateData.label = label;
        if (data !== undefined) updateData.data = data;

        // Only update if user owns the node
        const [node] = await db.update(canvasNodes)
            .set(updateData)
            .where(and(eq(canvasNodes.id, id), eq(canvasNodes.userId, userId)))
            .returning();

        if (!node) {
            res.status(404).json({ message: "Node not found" });
            return;
        }
        res.json(node);
    } catch (error) {
        logger.error("Failed to update canvas node", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to update node" });
    }
};

export const deleteCanvasNode = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        // Only delete if user owns the node
        await db.delete(canvasNodes).where(and(eq(canvasNodes.id, id), eq(canvasNodes.userId, userId)));
        // Also delete related edges owned by this user
        await db.delete(canvasEdges).where(and(eq(canvasEdges.source, id), eq(canvasEdges.userId, userId)));
        await db.delete(canvasEdges).where(and(eq(canvasEdges.target, id), eq(canvasEdges.userId, userId)));
        logger.info(`Deleted canvas node: ${id} for user: ${userId}`);
        res.status(204).send();
    } catch (error) {
        logger.error("Failed to delete canvas node", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to delete node" });
    }
};

// Canvas Edges handlers
export const getCanvasEdges = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const edges = await db.select().from(canvasEdges).where(eq(canvasEdges.userId, userId));
        res.json(edges);
    } catch (error) {
        logger.error("Failed to fetch canvas edges", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to fetch edges" });
    }
};

export const createCanvasEdge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id, source, target, type } = req.body;
        const [edge] = await db.insert(canvasEdges).values({
            id,
            userId,
            source,
            target,
            type: type || "default",
        }).returning();
        logger.info(`Created canvas edge: ${id} for user: ${userId}`);
        res.status(201).json(edge);
    } catch (error) {
        logger.error("Failed to create canvas edge", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to create edge" });
    }
};

export const deleteCanvasEdge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        // Only delete if user owns the edge
        await db.delete(canvasEdges).where(and(eq(canvasEdges.id, id), eq(canvasEdges.userId, userId)));
        logger.info(`Deleted canvas edge: ${id} for user: ${userId}`);
        res.status(204).send();
    } catch (error) {
        logger.error("Failed to delete canvas edge", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to delete edge" });
    }
};

// Gemini AI Chat handler with context caching
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = process.env.GOOGLE_STUDIO_API_KEY;

// System instruction for consistent context (cached at module level)
const SYSTEM_INSTRUCTION = `You are LifeOS AI Assistant, a helpful and friendly personal assistant integrated into the LifeOS productivity platform.

Your capabilities and context:
- You help users manage their life organization system
- You can assist with planning, productivity tips, and general questions
- You understand the LifeOS canvas system where users organize their life into blocks (Finance, Health, Work, etc.)
- Be concise but helpful in your responses
- Use Slovak language if the user writes in Slovak, otherwise use the language they use
- Be encouraging and supportive

Remember: You are embedded in a modern productivity dashboard with a beautiful dark theme.`;

// Singleton pattern for caching - reuse model instance across requests
let cachedGenAI: GoogleGenerativeAI | null = null;
let cachedModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

const getGeminiModel = () => {
    if (!GOOGLE_API_KEY) {
        throw new Error("GOOGLE_STUDIO_API_KEY is not set");
    }

    if (!cachedGenAI) {
        cachedGenAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
    }

    if (!cachedModel) {
        cachedModel = cachedGenAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
        });
        logger.info("Gemini model initialized with cached context");
    }

    return cachedModel;
};

export const chatWithAgent = async (req: Request, res: Response) => {
    try {
        const model = getGeminiModel();

        const { message, history } = req.body;

        if (!message) {
            res.status(400).json({ message: "Message is required" });
            return;
        }

        // Build conversation history for context
        const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        logger.info(`Chat message processed successfully`);
        res.json({ response });
    } catch (error) {
        logger.error("Failed to process chat message", error);
        res.status(500).json({ message: "Failed to get AI response" });
    }
};
