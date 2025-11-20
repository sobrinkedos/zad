import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { penalty_id, path, expires_in } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { "content-type": "application/json" } });

    const isAdmin = (user.app_metadata as any)?.app_role === "admin";
    let allowed = isAdmin;

    if (!allowed) {
      const { data: pen } = await supabase
        .from("penalties")
        .select("id, vehicle_id")
        .eq("id", penalty_id)
        .maybeSingle();
      if (!pen) return new Response(JSON.stringify({ error: "Penalidade não encontrada" }), { status: 404, headers: { "content-type": "application/json" } });
      const { data: veh } = await supabase
        .from("vehicles")
        .select("id, user_id")
        .eq("id", pen.vehicle_id)
        .maybeSingle();
      allowed = !!veh && veh.user_id === user.id;
    }

    if (!allowed) return new Response(JSON.stringify({ error: "Acesso negado" }), { status: 403, headers: { "content-type": "application/json" } });

    const seconds = Number(expires_in ?? 3600);
    const res = await supabase.storage.from("evidences").createSignedUrl(String(path), seconds);
    if (res.error) return new Response(JSON.stringify({ error: "Falha ao assinar URL" }), { status: 400, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ signedUrl: res.data?.signedUrl }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});