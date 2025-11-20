import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const url = window.SUPABASE_URL;
const anon = window.SUPABASE_ANON_KEY;
export const supabase = createClient(url, anon);

export async function adminLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const role = data.user?.app_metadata?.app_role;
  if (role !== 'admin') throw new Error('Acesso negado: usuário não é admin');
  return data.user;
}

export async function listPenalties() {
  const { data, error } = await supabase
    .from('penalties')
    .select('id,valor,motivo,created_at,evidencias_url,vehicle_id,zone_id')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function signEvidence(penaltyId, path) {
  const res = await fetch(`${url}/functions/v1/evidences-sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ''}`,
      'apikey': anon
    },
    body: JSON.stringify({ penalty_id: penaltyId, path, expires_in: 300 })
  });
  if (!res.ok) throw new Error('Falha ao assinar evidência');
  const json = await res.json();
  return json.signedUrl;
}

export async function listZones() {
  const { data, error } = await supabase
    .from('zones')
    .select('id,nome,localizacao,valor_hora,horario_inicio,horario_fim,dias_funcionamento,tolerancia_minutos,status,vagas')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createZone(zone) {
  const { error } = await supabase.from('zones').insert(zone);
  if (error) throw new Error(error.message);
}

export async function updateZone(id, zone) {
  const { error } = await supabase.from('zones').update(zone).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteZone(id) {
  const { error } = await supabase.from('zones').delete().eq('id', id);
  if (error) throw new Error(error.message);
}