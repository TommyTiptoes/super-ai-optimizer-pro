// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import serveStatic from "serve-static";

import { shopifyApp, LATEST_API_VERSION } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Required envs ----
const required = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "HOST"];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`❌ Missing required env: ${k}`);
    process.exit(1);
  }
}

const HOST = process.env.HOST.replace(/^https?:\/\//, "");
const SCOPES = (process.env.SCOPES || "read_products")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// ---- Shopify app (Express) ----
const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    apiVersion: LATEST_API_VERSION,
    scopes: SCOPES,
    hostName: HOST, // Render host, no scheme
    restResources,
  },
  auth: {
    path: "/auth",
    callbackPath: "/auth/callback",
  },
  sessionStorage: new MemorySessionStorage(),
});

const app = express();

// Healthcheck
app.get("/api/health", (_req, res) => res.status(200).send("ok"));

// Shopify auth routes
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Protect future /api/* routes
app.use("/api/*", shopify.validateAuthenticatedSession());

// Security helpers
app.use(shopify.cspHeaders());
app.use(shopify.redirectToShopifyOrAppRoot());

// Serve Vite build from dist/
const distPath = path.join(__dirname, "dist");
app.use(serveStatic(distPath, { index: ["index.html"] }));
app.use("/*", serveStatic(distPath, { index: ["index.html"] }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ App running at http://localhost:${PORT}`);
});
