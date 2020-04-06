const http = require("http");
const express = require("express");
const fs = require("fs");
const socketio = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = socketio(server);

const opts = {
  port: process.env.PORT || 1948,
};

function randBytes(size) {
  return crypto.randomBytes(size).toString("hex");
}

function createHash(secret) {
  const cipher = crypto.createHash("sha512", secret);
  return cipher.final("hex");
}

(() => {
  const secret = randBytes(32);

  const index = fs.readFileSync(`public/index.html`, { encoding: "utf-8" });
  fs.writeFileSync(
    `/tmp/index.html`,
    index.replace(
      "<head>",
      "<head><script src='socket.io/socket.io.js'></script><script src='multiplex.js'></script>"
    )
  );

  io.on("connection", function (socket) {
    socket.on("multiplex-statechanged", function (data) {
      if (
        typeof data.secret == "undefined" ||
        data.secret == null ||
        data.secret === ""
      )
        return;
      if (createHash(data.secret) === data.socketId) {
        data.secret = null;
        socket.broadcast.emit(data.socketId, data);
      }
    });

    socket.on("auth", (_secret) => {
      if (secret === _secret) {
        socket.join("master");
        socket.emit("auth", { ok: true });
      } else {
        return;
      }

      socket.on("master-update", (data) => {
        socket.broadcast.emit("update", data);
      });
    });
  });

  app.get(["/", "/index.html", `/${secret}`], (req, res) => {
    res.sendFile("/tmp/index.html");
  });

  app.get("/multiplex.js", (req, res) => {
    res.sendFile(path.resolve("multiplex.js"));
  });

  app.use(express.static("public"));

  server.listen(opts.port || null, (err) => {
    if (err) {
      console.warn(`Failed to start server: ${err}`);
    }

    console.log(`Server listening on port ${opts.port}`);
    console.log(`Control url: /${secret}`);
  });
})();
