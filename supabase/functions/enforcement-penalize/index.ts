import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { plate, zone_id, motivo, valor, evidencias_url, gps, file_base64, file_name, content_type } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id")
      .eq("placa", String(plate).toUpperCase())
      .maybeSingle();

    if (!vehicle) {
      return new Response(JSON.stringify({ error: "Veículo não encontrado" }), { status: 404, headers: { "content-type": "application/json" } });
    }

    const { data: user } = await supabase.auth.getUser();
    const fiscal_id = user.user?.id;
    if (!fiscal_id) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), { status: 401, headers: { "content-type": "application/json" } });
    }

    const { data: penalty, error } = await supabase
      .from("penalties")
      .insert({ vehicle_id: vehicle.id, zone_id, fiscal_id, motivo: motivo ?? 'Estacionamento irregular', valor: Number(valor ?? 50), evidencias_url: evidencias_url ?? [], gps })
      .select("*")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: "Falha ao registrar penalidade" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    if (file_base64) {
      const raw = atob(String(file_base64));
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const path = `penalties/${penalty.id}/${file_name || 'evidence.jpg'}`;
      const upload = await supabase.storage.from('evidences').upload(path, bytes, { contentType: content_type || 'image/jpeg', upsert: true });
      if (!upload.error) {
        await supabase
          .from('penalties')
          .update({ evidencias_url: (penalty.evidencias_url || []).concat([path]) })
          .eq('id', penalty.id);
      }
    }

    return new Response(JSON.stringify({ penalty }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});
