import { useSupabaseClient, useSupabaseUser } from '#imports'

export function useAuth() {
  const user = useSupabaseUser()

  function getClient() {
    return useSupabaseClient()
  }

  async function login(email: string, password: string) {
    const client = getClient()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
    return true
  }

  async function register(payload: { email: string, password: string, nome?: string, cpf?: string, telefone?: string }) {
    const client = getClient()
    const { error } = await client.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          nome: payload.nome,
          cpf: payload.cpf,
          telefone: payload.telefone
        }
      }
    })
    if (error) throw error
    return true
  }

  async function resendConfirmation(email: string) {
    const client = getClient()
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email,
    })
    if (error) throw error
    return true
  }

  async function logout() {
    const client = getClient()
    const { error } = await client.auth.signOut()
    if (error) throw error
    return true
  }

  return { user, login, register, resendConfirmation, logout }
}