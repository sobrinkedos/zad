<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <UCard class="max-w-md w-full">
      <template #header>
        <div class="text-center">
          <UIcon name="i-lucide-car" class="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h1 class="text-xl font-bold text-gray-800">Zona Azul Digital</h1>
          <p class="text-sm text-gray-500">Entre na sua conta</p>
        </div>
      </template>
      
      <UForm :state="form" @submit="handleLogin" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput 
            v-model="form.email" 
            type="email" 
            placeholder="seu@email.com"
            icon="i-lucide-mail"
          />
        </UFormGroup>
        
        <UFormGroup label="Senha" name="password">
          <UInput 
            v-model="form.password" 
            type="password" 
            placeholder="••••••••"
            icon="i-lucide-lock"
          />
        </UFormGroup>
        
        <UButton 
          type="submit" 
          color="primary" 
          block
          :loading="loading"
        >
          Entrar
        </UButton>
      </UForm>
      
      <template #footer>
        <div class="text-center space-y-2">
          <a href="/" class="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
            <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
            Voltar para Início
          </a>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
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
    // Simular login - substituir por lógica real depois
    console.log('Login:', form.email, form.password)
    alert('Login realizado com sucesso!')
    navigateTo('/motorista')
  } catch (error) {
    alert('Erro ao fazer login')
  } finally {
    loading.value = false
  }
}
</script>