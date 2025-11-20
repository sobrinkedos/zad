import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { session_id } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("id,user_id,inicio,fim,status,tarifa_aplicada,creditos_utilizados")
      .eq("id", session_id)
      .single();

    if (sErr || !session || session.status !== "ativa") {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const now = new Date();
    const start = new Date(session.inicio);
    const actualMinutes = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000));
    const actualHours = Math.ceil(actualMinutes / 60);
    const actualCost = actualHours * Number(session.tarifa_aplicada);
    const refund = Math.max(0, Number(session.creditos_utilizados) - actualCost);

    const { data: updated, error: uErr } = await supabase
      .from("sessions")
      .update({ fim: now.toISOString(), status: "finalizada", creditos_utilizados: actualCost })
      .eq("id", session_id)
      .select("*")
      .single();

    if (uErr) {
      return new Response(JSON.stringify({ error: "Falha ao finalizar sessão" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    if (refund > 0) {
      await supabase
        .from("transactions")
        .insert({ user_id: updated.user_id, tipo: "estorno", valor: refund, session_id: session_id, status: "concluido" });

      const { data: profile } = await supabase
        .from("profiles")
        .select("saldo_creditos")
        .eq("user_id", updated.user_id)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ saldo_creditos: Number(profile.saldo_creditos) + refund })
          .eq("user_id", updated.user_id);
      }
    }

    return new Response(JSON.stringify({ session: updated, refund }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});