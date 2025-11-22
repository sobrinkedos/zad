import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { email, password, role, municipality_id, nome, cpf } = await req.json();
    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(url, serviceKey);

    const { data: created, error: cerr } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, cpf },
      app_metadata: { app_role: role }
    });
    if (cerr || !created.user) {
      return new Response(JSON.stringify({ error: "Falha ao criar usuário" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    const user_id = created.user.id;
    const { error: aerr } = await svc
      .from("accounts")
      .insert({ user_id, role, nome, cpf, email, municipality_id: municipality_id ?? null });
    if (aerr) {
      return new Response(JSON.stringify({ error: "Falha ao criar account" }), { status: 500, headers: { "content-type": "application/json" } });
    }

    return new Response(JSON.stringify({ user_id }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});