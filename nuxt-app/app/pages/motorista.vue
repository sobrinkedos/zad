<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-6">
    <UContainer>
      <UNavbar>
        <template #left>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-car" class="w-6 h-6 text-white" />
            <span class="text-white font-semibold">Zona Azul</span>
          </div>
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-user" variant="ghost" />
            <UButton icon="i-lucide-log-out" variant="ghost" @click="logout" />
          </div>
        </template>
      </UNavbar>

      <div class="mt-6 space-y-6">
        <UCard class="credit-card text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-amber-100 text-sm mb-1">Seus Créditos</p>
              <p class="text-3xl font-bold">{{ formatCurrency(balance) }}</p>
            </div>
            <UButton variant="soft" color="white" @click="creditsOpen = true">Adicionar</UButton>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Meus Veículos</h3>
              <UButton icon="i-lucide-plus" variant="ghost" @click="vehicleOpen = true" />
            </div>
          </template>
          <div class="space-y-3">
            <div v-if="vehicles.length === 0" class="text-gray-500 text-sm">Nenhum veículo cadastrado</div>
            <div v-else class="space-y-2">
              <div v-for="v in vehicles" :key="v.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <UIcon name="i-lucide-car" class="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="font-medium">{{ v.placa }}</p>
                    <p class="text-sm text-gray-600">{{ v.marca }} {{ v.modelo }}</p>
                  </div>
                </div>
                <UButton icon="i-lucide-trash-2" color="red" variant="ghost" @click="removeVehicle(v.id)" />
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Zonas Disponíveis</h3>
          </template>
          <div class="space-y-3">
            <div v-for="z in zones" :key="z.id" class="p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold">{{ z.nome }}</h4>
                <span class="text-green-600 font-bold">{{ formatCurrency(z.valor_hora) }}/h</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ z.localizacao }}</p>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ z.horario_inicio }} - {{ z.horario_fim }}</span>
                <span>{{ z.vagas }} vagas</span>
              </div>
            </div>
          </div>
        </UCard>

        <UButton v-if="vehicles.length > 0" color="primary" block size="lg" icon="i-lucide-navigation" @click="parkingOpen = true">
          Estacionar Agora
        </UButton>
      </div>
    </UContainer>

    <UNotifications />
    <CreditsModal v-model="creditsOpen" />

    <UModal v-model="vehicleOpen">
      <UCard class="max-w-sm mx-auto">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Adicionar Veículo</h3>
            <UButton icon="i-lucide-x" variant="ghost" @click="vehicleOpen = false" />
          </div>
        </template>
        <UForm :state="vehicleForm" class="space-y-4">
          <UFormGroup label="Placa" name="placa">
            <UInput v-model="vehicleForm.placa" />
          </UFormGroup>
          <UFormGroup label="Marca" name="marca">
            <UInput v-model="vehicleForm.marca" />
          </UFormGroup>
          <UFormGroup label="Modelo" name="modelo">
            <UInput v-model="vehicleForm.modelo" />
          </UFormGroup>
          <UFormGroup label="Cor" name="cor">
            <UInput v-model="vehicleForm.cor" />
          </UFormGroup>
          <UFormGroup label="Ano" name="ano">
            <UInput v-model.number="vehicleForm.ano" type="number" />
          </UFormGroup>
          <UButton color="primary" block @click="saveVehicle">Salvar Veículo</UButton>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="parkingOpen">
      <UCard class="max-w-sm mx-auto">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Estacionar</h3>
            <UButton icon="i-lucide-x" variant="ghost" @click="parkingOpen = false" />
          </div>
        </template>
        <div class="space-y-4">
          <UForm :state="parkingForm" class="space-y-4">
            <UFormGroup label="Veículo" name="vehicle_id">
              <USelect v-model="parkingForm.vehicle_id" :options="vehicleOptions" />
            </UFormGroup>
            <UFormGroup label="Zona" name="zone_id">
              <USelect v-model="parkingForm.zone_id" :options="zoneOptions" />
            </UFormGroup>
            <UTabs v-model="selectedTime" :items="timeItems" variant="pill" />
          </UForm>
          <div class="border-t pt-4 flex items-center justify-between">
            <span class="font-medium">Custo Estimado:</span>
            <span class="text-xl font-bold text-blue-600">{{ formatCurrency(estimatedCost) }}</span>
          </div>
          <UButton color="primary" block @click="confirmParking">Confirmar Estacionamento</UButton>
        </div>
      </UCard>
    </UModal>
  </div>
  
