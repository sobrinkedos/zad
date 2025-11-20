import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { user_id, vehicle_id, zone_id, duration_minutes } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const { data: active } = await supabase
      .from("sessions")
      .select("id,fim,status")
      .eq("user_id", user_id)
      .eq("status", "ativa")
      .gt("fim", new Date().toISOString())
      .maybeSingle();

    if (active) {
      return new Response(JSON.stringify({ error: "Sessão ativa existente" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const { data: zone, error: zerr } = await supabase
      .from("zones")
      .select("id,valor_hora,status")
      .eq("id", zone_id)
      .single();

    if (zerr || !zone || zone.status !== "ativa") {
      return new Response(JSON.stringify({ error: "Zona inválida" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const hours = Math.ceil(Number(duration_minutes) / 60);
    const cost = hours * Number(zone.valor_hora);
    const end = new Date(Date.now() + Number(duration_minutes) * 60_000).toISOString();

    const { data: profile } = await supabase
      .from("profiles")
      .select("saldo_creditos")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!profile || Number(profile.saldo_creditos) < cost) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente" }), { status: 402, headers: { "content-type": "application/json" } });
    }

    const newBalance = Number(profile.saldo_creditos) - cost;
    const debit = await supabase
      .from("profiles")
      .update({ saldo_creditos: newBalance })
      .eq("user_id", user_id)
      .select("saldo_creditos")
      .maybeSingle();

    if (debit.error) {
      return new Response(JSON.stringify({ error: "Falha no débito de créditos" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    const { data: session, error: serr } = await supabase
      .from("sessions")
      .insert({ user_id, vehicle_id, zone_id, inicio: new Date().toISOString(), fim: end, status: "ativa", tarifa_aplicada: zone.valor_hora, creditos_utilizados: cost })
      .select("*")
      .single();

    if (serr) {
      return new Response(JSON.stringify({ error: "Falha ao criar sessão" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    await supabase
      .from("transactions")
      .insert({ user_id, tipo: "uso", valor: cost, session_id: session.id, status: "concluido" });

    return new Response(JSON.stringify({ session }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});