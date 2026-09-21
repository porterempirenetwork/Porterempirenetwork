import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured." }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    if (!messages.length) return new Response(JSON.stringify({ error: "messages is required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: body.model || "gpt-4.1-mini", input: messages, max_output_tokens: 800 })
    });
    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: data.error?.message || "OpenAI request failed" }), { status: response.status, headers: { ...cors, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ text: data.output_text || "" }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Invalid request" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
