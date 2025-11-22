import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const { email, password, nome, cpf } = await req.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(url, serviceKey);

    // Try to find user by email
    let userId: string | null = null;
    const { data: list } = await svc.auth.admin.listUsers();
    const existing = list?.users?.find((u: any) => u.email === email) || null;
    if (existing) {
      userId = existing.id;
      await svc.auth.admin.updateUserById(userId, {
        app_metadata: { app_role: 'superadmin' },
        user_metadata: { nome, cpf }
      });
    } else {
      const { data: created, error } = await svc.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { app_role: 'superadmin' },
        user_metadata: { nome, cpf }
      });
      if (error || !created.user) {
        return new Response(JSON.stringify({ error: "Falha ao criar superadmin" }), { status: 500, headers: { "content-type": "application/json" } });
      }
      userId = created.user.id;
    }

    // Upsert account row
    if (userId) {
      const { error: accErr } = await svc
        .from('accounts')
        .upsert({ user_id: userId, role: 'superadmin', nome, cpf, email }, { onConflict: 'user_id' });
      if (accErr) {
        return new Response(JSON.stringify({ error: "Falha ao registrar account" }), { status: 500, headers: { "content-type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ user_id: userId }), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Requisição inválida" }), { status: 400, headers: { "content-type": "application/json" } });
  }
});