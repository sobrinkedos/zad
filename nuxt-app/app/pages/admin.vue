<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 py-6">
    <UContainer>
      <UNavbar>
        <template #left>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-settings" class="w-6 h-6 text-white" />
            <span class="text-white font-semibold">Admin ZA</span>
          </div>
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-refresh-cw" variant="ghost" @click="refresh" />
            <UButton icon="i-lucide-log-out" variant="ghost" @click="logout" />
          </div>
        </template>
      </UNavbar>

      <div class="mt-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm mb-1">Total de Usuários</p>
                <p class="text-2xl font-bold">{{ stats.totalUsers }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-users" class="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm mb-1">Sessões Ativas</p>
                <p class="text-2xl font-bold">{{ stats.activeSessions }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-activity" class="w-6 h-6 text-green-600" />
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm mb-1">Receita do Dia</p>
                <p class="text-2xl font-bold">{{ formatCurrency(stats.todayRevenue) }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-dollar-sign" class="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm mb-1">Multas Hoje</p>
                <p class="text-2xl font-bold">{{ stats.dailyPenalties }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <UIcon name="i-lucide-alert-triangle" class="w-6 h-6 text-red-600" />
              </div>
            </div>
          </UCard>
        </div>

        <UTabs :items="tabs" class="mt-4" />

        <div v-if="currentTab === 'zones'" class="mt-4">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Zonas</h3>
                <UButton icon="i-lucide-plus" @click="zoneOpen = true">Nova Zona</UButton>
              </div>
            </template>
            <UTable :rows="zones" :columns="zoneColumns" />
            <UPagination v-model="zonePage" :page-count="5" class="mt-4" />
          </UCard>
        </div>

        <div v-if="currentTab === 'users'" class="mt-4">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Usuários</h3>
            </template>
            <UTable :rows="users" :columns="userColumns" />
            <UPagination v-model="userPage" :page-count="5" class="mt-4" />
          </UCard>
        </div>

        <div v-if="currentTab === 'fiscals'" class="mt-4">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Fiscais</h3>
            </template>
            <UTable :rows="fiscals" :columns="fiscalColumns" />
            <UPagination v-model="fiscalPage" :page-count="5" class="mt-4" />
          </UCard>
        </div>

        <div v-if="currentTab === 'transactions'" class="mt-4">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Transações</h3>
            </template>
            <UTable :rows="transactions" :columns="transactionColumns" />
            <UPagination v-model="transactionPage" :page-count="5" class="mt-4" />
          </UCard>
        </div>
      </div>
    </UContainer>

    <UModal v-model="zoneOpen">
      <UCard class="max-w-md mx-auto">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Nova Zona</h3>
            <UButton icon="i-lucide-x" variant="ghost" @click="zoneOpen = false" />
          </div>
        </template>
        <UForm :state="zoneForm" class="space-y-4">
          <UFormGroup label="Nome" name="nome"><UInput v-model="zoneForm.nome" /></UFormGroup>
          <UFormGroup label="Localização" name="localizacao"><UInput v-model="zoneForm.localizacao" /></UFormGroup>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Valor/Hora" name="valor_hora"><UInput v-model.number="zoneForm.valor_hora" type="number" /></UFormGroup>
            <UFormGroup label="Vagas" name="vagas"><UInput v-model.number="zoneForm.vagas" type="number" /></UFormGroup>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Início" name="inicio"><UInput v-model="zoneForm.horario_inicio" type="time" /></UFormGroup>
            <UFormGroup label="Fim" name="fim"><UInput v-model="zoneForm.horario_fim" type="time" /></UFormGroup>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" block @click="zoneOpen = false">Cancelar</UButton>
            <UButton color="purple" block @click="saveZone">Salvar</UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const { user, logout: authLogout } = useAuth()

const stats = reactive({ totalUsers: 0, activeSessions: 0, todayRevenue: 0, dailyPenalties: 0 })

const tabs = [
  { label: 'Zonas', value: 'zones' },
  { label: 'Usuários', value: 'users' },
  { label: 'Fiscais', value: 'fiscals' },
  { label: 'Transações', value: 'transactions' }
]
const currentTab = ref('zones')

const zones = ref<Array<any>>([
  { id: 'z1', nome: 'Centro', localizacao: 'Rua Principal', valor_hora: 5, vagas: 50, horario_inicio: '08:00', horario_fim: '18:00', status: 'ativa' }
])
const users = ref<Array<any>>([
  { user_id: 'u1', nome: 'João', email: 'joao@exemplo.com', cpf: '00000000000', role: 'motorista' }
])
const fiscals = ref<Array<any>>([
  { user_id: 'f1', nome: 'Fiscal 1', email: 'fiscal@exemplo.com', cpf: '11111111111' }
])
const transactions = ref<Array<any>>([
  { id: 't1', tipo: 'compra', valor: 25, metodo_pagamento: 'pix', status: 'concluido', created_at: new Date().toISOString() }
])

const zoneColumns = [
  { key: 'nome', label: 'Nome' },
  { key: 'localizacao', label: 'Localização' },
  { key: 'valor_hora', label: 'Valor/Hora' },
  { key: 'vagas', label: 'Vagas' },
  { key: 'status', label: 'Status' }
]
const userColumns = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'cpf', label: 'CPF' },
  { key: 'role', label: 'Perfil' }
]
const fiscalColumns = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'cpf', label: 'CPF' }
]
const transactionColumns = [
  { key: 'tipo', label: 'Tipo' },
  { key: 'valor', label: 'Valor' },
  { key: 'metodo_pagamento', label: 'Pagamento' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Data' }
]

const zoneOpen = ref(false)
const zoneForm = reactive({ nome: '', localizacao: '', valor_hora: 0, vagas: 0, horario_inicio: '08:00', horario_fim: '18:00' })

const zonePage = ref(1)
const userPage = ref(1)
const fiscalPage = ref(1)
const transactionPage = ref(1)

function formatCurrency (n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function refresh () {
  stats.totalUsers = users.value.length
  stats.activeSessions = Math.floor(Math.random() * 20)
  stats.todayRevenue = Math.floor(Math.random() * 1000)
  stats.dailyPenalties = Math.floor(Math.random() * 10)
  toast.add({ title: 'Dados atualizados com sucesso!', color: 'green' })
}

function saveZone () {
  const { nome, localizacao, valor_hora, vagas, horario_inicio, horario_fim } = zoneForm
  if (!nome || !localizacao || !valor_hora) {
    toast.add({ title: 'Preencha os campos obrigatórios', color: 'red' })
    return
  }
  zones.value.push({ id: crypto.randomUUID(), nome, localizacao, valor_hora, vagas, horario_inicio, horario_fim, status: 'ativa' })
  Object.assign(zoneForm, { nome: '', localizacao: '', valor_hora: 0, vagas: 0, horario_inicio: '08:00', horario_fim: '18:00' })
  zoneOpen.value = false
  toast.add({ title: 'Zona criada com sucesso!', color: 'green' })
}

function logout () {
  authLogout().finally(() => {
    navigateTo('/')
    toast.add({ title: 'Logout realizado', color: 'blue' })
  })
}

watchEffect(() => {
  if (!user.value) navigateTo('/')
})
</script>