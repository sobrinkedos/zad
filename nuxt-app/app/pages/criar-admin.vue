<template>
  <div style="min-height: 100vh; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); display: flex; align-items: center; justify-content: center; padding: 1rem; font-family: system-ui, -apple-system, sans-serif;">
    <div style="background: white; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); padding: 2.5rem; width: 100%; max-width: 30rem; text-align: center;">
      <!-- Ícone/Logo -->
      <div style="margin: 0 auto 1.5rem; width: 5rem; height: 5rem; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 2.5rem; height: 2.5rem; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      </div>
      
      <!-- Título -->
      <h1 style="font-size: 1.875rem; font-weight: 800; color: #1f2937; margin-bottom: 0.5rem; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Zona Azul Digital
      </h1>
      <p style="color: #6b7280; font-size: 1.125rem; margin-bottom: 2rem;">Configurando Super Admin...</p>
      
      <!-- Status -->
      <div v-if="status === 'loading'" style="margin-bottom: 2rem;">
        <div style="display: inline-block; width: 3rem; height: 3rem; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
        <p style="color: #374151; font-weight: 500;">Criando conta de super administrador...</p>
      </div>
      
      <div v-else-if="status === 'success'" style="margin-bottom: 2rem;">
        <div style="display: inline-block; width: 4rem; height: 4rem; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg style="width: 2rem; height: 2rem; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 style="color: #16a34a; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">✅ Sucesso!</h2>
        <p style="color: #374151; margin-bottom: 1rem;">Super Admin criado com sucesso!</p>
        <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; text-align: left;">
          <p style="font-size: 0.875rem; color: #166534; margin-bottom: 0.5rem;"><strong>📧 Email:</strong> riltons@gmail.com</p>
          <p style="font-size: 0.875rem; color: #166534; margin-bottom: 0;"><strong>🔐 Senha:</strong> admin123456</p>
        </div>
      </div>
      
      <div v-else-if="status === 'exists'" style="margin-bottom: 2rem;">
        <div style="display: inline-block; width: 4rem; height: 4rem; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg style="width: 2rem; height: 2rem; color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 style="color: #f59e0b; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">⚠️ Conta já existe!</h2>
        <p style="color: #374151; margin-bottom: 1rem;">O Super Admin já está configurado!</p>
        <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; text-align: left;">
          <p style="font-size: 0.875rem; color: #854d0e; margin-bottom: 0.5rem;"><strong>📧 Email:</strong> riltons@gmail.com</p>
          <p style="font-size: 0.875rem; color: #854d0e; margin-bottom: 0;"><strong>🔐 Senha:</strong> admin123456</p>
        </div>
      </div>
      
      <div v-else-if="status === 'error'" style="margin-bottom: 2rem;">
        <div style="display: inline-block; width: 4rem; height: 4rem; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg style="width: 2rem; height: 2rem; color: #dc2626;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 style="color: #dc2626; font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">❌ Erro!</h2>
        <p style="color: #374151; margin-bottom: 1rem;">{{ errorMessage }}</p>
      </div>
      
      <!-- Botão de ação -->
      <div v-if="status === 'success' || status === 'exists'" style="margin-bottom: 1.5rem;">
        <button 
          @click="goToLogin"
          style="width: 100%; background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%); color: white; padding: 0.875rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
          @mouseenter="$event.target.style.background = 'linear-gradient(90deg, #15803d 0%, #16a34a 100%)'; $event.target.style.transform = 'translateY(-1px)';"
          @mouseleave="$event.target.style.background = 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)'; $event.target.style.transform = 'translateY(0)';"
        >
          Ir para Login
        </button>
      </div>
      
      <div v-else-if="status === 'error'" style="margin-bottom: 1.5rem;">
        <button 
          @click="createSuperAdmin"
          style="width: 100%; background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%); color: white; padding: 0.875rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
          @mouseenter="$event.target.style.background = 'linear-gradient(90deg, #b91c1c 0%, #dc2626 100%)'; $event.target.style.transform = 'translateY(-1px)';"
          @mouseleave="$event.target.style.background = 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'; $event.target.style.transform = 'translateY(0)';"
        >
          Tentar Novamente
        </button>
      </div>
      
      <!-- Link para login manual -->
      <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">
        Ou acesse diretamente: 
        <a href="/login" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Página de Login</a>
      </p>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const status = ref<'idle' | 'loading' | 'success' | 'exists' | 'error'>('idle')
const errorMessage = ref('')

const form = reactive({
  nome: 'Rilton Silva',
  email: 'riltons@gmail.com',
  password: 'admin123456',
  telefone: '(11) 98765-4321',
  cpf: '123.456.789-09'
})

const { register } = useAuth()

// Criar superadmin automaticamente ao montar a página
onMounted(async () => {
  await createSuperAdmin()
})

async function createSuperAdmin() {
  status.value = 'loading'
  errorMessage.value = ''
  
  try {
    // Tentar criar conta diretamente via registro
    await register({
      email: form.email,
      password: form.password,
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone
    })
    
    status.value = 'success'
    
    // Aguardar 2 segundos e redirecionar para login
    setTimeout(() => {
      navigateTo('/login')
    }, 2000)
    
  } catch (error: any) {
    if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
      status.value = 'exists'
      
      // Tentar login para verificar status
      try {
        const { login } = useAuth()
        await login(form.email, form.password)
        // Se login funcionar, redirecionar
        setTimeout(() => {
          navigateTo('/motorista')
        }, 2000)
      } catch (loginError: any) {
        console.error('Login check failed:', loginError)
        if (loginError.message?.includes('Email not confirmed')) {
           errorMessage.value = 'Usuário existe mas email não confirmado. Verifique sua caixa de entrada.'
           status.value = 'error'
        }
      }
    } else {
      status.value = 'error'
      errorMessage.value = error.message || 'Erro ao criar superadmin'
    }
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  navigateTo('/login')
}
</script>

<style>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>