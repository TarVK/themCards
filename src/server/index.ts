import express from "express";
import {domain} from "../config";
import http from "http";
import Path from "path";
import {startApplication} from "./App";

console.log("Starting");
const app = express();
app.use(express.static(Path.join(process.cwd(), "public")));

app.get("/ping", (req, resp) => {
    resp.json({type: "pong", timestamp: Date.now()});
});

if (domain.resources.port == domain.socket.port) {
    const server = http.createServer(app);
    startApplication(server);
    server.listen(domain.resources.port, () =>
        console.log(`Example app listening on port ${domain.resources.port}!`)
    );
} else {
    startApplication();

    // Use webpack dev server during development
    if (process.env.NODE_ENV === "production")
        app.listen(domain.resources.port, () =>
            console.log(`Example app listening on port ${domain.resources.port}!`)
        );
}
