<template>
  <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <h1>Teste Login - Zona Azul Digital</h1>
    
    <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
      <h3>Credenciais para teste:</h3>
      <p><strong>Email:</strong> riltons@gmail.com</p>
      <p><strong>Senha:</strong> admin123456</p>
    </div>
    
    <form @submit.prevent="testLogin" style="display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <label>Email:</label>
        <input 
          v-model="form.email" 
          type="email" 
          required
          style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
        >
      </div>
      
      <div>
        <label>Senha:</label>
        <input 
          v-model="form.password" 
          type="password" 
          required
          style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
        >
      </div>
      
      <button 
        type="submit"
        :disabled="loading"
        style="background: #007bff; color: white; padding: 0.75rem; border: none; border-radius: 4px; cursor: pointer;"
      >
        {{ loading ? 'Testando...' : 'Testar Login' }}
      </button>
    </form>
    
    <div v-if="result" style="margin-top: 1rem; padding: 1rem; border-radius: 8px;" :style="{ background: result.success ? '#d4edda' : '#f8d7da', color: result.success ? '#155724' : '#721c24' }">
      <h4>{{ result.success ? '✅ Sucesso!' : '❌ Erro' }}</h4>
      <p>{{ result.message }}</p>
      <div v-if="result.user" style="margin-top: 1rem; background: rgba(255,255,255,0.5); padding: 1rem; border-radius: 4px;">
        <h5>Dados do usuário:</h5>
        <p><strong>ID:</strong> {{ result.user.id }}</p>
        <p><strong>Email:</strong> {{ result.user.email }}</p>
        <p><strong>Nome:</strong> {{ result.user.user_metadata?.nome || 'Não informado' }}</p>
      </div>
    </div>
    
    <div style="margin-top: 2rem; padding: 1rem; background: #e3f2fd; border-radius: 8px;">
      <h4>📝 Instruções:</h4>
      <ol style="margin-left: 1rem;">
        <li>Clique em "Testar Login" para verificar se a conta existe</li>
        <li>Se der erro, a conta ainda não foi criada</li>
        <li>Se der certo, você verá os dados do usuário logado</li>
        <li>Após login bem-sucedido, você será redirecionado</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const loading = ref(false)
const result = ref<any>(null)

const form = reactive({
  email: 'riltons@gmail.com',
  password: 'admin123456'
})

const { login } = useAuth()

async function testLogin() {
  loading.value = true
  result.value = null
  
  try {
    await login(form.email, form.password)
    
    result.value = {
      success: true,
      message: 'Login realizado com sucesso! Redirecionando...',
      user: { email: form.email }
    }
    
    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
    
  } catch (error: any) {
    result.value = {
      success: false,
      message: `Erro ao fazer login: ${error.message || 'Credenciais inválidas ou conta não existe'}`,
      user: null
    }
  } finally {
    loading.value = false
  }
}
</script>