<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-800">Comprar Créditos</h3>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        <!-- Valor Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
          <div class="grid grid-cols-2 gap-3">
            <button 
              v-for="amount in [10, 25, 50, 100]" 
              :key="amount"
              @click="state.valor = amount"
              class="py-2 px-4 rounded-lg border transition-all text-sm font-medium"
              :class="state.valor === amount 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'"
            >
              R$ {{ amount }},00
            </button>
          </div>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
          <select 
            v-model="state.metodo"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
          >
            <option value="pix">Pix</option>
            <option value="card">Cartão de Crédito</option>
            <option value="boleto">Boleto</option>
          </select>
        </div>

        <!-- Total -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="font-medium text-gray-600">Total:</span>
          <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(state.valor) }}</span>
        </div>

        <!-- Action -->
        <button 
          @click="confirmar"
          class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
        >
          Confirmar Compra
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', amount: number): void
}>()

const state = reactive({ valor: 0, metodo: 'pix' })

function formatCurrency(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function confirmar() {
  if (!state.valor) {
    alert('Selecione um valor')
    return
  }
  alert('Créditos adicionados com sucesso!')
  emit('success', state.valor)
  emit('update:modelValue', false)
  state.valor = 0
}
</script>
