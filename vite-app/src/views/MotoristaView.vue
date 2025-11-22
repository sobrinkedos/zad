<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white shadow-lg sticky top-0 z-30">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Car class="w-6 h-6" />
          <span class="font-bold text-lg">Zona Azul</span>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <User class="w-5 h-5" />
          </button>
          <button @click="handleLogout" class="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-4 mt-6 space-y-6 max-w-lg">
      <!-- Credits Card -->
      <div class="bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div>
            <p class="text-amber-100 text-sm font-medium mb-1">Seus Créditos</p>
            <p class="text-4xl font-bold">{{ formatCurrency(balance) }}</p>
          </div>
          <button 
            @click="creditsOpen = true"
            class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/30"
          >
            Adicionar
          </button>
        </div>
      </div>

      <!-- Vehicles Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <Car class="w-4 h-4 text-gray-500" />
            Meus Veículos
          </h3>
          <button @click="vehicleOpen = true" class="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors">
            <Plus class="w-5 h-5" />
          </button>
        </div>
        <div class="p-4">
          <div v-if="vehicles.length === 0" class="text-center py-8 text-gray-400 text-sm">
            Nenhum veículo cadastrado
          </div>
          <div v-else class="space-y-3">
            <div v-for="v in vehicles" :key="v.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors group">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Car class="w-5 h-5" />
                </div>
                <div>
                  <p class="font-bold text-gray-800">{{ v.placa }}</p>
                  <p class="text-xs text-gray-500">{{ v.marca }} {{ v.modelo }}</p>
                </div>
              </div>
              <button @click="removeVehicle(v.id)" class="text-gray-400 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Zones Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-gray-500" />
            Zonas Disponíveis
          </h3>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="z in zones" :key="z.id" class="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-bold text-gray-800">{{ z.nome }}</h4>
              <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                {{ formatCurrency(z.valor_hora) }}/h
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3 flex items-center gap-1">
              <MapPin class="w-3 h-3" /> {{ z.localizacao }}
            </p>
            <div class="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
              <span class="flex items-center gap-1"><Clock class="w-3 h-3" /> {{ z.horario_inicio }} - {{ z.horario_fim }}</span>
              <span class="flex items-center gap-1"><Car class="w-3 h-3" /> {{ z.vagas }} vagas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Parking Action -->
      <button 
        v-if="vehicles.length > 0" 
        @click="parkingOpen = true"
        class="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
      >
        <Navigation class="w-5 h-5" />
        Estacionar Agora
      </button>
    </div>

    <!-- Modals -->
    <CreditsModal v-model="creditsOpen" @success="balance += $event" />

    <!-- Add Vehicle Modal -->
    <div v-if="vehicleOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 class="text-lg font-semibold">Adicionar Veículo</h3>
          <button @click="vehicleOpen = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Placa</label>
            <input v-model="vehicleForm.placa" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="ABC-1234" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input v-model="vehicleForm.marca" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input v-model="vehicleForm.modelo" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input v-model="vehicleForm.cor" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <input v-model.number="vehicleForm.ano" type="number" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <button @click="saveVehicle" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2">
            Salvar Veículo
          </button>
        </div>
      </div>
    </div>

    <!-- Parking Modal -->
    <div v-if="parkingOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 class="text-lg font-semibold">Estacionar</h3>
          <button @click="parkingOpen = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Veículo</label>
            <select v-model="parkingForm.vehicle_id" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="" disabled>Selecione um veículo</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.placa }} - {{ v.modelo }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Zona</label>
            <select v-model="parkingForm.zone_id" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
              <option value="" disabled>Selecione uma zona</option>
              <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.nome }} - {{ formatCurrency(z.valor_hora) }}/h</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tempo de Permanência</label>
            <div class="flex bg-gray-100 p-1 rounded-lg">
              <button 
                v-for="time in timeItems" 
                :key="time.value"
                @click="selectedTime = time.value"
                class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
                :class="selectedTime === time.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                {{ time.label }}
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span class="font-medium text-gray-600">Custo Estimado:</span>
            <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(estimatedCost) }}</span>
          </div>

          <button 
            @click="confirmParking"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Confirmar Estacionamento
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { Car, User, LogOut, Plus, Trash2, MapPin, Clock, Navigation, X } from 'lucide-vue-next'
import CreditsModal from '../components/CreditsModal.vue'

const router = useRouter()
const { user, logout } = useAuth()

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
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: '2h', value: '120' },
  { label: '3h', value: '180' },
  { label: '4h', value: '240' }
]
const selectedTime = ref('60')

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
  if (confirm('Tem certeza que deseja remover este veículo?')) {
    vehicles.value = vehicles.value.filter(v => v.id !== id)
  }
}

function saveVehicle () {
  const { placa, marca, modelo, cor, ano } = vehicleForm
  if (!placa || !marca || !modelo || !cor || !ano) {
    alert('Preencha todos os campos')
    return
  }
  vehicles.value.push({ id: crypto.randomUUID(), placa: placa.toUpperCase(), marca, modelo, cor, ano })
  Object.assign(vehicleForm, { placa: '', marca: '', modelo: '', cor: '', ano: 2024 })
  vehicleOpen.value = false
}

function confirmParking () {
  const { vehicle_id, zone_id } = parkingForm
  const minutes = parseInt(selectedTime.value)
  if (!vehicle_id || !zone_id || !minutes) {
    alert('Preencha todos os campos')
    return
  }
  const cost = estimatedCost.value
  if (balance.value < cost) {
    alert('Créditos insuficientes')
    return
  }
  balance.value -= cost
  parkingOpen.value = false
  alert('Estacionamento iniciado com sucesso!')
}

async function handleLogout () {
  await logout()
  router.push('/login')
}

watchEffect(() => {
  if (!user.value) router.push('/login')
})
</script>
