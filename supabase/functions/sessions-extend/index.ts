import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { session_id, additional_minutes } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("id,user_id,fim,status,tarifa_aplicada,creditos_utilizados")
      .eq("id", session_id)
      .single();

    if (sErr || !session || session.status !== "ativa") {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const addHours = Math.ceil(Number(additional_minutes) / 60);
    const addCost = addHours * Number(session.tarifa_aplicada);

    const { data: profile } = await supabase
      .from("profiles")
      .select("saldo_creditos")
      .eq("user_id", session.user_id)
      .maybeSingle();

    if (!profile || Number(profile.saldo_creditos) < addCost) {
      return new Response(JSON.stringify({ error: "Saldo insuficiente" }), { status: 402, headers: { "content-type": "application/json" } });
    }

    const debit = await supabase
      .from("profiles")
      .update({ saldo_creditos: Number(profile.saldo_creditos) - addCost })
      .eq("user_id", session.user_id)
      .select("saldo_creditos")
      .maybeSingle();

    if (debit.error) {
      return new Response(JSON.stringify({ error: "Falha no débito de créditos" }), { status: 500, headers: { "content-type": "application/json" } });
    }
    const newEnd = new Date(new Date(session.fim).getTime() + Number(additional_minutes) * 60_000).toISOString();
    const totalCost = Number(session.creditos_utilizados) + addCost;

    const { data: updated, error: uErr } = await supabase
      .from("sessions")
      .update({ fim: newEnd, creditos_utilizados: totalCost })
      .eq("id", session_id)
      .select("*")
      .single();

    if (uErr) {
      return new Response(JSON.stringify({ error: "Falha ao atualizar sessão" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    await supabase
      .from("transactions")
      .insert({ user_id: updated.user_id, tipo: "uso", valor: addCost, session_id: session_id, status: "concluido" });

    return new Response(JSON.stringify({ session: updated }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});