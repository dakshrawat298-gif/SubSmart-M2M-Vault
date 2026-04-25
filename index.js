import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { runNegotiation } from "./src/negotiator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 5000;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(join(__dirname, "public")));

let isRunning = false;

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "connected" }));

  ws.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.action === "start") {
      if (isRunning) {
        ws.send(JSON.stringify({ type: "error", message: "A negotiation is already in progress." }));
        return;
      }

      isRunning = true;

      const broadcast = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(event));
        }
      };

      try {
        await runNegotiation(broadcast);
      } catch (err) {
        broadcast({ type: "error", message: err.message });
      } finally {
        isRunning = false;
        broadcast({ type: "done" });
      }
    }
  });

  ws.on("close", () => {});
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`SubSmart M2M Negotiator running → http://0.0.0.0:${PORT}`);
});
