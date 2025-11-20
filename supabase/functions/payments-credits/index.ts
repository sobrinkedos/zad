import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { user_id, amount, method } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }
    });

    const value = Number(amount);
    if (!user_id || !value || value <= 0) {
      return new Response(JSON.stringify({ error: "Valor inválido" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("saldo_creditos")
      .eq("user_id", user_id)
      .maybeSingle();

    const current = Number(profile?.saldo_creditos ?? 0);
    const updated = await supabase
      .from("profiles")
      .update({ saldo_creditos: current + value })
      .eq("user_id", user_id)
      .select("saldo_creditos")
      .maybeSingle();

    if (updated.error) {
      return new Response(JSON.stringify({ error: "Falha ao atualizar saldo" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    await supabase
      .from("transactions")
      .insert({ user_id, tipo: "compra", valor: value, metodo_pagamento: method ?? "pix", status: "concluido" });

    return new Response(JSON.stringify({ saldo_creditos: updated.data?.saldo_creditos }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});