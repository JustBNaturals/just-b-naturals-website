import { onRequestPost as submitOrder } from "../functions/api/order.js";
import { onRequestPost as subscribe } from "../functions/api/subscribe.js";

function methodNotAllowed() {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

    if (pathname === "/api/order") {
      return request.method === "POST"
        ? submitOrder({ request, env, waitUntil: ctx.waitUntil.bind(ctx) })
        : methodNotAllowed();
    }

    if (pathname === "/api/subscribe") {
      return request.method === "POST"
        ? subscribe({ request, env, waitUntil: ctx.waitUntil.bind(ctx) })
        : methodNotAllowed();
    }

    return env.ASSETS.fetch(request);
  }
};
