<template>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #3b82f6 0%, #9333ea 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: white; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem; width: 100%; max-width: 28rem;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="margin: 0 auto; width: 4rem; height: 4rem; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
          <svg style="width: 2rem; height: 2rem; color: #2563eb;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h1 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">Zona Azul Digital</h1>
        <p style="color: #6b7280;">Entre na sua conta</p>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <label for="email" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            <svg style="width: 1rem; height: 1rem; display: inline; margin-right: 0.5rem; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
            </svg>
            Email
          </label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            style="width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            placeholder="seu@email.com"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <div>
          <label for="password" style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            <svg style="width: 1rem; height: 1rem; display: inline; margin-right: 0.5rem; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            Senha
          </label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            style="width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            placeholder="••••••••"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          style="width: 100%; background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s;"
          @mouseenter="$event.target.style.background = 'linear-gradient(90deg, #1d4ed8 0%, #6d28d9 100%)';"
          @mouseleave="$event.target.style.background = 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)';"
        >
          <span v-if="loading" style="display: inline-block; width: 1rem; height: 1rem; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></span>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      
      <!-- Footer -->
      <div style="margin-top: 2rem; text-align: center;">
        <a href="/" style="display: inline-flex; align-items: center; font-size: 0.875rem; color: #2563eb; text-decoration: none; transition: color 0.2s;"
           @mouseenter="$event.target.style.color = '#1d4ed8';"
           @mouseleave="$event.target.style.color = '#2563eb';">
          <svg style="width: 1rem; height: 1rem; margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Voltar para Início
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const form = reactive({
  email: '',
  password: ''
})

const { login, resendConfirmation } = useAuth()
const toast = useToast()

async function handleLogin() {
  if (!form.email || !form.password) {
    toast.add({
      title: 'Preencha todos os campos',
      color: 'red'
    })
    return
  }
  
  loading.value = true
  try {
    await login(form.email, form.password)
    toast.add({
      title: 'Login realizado com sucesso!',
      color: 'green'
    })
    navigateTo('/motorista')
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.message?.includes('Email not confirmed')) {
      toast.add({
        title: 'Email não confirmado',
        description: 'Por favor, verifique seu email para confirmar sua conta.',
        color: 'yellow',
        actions: [{
          label: 'Reenviar Email',
          click: async () => {
            try {
              await resendConfirmation(form.email)
              toast.add({ title: 'Email reenviado!', color: 'green' })
            } catch (e: any) {
              toast.add({ title: 'Erro ao reenviar', description: e.message, color: 'red' })
            }
          }
        }]
      })
    } else {
      toast.add({
        title: error.message || 'Erro ao fazer login',
        color: 'red'
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>