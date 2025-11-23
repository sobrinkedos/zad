import React, { createContext, useState, useEffect, useContext } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextType = {
    session: Session | null
    loading: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    loading: true,
    isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            checkUserRole(session)
            setLoading(false)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            checkUserRole(session)
            setLoading(false)
        })
    }, [])

    const checkUserRole = async (session: Session | null) => {
        if (!session?.user) {
            setIsAdmin(false)
            return
        }
        // Check if user has admin/fiscal role in accounts table
        // For now, we just assume false or check a claim if available
        // Implementation depends on how roles are stored (public.accounts or auth.users metadata)
        setIsAdmin(false)
    }

    return (
        <AuthContext.Provider value={{ session, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
