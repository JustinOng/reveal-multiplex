window.onload = () => {
  if (Reveal.isReady()) {
    main();
  } else {
    Reveal.addEventListener("ready", main);
  }

  const ele = document.createElement("div");
  ele.id = "info";
  ele.style =
    "position: absolute; bottom: 0px; left: 0px; z-index: 999; font-family: Arial; padding: 10px; color: #c3b7b7";
  document.body.appendChild(ele);

  const type = document.createElement("div");
  type.id = "type";
  ele.appendChild(type);

  const stats = document.createElement("div");
  stats.id = "stats";
  ele.appendChild(stats);
};

function main() {
  const socket = io.connect();

  socket.on("connect", () => {
    console.log("Socket connected");
    document.querySelector("#type").innerText = "Connected";

    const uris = window.location.pathname.split("/");
    const secret = uris[uris.length - 1];
    if (!secret) return;

    socket.emit("auth", secret);
  });

  socket.on("auth", (data) => {
    if (!data.ok) {
      console.log("Failed to authenticate");
      document.querySelector("#type").innerText = "Failed to authenticate";
      return;
    }

    document.querySelector("#type").innerText = "Presenting";

    // auth ok, configure transmission of changes
    function post() {
      socket.emit("master-update", {
        state: Reveal.getState(),
      });
    }

    [
      "slidechanged",
      "fragmentshown",
      "fragmenthidden",
      "overviewhidden",
      "overviewshown",
      "paused",
      "resumed",
    ].forEach((evt) => {
      Reveal.addEventListener(evt, post);
    });
  });

  socket.on("stats", (stats) => {
    document.querySelector("#stats").innerText = `${stats.viewers} Viewer${
      stats.viewers === 1 ? "" : "s"
    }, ${stats.masters} Presenter${stats.masters === 1 ? "" : "s"}`;
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected!");
    document.querySelector("#type").innerText = "Disconnected";
  });

  socket.on("update", (data) => {
    Reveal.setState(data.state);
  });
}
