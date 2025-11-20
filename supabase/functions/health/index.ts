import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  const body = { ok: true };
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" }
  });
});