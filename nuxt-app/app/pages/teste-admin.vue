<template>
  <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
    <h1>Teste Criação de Admin</h1>
    
    <div style="margin-bottom: 2rem;">
      <h2>Status: {{ status }}</h2>
      <p v-if="message" style="background: #f0f0f0; padding: 1rem; border-radius: 8px;">
        {{ message }}
      </p>
    </div>
    
    <button 
      @click="createAdmin" 
      :disabled="loading"
      style="background: #007bff; color: white; padding: 1rem 2rem; border: none; border-radius: 4px; cursor: pointer;"
    >
      {{ loading ? 'Criando...' : 'Criar Conta Admin' }}
    </button>
    
    <div v-if="error" style="color: red; margin-top: 1rem;">
      {{ error }}
    </div>
    
    <div v-if="success" style="color: green; margin-top: 1rem;">
      ✅ Conta criada com sucesso!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
const status = ref('Aguardando...')
const message = ref('')
const error = ref('')
const success = ref(false)

const { register } = useAuth()

async function createAdmin() {
  loading.value = true
  error.value = ''
  success.value = false
  status.value = 'Tentando criar conta...'
  
  try {
    const adminData = {
      email: 'riltons@gmail.com',
      password: 'admin123456',
      nome: 'Rilton Silva',
      cpf: '123.456.789-09',
      telefone: '(11) 98765-4321'
    }
    
    message.value = `Tentando criar conta com email: ${adminData.email}`
    
    await register(adminData)
    
    status.value = '✅ Sucesso!'
    message.value = 'Conta de admin criada com sucesso! Você pode fazer login agora.'
    success.value = true
    
  } catch (err: any) {
    status.value = '❌ Erro'
    error.value = err.message || 'Erro desconhecido ao criar conta'
    message.value = `Erro: ${error.value}`
  } finally {
    loading.value = false
  }
}
</script>