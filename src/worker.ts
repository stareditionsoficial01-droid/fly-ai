import { httpServerHandler } from "cloudflare:node";
import express from "express";

const app = express();

app.get("/api/worker-test", (_req, res) => {
  res.json({
    success: true,
    message: "Fly AI Worker funcionando!"
  });
});

app.listen(3000);

export default httpServerHandler({ port: 3000 });
