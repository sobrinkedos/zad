import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_KEY

export const supabase = (() => {
  if (!supabaseUrl || !supabaseKey) {
    return new Proxy({}, {
      get() {
        throw new Error('Configuração Supabase ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY')
      }
    }) as any
  }
  return createClient(supabaseUrl, supabaseKey)
})()
