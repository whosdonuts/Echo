const http = require("http");
const { URL } = require("url");
const {
  cities,
  echoes,
  galleryItems,
  popularEchoes,
} = require("./mock-data");

const port = Number(process.env.PORT || 4000);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function notFound(response, pathname) {
  sendJson(response, 404, {
    error: "Not Found",
    message: `No mock endpoint configured for ${pathname}`,
  });
}

const server = http.createServer((request, response) => {
  if (!request.url) {
    return sendJson(response, 400, { error: "Bad Request" });
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, {
      error: "Method Not Allowed",
      message: "Mock API currently supports GET requests only.",
    });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const { pathname, searchParams } = url;

  if (pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      service: "echo-backend",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (pathname === "/api/cities") {
    sendJson(response, 200, { cities });
    return;
  }

  if (pathname === "/api/echoes") {
    const cityId = searchParams.get("city");
    const items = cityId
      ? echoes.filter((echoItem) => echoItem.cityId === cityId)
      : echoes;
    sendJson(response, 200, { echoes: items });
    return;
  }

  if (pathname.startsWith("/api/cities/") && pathname.endsWith("/echoes")) {
    const cityId = pathname.split("/")[3];
    const city = cities.find((item) => item.id === cityId);

    if (!city) {
      sendJson(response, 404, {
        error: "Not Found",
        message: `Unknown city '${cityId}'.`,
      });
      return;
    }

    sendJson(response, 200, {
      city,
      echoes: echoes.filter((echoItem) => echoItem.cityId === cityId),
    });
    return;
  }

  if (pathname === "/api/echoes/popular") {
    sendJson(response, 200, { echoes: popularEchoes });
    return;
  }

  if (pathname === "/api/gallery") {
    sendJson(response, 200, { items: galleryItems });
    return;
  }

  notFound(response, pathname);
});

server.listen(port, () => {
  console.log(`Echo mock API listening on http://localhost:${port}`);
});

