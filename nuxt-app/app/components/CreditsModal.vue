<template>
  <UModal v-model="open">
    <UCard class="max-w-sm mx-auto">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Comprar Créditos</h3>
          <UButton icon="i-lucide-x" variant="ghost" @click="open = false" />
        </div>
      </template>
      <div class="space-y-4">
        <UForm :state="state" class="space-y-4">
          <UFormGroup label="Valor" name="valor">
            <div class="grid grid-cols-2 gap-3">
              <UButton :variant="state.valor === 10 ? 'solid' : 'outline'" @click="state.valor = 10">R$ 10,00</UButton>
              <UButton :variant="state.valor === 25 ? 'solid' : 'outline'" @click="state.valor = 25">R$ 25,00</UButton>
              <UButton :variant="state.valor === 50 ? 'solid' : 'outline'" @click="state.valor = 50">R$ 50,00</UButton>
              <UButton :variant="state.valor === 100 ? 'solid' : 'outline'" @click="state.valor = 100">R$ 100,00</UButton>
            </div>
          </UFormGroup>
          <UFormGroup label="Forma de Pagamento" name="metodo">
            <USelect v-model="state.metodo" :options="metodos" />
          </UFormGroup>
        </UForm>
        <div class="border-t pt-4 flex items-center justify-between">
          <span class="font-medium">Total:</span>
          <span class="text-xl font-bold text-blue-600">{{ formatCurrency(state.valor) }}</span>
        </div>
        <UButton color="green" block @click="confirmar">Confirmar Compra</UButton>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

const state = reactive({ valor: 0, metodo: 'pix' })
const metodos = [
  { label: 'Pix', value: 'pix' },
  { label: 'Cartão de Crédito', value: 'card' },
  { label: 'Boleto', value: 'boleto' }
]

const toast = useToast()

function formatCurrency (n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function confirmar () {
  if (!state.valor) {
    toast.add({ title: 'Selecione um valor', color: 'red' })
    return
  }
  toast.add({ title: 'Créditos adicionados com sucesso!', color: 'green' })
  open.value = false
}
</script>