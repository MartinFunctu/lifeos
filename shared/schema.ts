import { pgTable, text, serial, integer, boolean, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Canvas nodes table - stores nodes with positions relative to pivot (0,0)
export const canvasNodes = pgTable("canvas_nodes", {
    id: text("id").primaryKey(), // React Flow uses string IDs
    userId: integer("user_id").notNull().references(() => users.id), // Owner of the node
    type: text("type").notNull().default("default"),
    label: text("label").notNull(),
    x: real("x").notNull().default(0),
    y: real("y").notNull().default(0),
    data: jsonb("data").$type<Record<string, unknown>>().default({}),
});

export const insertCanvasNodeSchema = createInsertSchema(canvasNodes);
export type InsertCanvasNode = z.infer<typeof insertCanvasNodeSchema>;
export type CanvasNode = typeof canvasNodes.$inferSelect;

// Canvas edges table - stores connections between nodes
export const canvasEdges = pgTable("canvas_edges", {
    id: text("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id), // Owner of the edge
    source: text("source").notNull(),
    target: text("target").notNull(),
    type: text("type").default("default"),
});

export const insertCanvasEdgeSchema = createInsertSchema(canvasEdges);
export type InsertCanvasEdge = z.infer<typeof insertCanvasEdgeSchema>;
export type CanvasEdge = typeof canvasEdges.$inferSelect;

