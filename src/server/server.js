// src/server/server.js

require("dotenv").config();

const Hapi = require("@hapi/hapi");
const routes = require("../server/routes");
const loadModel = require("../services/loadModel");

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  server.ext("onPreResponse", function (request, h) {
    const response = request.response;
    const contentLength = request.headers["content-length"];
    if (contentLength > 1000000) {
      return h
        .response({
          status: "fail",
          message: "Payload content length greater than maximum allowed: 1000000",
        })
        .code(413);
    }

    if (response instanceof Error) {
      if (response.message.includes("mobilenetv3large_input")) {
        const newResponse = h.response({
          status: "fail",
          message: "Terjadi kesalahan dalam melakukan prediksi",
        });
        newResponse.code(400);
        return newResponse;
      } else {
        console.error("error : " + response);
        const newResponse = h.response({
          status: "fail",
          message: "Terjadi kesalahan internal",
        });
        newResponse.code(500);
        return newResponse;
      }
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server start at: ${server.info.uri}`);
})();
