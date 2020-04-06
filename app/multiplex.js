window.onload = () => {
  if (Reveal.isReady()) {
    main();
  } else {
    Reveal.addEventListener("ready", main);
  }
};

function main() {
  const socket = io.connect();

  socket.on("connect", () => {
    console.log("Socket connected");

    const secret = window.location.pathname.substr(1);
    if (!secret) return;

    socket.emit("auth", secret);
  });

  socket.on("auth", (data) => {
    if (!data.ok) {
      console.log("Failed to authenticate");
      return;
    }

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

  socket.on("disconnect", () => {
    console.log("Socket disconnected!");
  });

  socket.on("update", (data) => {
    Reveal.setState(data.state);
  });
}
