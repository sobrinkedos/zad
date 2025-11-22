<template>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); display: flex; align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: white; border-radius: 0.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2rem; width: 100%; max-width: 32rem;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="margin: 0 auto; width: 5rem; height: 5rem; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
          <svg style="width: 2.5rem; height: 2.5rem; color: #1e40af;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: bold; color: #1f2937; margin-bottom: 0.5rem;">Criar Super Admin</h1>
        <p style="color: #6b7280;">Configurar conta administrativa principal</p>
      </div>
      
      <!-- Mensagem de status -->
      <div v-if="status" :style="{ background: statusType === 'success' ? '#dcfce7' : '#fee2e2', border: statusType === 'success' ? '1px solid #86efac' : '1px solid #fca5a5', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem', color: statusType === 'success' ? '#16a34a' : '#dc2626' }">
        <strong>{{ statusType === 'success' ? '✅ Sucesso:' : '❌ Erro:' }}</strong> {{ status }}
      </div>
      
      <!-- Form de criação -->
      <form @submit.prevent="createSuperAdmin" style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
            👤 Nome Completo
          </label>
          <input 
            v-model="form.nome" 
            type="text" 
            placeholder="Digite o nome do administrador"
            style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
            📧 Email
          </label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="riltons@gmail.com"
            style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
            🔐 Senha
          </label>
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Digite uma senha segura"
            style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
            📱 Telefone
          </label>
          <input 
            v-model="form.telefone" 
            type="tel" 
            placeholder="(00) 00000-0000"
            style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <div>
          <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
            🆔 CPF
          </label>
          <input 
            v-model="form.cpf" 
            type="text" 
            placeholder="000.000.000-00"
            style="width: 100%; padding: 0.875rem 1rem; border: 2px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; transition: all 0.2s;"
            required
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1);'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none';"
          >
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          style="width: 100%; background: linear-gradient(90deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 1rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
          @mouseenter="$event.target.style.background = 'linear-gradient(90deg, #1e3a8a 0%, #6d28d9 100%)'; $event.target.style.transform = 'translateY(-1px)';"
          @mouseleave="$event.target.style.background = 'linear-gradient(90deg, #1e40af 0%, #7c3aed 100%)'; $event.target.style.transform = 'translateY(0)';"
        >
          <span v-if="loading" style="display: inline-block; width: 1rem; height: 1rem; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></span>
          {{ loading ? 'Criando Super Admin...' : 'Criar Super Admin' }}
        </button>
      </form>
      
      <!-- Informações -->
      <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; border-left: 4px solid #3b82f6;">
        <h3 style="font-weight: 600; color: #1e40af; margin-bottom: 0.5rem;">📋 Informações Importantes:</h3>
        <ul style="color: #64748b; font-size: 0.875rem; margin: 0; padding-left: 1rem;">
          <li>Esta conta terá acesso total ao sistema</li>
          <li>Você poderá gerenciar usuários, zonas e configurações</li>
          <li>Após criar, use o email e senha para fazer login</li>
        </ul>
      </div>
      
      <!-- Link para login -->
      <div style="margin-top: 1.5rem; text-align: center;">
        <a href="/login" style="display: inline-flex; align-items: center; font-size: 0.875rem; color: #3b82f6; text-decoration: none; font-weight: 500; transition: color 0.2s;"
           @mouseenter="$event.target.style.color = '#1e40af';"
           @mouseleave="$event.target.style.color = '#3b82f6';">
          <svg style="width: 1rem; height: 1rem; margin-right: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Voltar para Login
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const status = ref('')
const statusType = ref<'success' | 'error'>('success')

const form = reactive({
  nome: 'Rilton Silva',
  email: 'riltons@gmail.com',
  password: 'admin123456',
  telefone: '(11) 98765-4321',
  cpf: '123.456.789-09'
})

const { register } = useAuth()
const toast = useToast()

async function createSuperAdmin() {
  loading.value = true
  status.value = ''
  
  try {
    // Criar conta no Supabase
    await register({
      email: form.email,
      password: form.password,
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone
    })
    
    statusType.value = 'success'
    status.value = `✅ Super Admin criado com sucesso! Email: ${form.email} / Senha: ${form.password}`
    
    // Mostrar também no toast
    toast.add({
      title: 'Super Admin criado com sucesso!',
      description: `Use ${form.email} e ${form.password} para fazer login`,
      color: 'green'
    })
    
    // Redirecionar para login após 3 segundos
    setTimeout(() => {
      navigateTo('/login')
    }, 3000)
    
  } catch (error: any) {
    statusType.value = 'error'
    
    if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
      status.value = '❌ Este email já está cadastrado! Tente fazer login ou use outro email.'
    } else if (error.message?.includes('Password should be at least 6 characters')) {
      status.value = '❌ A senha deve ter pelo menos 6 caracteres!'
    } else if (error.message?.includes('Invalid email')) {
      status.value = '❌ Email inválido! Verifique o formato.'
    } else {
      status.value = `❌ Erro ao criar conta: ${error.message || 'Erro desconhecido'}`
    }
    
    toast.add({
      title: 'Erro ao criar conta',
      description: error.message || 'Erro desconhecido',
      color: 'red'
    })
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