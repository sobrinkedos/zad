<template>
  <div class="min-h-screen bg-blue-500 flex items-center justify-center">
    <UCard class="max-w-md w-full mx-4">
      <template #header>
        <h1 class="text-lg font-bold">Zona Azul Digital - Login</h1>
      </template>
      
      <UForm :state="form" @submit="onLogin" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput v-model="form.email" type="email" placeholder="seu@email.com" />
        </UFormGroup>
        <UFormGroup label="Senha" name="password">
          <UInput v-model="form.password" type="password" placeholder="••••••••" />
        </UFormGroup>
        <UButton type="submit" color="primary" block>
          Entrar
        </UButton>
      </UForm>
      
      <template #footer>
        <UButton to="/" variant="ghost" block>
          Voltar para Início
        </UButton>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  email: '',
  password: ''
})

const toast = useToast()
const { login: authLogin } = useAuth()

async function onLogin () {
  if (!form.email || !form.password) {
    toast.add({ title: 'Preencha todos os campos', color: 'red' })
    return
  }
  try {
    await authLogin(form.email, form.password)
    toast.add({ title: 'Login realizado com sucesso!', color: 'green' })
    navigateTo('/motorista')
  } catch (e: any) {
    toast.add({ title: e.message || 'Erro ao autenticar', color: 'red' })
  }
}
</script>