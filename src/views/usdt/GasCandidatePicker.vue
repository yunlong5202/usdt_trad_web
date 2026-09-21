<template>
  <el-dialog :model-value="modelValue" :title="t('usdt.gasFlow.pickTitle')" width="min(960px, 96vw)" :close-on-click-modal="false" @update:model-value="emit('update:modelValue', $event)" @opened="table.getList()" @closed="table.handleSelectionChange([])">
    <el-alert :title="t('usdt.gasFlow.pickHint')" type="info" :closable="false" class="picker-hint" />
    <el-alert v-if="error" :title="error" type="error" :closable="false" class="picker-hint" />
    <ProTable :table="table" selection row-key="address" :panels="false">
      <template #search>
        <el-form-item :label="t('usdt.fields.network')"><el-select v-model="table.query.network"><el-option v-for="network in ['BEP20', 'TRC20']" :key="network" :label="network" :value="network" /></el-select></el-form-item>
        <el-form-item :label="t('usdt.fields.address')"><el-input v-model="table.query.address" clearable /></el-form-item>
        <el-form-item :label="t('usdt.fields.min_token_balance')"><el-input v-model="table.query.min_token_balance" clearable /></el-form-item>
        <el-form-item :label="t('usdt.fields.max_gas_balance')"><el-input v-model="table.query.max_gas_balance" clearable /></el-form-item>
      </template>
      <el-table-column prop="address" :label="t('usdt.fields.address')" min-width="260" show-overflow-tooltip />
      <el-table-column prop="token_balance" :label="t('usdt.fields.token_balance')" min-width="130" />
      <el-table-column prop="gas_balance" :label="t('usdt.fields.gas_balance')" min-width="130" />
      <el-table-column prop="status" :label="t('usdt.fields.status')" min-width="100" />
    </ProTable>
    <p class="picker-count">{{ t('usdt.gasFlow.selection', { network: loadedNetwork, count: table.selection.length, total: total }) }}</p>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</el-button>
      <el-button v-permisaction="['usdt:gas:write']" type="primary" :disabled="table.loading || Boolean(error) || !table.selection.length" @click="choose">{{ t('usdt.gasFlow.useSelected') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProTable from '@/components/ProTable/index.vue'
import { useTable } from '@/composables'
import { gatewayRequest, type GatewayRow } from '@/api/usdt'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean], choose: [value: { network: string; addresses: string[] }] }>()
const { t } = useI18n()
const error = ref('')
const loadedNetwork = ref('BEP20')
const total = ref(0)
const table = useTable<GatewayRow, { network: string; address: string; min_token_balance: string; max_gas_balance: string }>({
  idKey: 'address', paginated: false, immediate: false,
  defaultQuery: () => ({ network: 'BEP20', address: '', min_token_balance: '0', max_gas_balance: '' }),
  onError: failure => { error.value = failure.message },
  api: async query => {
    const network = query.network
    const response = await gatewayRequest('/gas-candidates', 'GET', { ...query, limit: 1000 })
    loadedNetwork.value = network
    total.value = Number(response.data.total ?? 0)
    error.value = ''
    return { ...response, data: (response.data.candidates ?? []) as GatewayRow[] }
  }
})
function choose() {
  if (table.loading || error.value || !table.selection.length) return
  emit('choose', { network: loadedNetwork.value, addresses: table.selection.map(row => String(row.address)) })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.picker-hint { margin-bottom: 16px; }
.picker-count { color: var(--el-text-color-secondary); line-height: 1.6; }
</style>
