import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { logger } from "./logger";

export function log(message: string, source = "express") {
    logger.info(message, source);
}

export async function setupVite(app: Express, server: Server) {
    const serverOptions = {
        middlewareMode: true,
        hmr: { port: 24678 },
        allowedHosts: true,
    };

    const vite = await createViteServer({
        ...serverOptions,
        configFile: path.resolve(__dirname, "..", "vite.config.ts"),
    });

    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;

        try {
            const clientTemplate = path.resolve(
                __dirname,
                "..",
                "client",
                "index.html",
            );

            // always read fresh template in dev
            let template = fs.readFileSync(clientTemplate, "utf-8");
            const page = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(page);
        } catch (e) {
            vite.ssrFixStacktrace(e as Error);
            next(e);
        }
    });
}

export function serveStatic(app: Express) {
    const distPath = path.resolve(__dirname, "..", "dist");

    if (!fs.existsSync(distPath)) {
        throw new Error(
            `Could not find drug: ${distPath}, make sure to build the client first`,
        );
    }

    app.use(express.static(distPath));

    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