</template>

<script setup lang="ts">
const toast = useToast()
const { user, logout: authLogout } = useAuth()

const balance = ref(0)
const vehicles = ref<Array<any>>([])
const zones = ref<Array<any>>([
  { id: 'z1', nome: 'Centro', valor_hora: 5, localizacao: 'Rua Principal', horario_inicio: '08:00', horario_fim: '18:00', vagas: 50 },
  { id: 'z2', nome: 'Shopping', valor_hora: 6, localizacao: 'Av. Comercial', horario_inicio: '09:00', horario_fim: '20:00', vagas: 80 }
])

const creditsOpen = ref(false)
const vehicleOpen = ref(false)
const parkingOpen = ref(false)

const vehicleForm = reactive({ placa: '', marca: '', modelo: '', cor: '', ano: 2024 })
const parkingForm = reactive({ vehicle_id: '', zone_id: '' })

const timeItems = [
  { label: '30min', slot: 't30', value: '30' },
  { label: '1h', slot: 't60', value: '60' },
  { label: '2h', slot: 't120', value: '120' },
  { label: '3h', slot: 't180', value: '180' },
  { label: '4h', slot: 't240', value: '240' }
]
const selectedTime = ref('60')

const vehicleOptions = computed(() => vehicles.value.map(v => ({ label: `${v.placa} - ${v.marca} ${v.modelo}`, value: v.id })))
const zoneOptions = computed(() => zones.value.map(z => ({ label: `${z.nome} - ${formatCurrency(z.valor_hora)}/h`, value: z.id })))

const estimatedCost = computed(() => {
  const z = zones.value.find(zz => zz.id === parkingForm.zone_id)
  const minutes = parseInt(selectedTime.value)
  if (!z || !minutes) return 0
  const hours = Math.ceil(minutes / 60)
  return hours * z.valor_hora
})

function formatCurrency (n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function removeVehicle (id: string) {
  vehicles.value = vehicles.value.filter(v => v.id !== id)
  toast.add({ title: 'Veículo removido com sucesso!', color: 'green' })
}

function saveVehicle () {
  const { placa, marca, modelo, cor, ano } = vehicleForm
  if (!placa || !marca || !modelo || !cor || !ano) {
    toast.add({ title: 'Preencha todos os campos', color: 'red' })
    return
  }
  vehicles.value.push({ id: crypto.randomUUID(), placa, marca, modelo, cor, ano })
  Object.assign(vehicleForm, { placa: '', marca: '', modelo: '', cor: '', ano: 2024 })
  vehicleOpen.value = false
  toast.add({ title: 'Veículo cadastrado com sucesso!', color: 'green' })
}

function confirmParking () {
  const { vehicle_id, zone_id } = parkingForm
  const minutes = parseInt(selectedTime.value)
  if (!vehicle_id || !zone_id || !minutes) {
    toast.add({ title: 'Preencha todos os campos', color: 'red' })
    return
  }
  const cost = estimatedCost.value
  if (balance.value < cost) {
    toast.add({ title: 'Créditos insuficientes', color: 'red' })
    return
  }
  balance.value -= cost
  parkingOpen.value = false
  toast.add({ title: 'Estacionamento iniciado!', color: 'green' })
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

<style scoped>
.credit-card { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
</style>