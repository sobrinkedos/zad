<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Zona Azul Digital</h1>
        <p class="text-gray-600">Entre na sua conta</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="seu@email.com"
            required
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
            required
          >
        </div>
        
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      
      <div class="mt-8 text-center">
        <a href="/" class="text-sm text-blue-600 hover:text-blue-800">
          Voltar para Início
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// Versão simplificada sem dependências externas
const loading = ref(false)
const email = ref('')
const password = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    alert('Preencha todos os campos')
    return
  }
  
  loading.value = true
  try {
    console.log('Tentando login com:', email.value)
    // Teste básico - simular login bem-sucedido
    if (email.value === 'teste@email.com' && password.value === '123456') {
      alert('Login realizado com sucesso!')
      window.location.href = '/motorista'
    } else {
      alert('Credenciais de teste: teste@email.com / 123456')
    }
  } catch (error) {
    alert('Erro ao fazer login')
  } finally {
    loading.value = false
  }
}
</script>