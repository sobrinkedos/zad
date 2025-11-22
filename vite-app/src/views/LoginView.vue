<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Zona Azul Digital</h1>
        <p class="text-gray-500">Entre na sua conta</p>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="seu@email.com"
            required
          >
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="••••••••"
            required
          >
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      
      <!-- Footer -->
      <div class="mt-8 text-center">
        <a href="/" class="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
          Voltar para Início
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, resendConfirmation } = useAuth()

const loading = ref(false)
const form = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  if (!form.email || !form.password) {
    alert('Preencha todos os campos')
    return
  }
  
  loading.value = true
  try {
    await login(form.email, form.password)
    // alert('Login realizado com sucesso!')
    router.push('/motorista')
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.message?.includes('Email not confirmed')) {
      if (confirm('Email não confirmado. Deseja reenviar o email de confirmação?')) {
        try {
          await resendConfirmation(form.email)
          alert('Email reenviado!')
        } catch (e: any) {
          alert('Erro ao reenviar: ' + e.message)
        }
      }
    } else {
      alert(error.message || 'Erro ao fazer login')
    }
  } finally {
    loading.value = false
  }
}
</script>
