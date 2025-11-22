import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)

// Initialize user
supabase.auth.getSession().then(({ data: { session } }) => {
    user.value = session?.user ?? null
})

supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
})

export function useAuth() {
    async function login(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return true
    }

    async function register(payload: { email: string, password: string, nome?: string, cpf?: string, telefone?: string }) {
        const { error } = await supabase.auth.signUp({
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
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        })
        if (error) throw error
        return true
    }

    async function logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return true
    }

    return { user, login, register, resendConfirmation, logout }
}
