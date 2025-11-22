<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-10">
    <UContainer>
      <UCard class="max-w-md mx-auto">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-car" class="w-6 h-6 text-blue-600" />
            <div>
              <h1 class="text-lg font-bold">Zona Azul Digital</h1>
              <p class="text-xs text-gray-500">Autenticação</p>
            </div>
          </div>
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

        <UDivider label="ou" class="my-4" />

        <UButton variant="ghost" icon="i-lucide-user-plus" block @click="showRegister = true">
          Criar nova conta
        </UButton>

        <UButton class="mt-2" icon="i-lucide-wallet" block @click="creditsOpen = true">
          Adicionar Créditos
        </UButton>

        <UModal v-model="showRegister">
          <UCard class="max-w-md mx-auto">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-user-plus" class="w-5 h-5" />
                <span class="font-semibold">Criar Conta</span>
              </div>
            </template>
            <UForm :state="reg" @submit="onRegister" class="space-y-4">
              <UFormGroup label="Nome" name="nome">
                <UInput v-model="reg.nome" placeholder="João Silva" />
              </UFormGroup>
              <UFormGroup label="CPF" name="cpf">
                <UInput v-model="reg.cpf" placeholder="000.000.000-00" />
              </UFormGroup>
              <UFormGroup label="Email" name="email">
                <UInput v-model="reg.email" type="email" placeholder="seu@email.com" />
              </UFormGroup>
              <UFormGroup label="Telefone" name="telefone">
                <UInput v-model="reg.telefone" placeholder="(00) 00000-0000" />
              </UFormGroup>
              <UFormGroup label="Senha" name="senha">
                <UInput v-model="reg.senha" type="password" placeholder="••••••••" />
              </UFormGroup>
              <div class="flex gap-2">
                <UButton type="button" variant="ghost" block @click="showRegister = false">Cancelar</UButton>
                <UButton type="submit" color="green" block>Criar Conta</UButton>
              </div>
            </UForm>
          </UCard>
        </UModal>

      </UCard>
    </UContainer>
    <UNotifications />
    <CreditsModal v-model="creditsOpen" />
  </div>
</template>

<script setup lang="ts">
const showRegister = ref(false)
const creditsOpen = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const reg = reactive({
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  senha: ''
})

const toast = useToast()
const { login: authLogin, register: authRegister } = useAuth()

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

async function onRegister () {
  if (!reg.nome || !reg.cpf || !reg.email || !reg.telefone || !reg.senha) {
    toast.add({ title: 'Preencha todos os campos', color: 'red' })
    return
  }
  try {
    await authRegister({ email: reg.email, password: reg.senha, nome: reg.nome, cpf: reg.cpf, telefone: reg.telefone })
    showRegister.value = false
    toast.add({ title: 'Conta criada com sucesso!', color: 'green' })
  } catch (e: any) {
    toast.add({ title: e.message || 'Erro ao criar conta', color: 'red' })
  }
}
</script>
