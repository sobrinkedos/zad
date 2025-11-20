import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { plate } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id,placa,marca,modelo,cor")
      .eq("placa", String(plate).toUpperCase())
      .maybeSingle();

    if (!vehicle) {
      return new Response(JSON.stringify({ status: "not_found" }), { headers: { "content-type": "application/json" } });
    }

    const now = new Date().toISOString();
    const { data: session } = await supabase
      .from("sessions")
      .select("id,zone_id,fim,status")
      .eq("vehicle_id", vehicle.id)
      .eq("status", "ativa")
      .gt("fim", now)
      .maybeSingle();

    if (session) {
      return new Response(JSON.stringify({ status: "valid", vehicle, session }), { headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ status: "invalid", vehicle }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});