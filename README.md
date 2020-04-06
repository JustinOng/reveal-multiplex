# Reveal.js Multiplexer

A slightly different take on the [Reveal.js Multiplex plugin](https://github.com/hakimel/reveal.js#multiplexing).

The Multiplex plugin allows multiple presentations to be ran from a single websocket server but requires two separate presentations to be configured and hosted.

This project was built with the intention of presenting a single set of slides from a server without having to configure and maintain separate presentations.

## Usage:
1. Clone this repository
2. Put your presentation (index.html) and supporting files into the `public` folder. The contents of this folder will be served from the server.
3. Build and start the Docker image, make sure to mount the public folder at `/app/public` (the included `docker-compose.yml` file does this)
4. On starting, the server logs the control URL:
  ```
  server_1  | Server listening on port 1948
  server_1  | Control url: /bd13439ca77bbd6681cbd05617382512ee67c6310aa6f0df061d6ea1c9241fbc
  ```
5. Access http://host/ to view the presentation as a standard viewer. Access http://host/<control url> to control the presentation (eg http://host/bd13439ca77bbd6681cbd05617382512ee67c6310aa6f0df061d6ea1c9241fbc)
