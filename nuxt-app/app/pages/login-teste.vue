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
      
      <!-- Mensagem de erro se houver -->
      <div v-if="error" style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; color: #dc2626;">
        <strong>Erro:</strong> {{ error }}
      </div>
      
      <!-- Mensagem de sucesso se houver -->
      <div v-if="success" style="background: #dcfce7; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; color: #16a34a;">
        <strong>Sucesso:</strong> {{ success }}
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
      
      <!-- Opções adicionais -->
      <div style="margin-top: 1.5rem; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 1rem;">
        <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Não tem uma conta?</p>
        <button 
          type="button"
          @click="handleRegister"
          :disabled="loadingRegister"
          style="background: transparent; color: #2563eb; border: 1px solid #2563eb; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;"
          @mouseenter="$event.target.style.background = '#2563eb'; $event.target.style.color = 'white';"
          @mouseleave="$event.target.style.background = 'transparent'; $event.target.style.color = '#2563eb';"
        >
          Criar Conta de Teste
        </button>
      </div>
      
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
const loadingRegister = ref(false)
const error = ref('')
const success = ref('')
const form = reactive({
  email: '',
  password: ''
})

const { login, register } = useAuth()
const toast = useToast()

async function handleLogin() {
  error.value = ''
  success.value = ''
  
  if (!form.email || !form.password) {
    error.value = 'Preencha todos os campos'
    return
  }
  
  loading.value = true
  try {
    await login(form.email, form.password)
    success.value = 'Login realizado com sucesso! Redirecionando...'
    
    // Aguardar um momento para mostrar a mensagem de sucesso
    setTimeout(() => {
      navigateTo('/motorista')
    }, 1500)
    
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login. Verifique suas credenciais.'
    
    // Sugerir criar conta se o usuário não existir
    if (err.message?.includes('Invalid login credentials')) {
      error.value += ' Tente criar uma conta de teste clicando em "Criar Conta de Teste".'
    }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  success.value = ''
  
  // Criar conta de teste com email padrão
  const testEmail = 'teste@zonaazul.com'
  const testPassword = 'teste123'
  
  loadingRegister.value = true
  try {
    await register({
      email: testEmail,
      password: testPassword,
      nome: 'Usuário Teste',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321'
    })
    
    success.value = 'Conta criada com sucesso! Use email: teste@zonaazul.com e senha: teste123'
    
    // Preencher o formulário com as credenciais criadas
    form.email = testEmail
    form.password = testPassword
    
  } catch (err: any) {
    if (err.message?.includes('already registered')) {
      error.value = 'Conta já existe! Use email: teste@zonaazul.com e senha: teste123'
      form.email = testEmail
      form.password = testPassword
    } else {
      error.value = err.message || 'Erro ao criar conta'
    }
  } finally {
    loadingRegister.value = false
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