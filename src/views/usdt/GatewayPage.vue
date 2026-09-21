<template>
  <PageContainer>
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" class="gateway-load-error" />
    <ProTable v-if="config.list" :table="table" :selection="resource !== 'collection'" :row-key="resource === 'nodes' ? 'network' : resource === 'collection' ? 'address' : 'id'">
      <template v-if="config.query.length" #search>
        <el-form-item v-for="key in config.query" :key="key" :label="label(key)">
          <GatewayField v-model="table.query[key]" :field="fields[key]" />
        </el-form-item>
      </template>
      <template #toolbar>
        <el-button @click="table.getList()">{{ t('usdt.refresh') }}</el-button>
        <el-checkbox v-if="resource === 'collection'" :model-value="allCollectableSelected" :indeterminate="selectedRows.length > 0 && !allCollectableSelected" :disabled="!collectableRows.length" @update:model-value="selectAllCollectable(Boolean($event))">{{ t('usdt.collectionFlow.selectEligible') }}</el-checkbox>
        <template v-for="operation in config.operations.filter(item => !item.row || item.key === 'saveNode')" :key="operation.key">
          <el-button v-if="operation.read" @click="open(operation)">{{ t(`usdt.operations.${operation.key}`) }}</el-button>
          <el-button v-else v-permisaction="['usdt:' + resource + ':write']" :disabled="Boolean(operation.selection && !selectedRows.length)" @click="open(operation)">{{ t(`usdt.operations.${operation.key}`) }}</el-button>
        </template>
      </template>
      <el-table-column v-for="key in config.columns" :key="key" :prop="key" :label="label(key)" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">
          <DateCell v-if="key.endsWith('_at')" :value="row[key]" />
          <el-tag v-else-if="key === 'status'">{{ row[key] }}</el-tag>
          <span v-else-if="key === 'assignment_mode' && row[key]">{{ t(`usdt.options.${row[key]}`) }}</span>
          <span v-else>{{ display(row[key]) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="resource === 'collection'" prop="collection_selected" :label="t('usdt.collectionFlow.select')" width="90">
        <template #default="{ row }"><el-checkbox :model-value="collectionSelection.includes(String(row.address))" :disabled="!row.can_collect" :aria-label="t('usdt.collectionFlow.selectAddress', { address: row.address })" @update:model-value="toggleCollectable(row, Boolean($event))" /></template>
      </el-table-column>
      <template #actions="{ row }">
        <el-button link @click="showResult(row)">{{ t('usdt.detail') }}</el-button>
        <el-dropdown v-if="rowOperations.length" trigger="click" @command="(operation: Operation) => open(operation, row)">
          <el-button link>•••</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <template v-for="operation in rowOperations" :key="operation.key">
                <el-dropdown-item v-if="operation.read" :command="operation">{{ t(`usdt.operations.${operation.key}`) }}</el-dropdown-item>
                <el-dropdown-item v-else v-permisaction="['usdt:' + resource + ':write']" :command="operation">{{ t(`usdt.operations.${operation.key}`) }}</el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </ProTable>
    <el-card v-else shadow="never">
      <template #header>{{ t(`usdt.title.${resource}`) }}</template>
      <el-button @click="reload()">{{ t('usdt.refresh') }}</el-button>
      <el-button v-for="operation in config.operations" :key="operation.key" v-permisaction="['usdt:' + resource + ':write']" @click="open(operation)">{{ t(`usdt.operations.${operation.key}`) }}</el-button>
      <el-descriptions :column="1" border class="gateway-details">
        <el-descriptions-item v-for="key in config.columns" :key="key" :label="label(key)">{{ display(snapshot[key]) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-dialog v-model="visible" :title="active ? t(`usdt.operations.${active.key}`) : ''" width="min(640px, 94vw)" :close-on-click-modal="false" :close-on-press-escape="!submitting" :show-close="!submitting" @closed="clearForm">
      <el-alert :title="t(['runCollection', 'executeGas'].includes(active?.key ?? '') ? 'usdt.fundsFlow.realTransfer' : 'usdt.confirm')" :type="['runCollection', 'executeGas'].includes(active?.key ?? '') ? 'warning' : 'info'" :closable="false" />
      <el-descriptions v-if="active?.key === 'executeGas'" :column="1" border class="gateway-details">
        <el-descriptions-item v-for="key in ['network', 'recipient_count', 'amount_per_wallet', 'total_amount', 'payable_total_amount']" :key="key" :label="label(key)">{{ display(model[key]) }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-position="top" class="gateway-form" @submit.prevent="submit">
        <el-form-item v-for="key in visibleFields" :key="key" :label="label(key)">
          <GatewayField v-model="model[key]" :field="fieldFor(key)" :disabled="submitting || lockedField(key)" />
        </el-form-item>
        <el-alert v-if="active?.key === 'executeGas' && model.network === 'TRC20'" :title="t('usdt.gasFlow.tronPrivateKey')" type="info" :closable="false" />
        <template v-if="active?.selection">
          <el-alert :title="t('usdt.collectionFlow.selected', { count: operationSelection.length })" :closable="false" />
          <pre class="gateway-value selected-addresses">{{ operationSelection.map(row => row.address || row.id).join('\n') }}</pre>
        </template>
      </el-form>
      <template #footer>
        <el-button :disabled="submitting" @click="visible = false">{{ t('usdt.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('usdt.submit') }}</el-button>
      </template>
    </el-dialog>
    <GasCandidatePicker v-if="resource === 'gas'" v-model="gasPickerVisible" @choose="useGasCandidates" />
    <el-dialog v-model="resultVisible" :title="t('usdt.result')" width="min(840px, 94vw)" @closed="result = {}">
      <img v-if="result.qr_svg_data_uri" :src="String(result.qr_svg_data_uri)" alt="TOTP QR" class="gateway-qr">
      <el-table v-if="Array.isArray(result.jobs)" :data="result.jobs" border>
        <el-table-column v-for="key in ['merchant_order_id', 'deposit_id', 'status', 'attempts', 'max_attempts', 'next_attempt_at', 'last_error']" :key="key" :prop="key" :label="label(key)" min-width="130" show-overflow-tooltip>
          <template #default="{ row }"><DateCell v-if="key.endsWith('_at')" :value="row[key]" /><span v-else>{{ display(row[key]) }}</span></template>
        </el-table-column>
      </el-table>
      <el-descriptions v-else :column="1" border>
        <el-descriptions-item v-for="(value, key) in result" :key="key" :label="label(String(key))">
          <pre class="gateway-value">{{ display(value) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </PageContainer>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageContainer from '@/components/PageContainer/index.vue'
import ProTable from '@/components/ProTable/index.vue'
import DateCell from '@/components/DateCell/index.vue'
import { useTable } from '@/composables'
import { gatewayRequest, type GatewayRow } from '@/api/usdt'
import GatewayField from './GatewayField.vue'
import GasCandidatePicker from './GasCandidatePicker.vue'
import { resources, fields, type Operation } from './schema'
import { asReportedError } from '@/utils/request'

const props = defineProps<{ resource: string }>()
const { t, te } = useI18n()
const config = resources[props.resource]
const rowOperations = computed(() => config.operations.filter(item => item.row))
const label = (key: string) => te('usdt.fields.' + key) ? t(`usdt.fields.${key}`) : key
const display = (value: unknown) => value == null ? '—' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
const snapshot = ref<GatewayRow>({})
const loadError = ref('')
const loadedNetwork = ref('BEP20')
const table = useTable<GatewayRow, GatewayRow>({
  idKey: props.resource === 'nodes' ? 'network' : props.resource === 'collection' ? 'address' : 'id',
  immediate: Boolean(config.list),
  onError: error => { loadError.value = error.message },
  paginated: Boolean(config.paged),
  defaultQuery: () => Object.fromEntries(config.query.map(key => [key, key === 'network' ? 'BEP20' : ''])),
  api: async query => {
    const requestNetwork = String(query.network || 'BEP20')
    const response = await gatewayRequest(config.url, 'GET', { ...query, page: query.pageIndex, page_size: query.pageSize, limit: 200 })
    loadError.value = ''
    loadedNetwork.value = requestNetwork
    const rows = (response.data[config.list!] ?? []) as GatewayRow[]
    return { ...response, data: config.paged ? { list: rows, count: Number(response.data.total ?? rows.length) } : rows }
  }
})
const visible = ref(false)
const submitting = ref(false)
const active = ref<Operation>()
const model = reactive<GatewayRow>({})
const collectionSelection = ref<string[]>([])
const collectableRows = computed(() => table.rows.filter(row => row.can_collect === true))
const selectedRows = computed(() => props.resource === 'collection' ? collectableRows.value.filter(row => collectionSelection.value.includes(String(row.address))) : table.selection)
const allCollectableSelected = computed(() => collectableRows.value.length > 0 && selectedRows.value.length === collectableRows.value.length)
const operationSelection = ref<GatewayRow[]>([])
const gasPickerVisible = ref(false)
const gasAddressNetwork = ref('')
const visibleFields = computed(() => (active.value?.fields ?? []).filter(key => key !== 'private_key' || model.wallet_method === 'private_key'))
const fieldFor = (key: string) => key === 'wallet_method' && model.network === 'TRC20' ? { ...fields[key], options: ['private_key'] } : fields[key]
const lockedField = (key: string) => (active.value?.key === 'runCollection' && ['network', 'asset'].includes(key)) || (active.value?.row === true && key === 'id') || (active.value?.key === 'createGas' && (key === 'gas_asset' || key === 'network' && Boolean(gasAddressNetwork.value)))
function toggleCollectable(row: GatewayRow, checked: boolean) {
  if (!row.can_collect) return
  const address = String(row.address)
  collectionSelection.value = checked ? [...new Set([...collectionSelection.value, address])] : collectionSelection.value.filter(item => item !== address)
}
function selectAllCollectable(checked: boolean) { collectionSelection.value = checked ? collectableRows.value.map(row => String(row.address)) : [] }
watch(() => table.rows, () => { collectionSelection.value = [] })
const result = ref<GatewayRow>({})
const resultVisible = ref(false)
const clearForm = () => { for (const key of Object.keys(model)) delete model[key] }
function showResult(data: GatewayRow) { result.value = data; resultVisible.value = true }
async function reload() {
  if (config.list) { await table.getList(); return }
  try { snapshot.value = (await gatewayRequest(config.url)).data; loadError.value = '' } catch(error) { loadError.value = asReportedError(error).message }
}
async function open(operation: Operation, row: GatewayRow = {}) {
  if (operation.key === 'gasCandidates' || operation.key === 'createGas' && !row.addresses) { gasPickerVisible.value = true; return }
  clearForm()
  gasAddressNetwork.value = ''
  operationSelection.value = selectedRows.value.map(item => ({ ...item }))
  if (operation.selection && !operationSelection.value.length) { ElMessage.warning(t('usdt.selectFirst')); return }
  active.value = operation
  Object.assign(model, { network: operation.key === 'runCollection' ? loadedNetwork.value : table.query.network || 'BEP20', asset: 'USDT', count: 1, expire_minutes: 30, wallet_method: 'plugin', enabled: true }, operation.defaults, row)
  if (operation.load) {
    try { Object.assign(model, (await gatewayRequest(operation.load, 'GET', { network: model.network, asset: model.asset })).data) } catch { return }
  }
  if (operation.key === 'executeGas') {
    try { Object.assign(model, (await gatewayRequest('/gas-distributions/' + encodeURIComponent(String(model.id)))).data) } catch { return }
    model.wallet_method = model.network === 'TRC20' ? 'private_key' : 'plugin'
  }
  if (operation.key === 'createGas') model.gas_asset = model.network === 'TRC20' ? 'TRX' : 'BNB'
  visible.value = true
}
async function useGasCandidates(selection: { network: string; addresses: string[] }) {
  const operation = config.operations.find(item => item.key === 'createGas')!
  await open(operation, { network: selection.network, addresses: selection.addresses.join('\n') })
  gasAddressNetwork.value = selection.network
}
watch(() => model.network, async(network, previous) => {
  if (!visible.value || submitting.value || network === previous || active.value?.load !== '/collection-settings') return
  try { const response = await gatewayRequest('/collection-settings', 'GET', { network, asset: 'USDT' }); if (model.network === network) Object.assign(model, response.data) } catch { /* already reported */ }
})
async function submit() {
  if (submitting.value || !active.value) return
  submitting.value = true
  const operation = active.value
  try {
    const body: GatewayRow = { ...operation.defaults }
    for (const key of operation.fields) body[key] = model[key] ?? (fields[key].type === 'boolean' ? false : fields[key].type === 'number' ? 0 : '')
    if (operation.selection) body[operation.selection] = operationSelection.value.map(row => operation.selection === 'ids' ? row.id : row.address)
    if (operation.fields.includes('addresses')) body.addresses = String(model.addresses ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    if (operation.key === 'importWallets') body.addresses = (body.addresses as string[]).map(address => ({ address }))
    if (operation.key === 'createGas') body.gas_asset = model.network === 'TRC20' ? 'TRX' : 'BNB'
    if (operation.key === 'saveNotifications') body.telegram_mentions = model.telegram_mentions && typeof model.telegram_mentions === 'object' && !Array.isArray(model.telegram_mentions) ? { ...model.telegram_mentions } : {}
    if (operation.key === 'runCollection') {
      body.settlement_wallet = String(body.settlement_wallet ?? '').trim()
      body.verify_code = String(body.verify_code ?? '').trim()
      if (!body.settlement_wallet) throw new Error(t('usdt.collectionFlow.targetRequired'))
      if (!/^\d{6}$/.test(String(body.verify_code))) throw new Error(t('usdt.security.invalidCode'))
      const confirmed = await confirmFunds(t('usdt.collectionFlow.confirm', { network: body.network, target: body.settlement_wallet, count: operationSelection.value.length }))
      if (!confirmed) return
    }
    if (operation.key === 'executeGas') {
      if (model.network === 'TRC20') body.wallet_method = 'private_key'
      if (body.wallet_method === 'private_key' && !String(body.private_key || '').trim()) throw new Error(t('usdt.gasFlow.privateKeyRequired'))
      const confirmed = await confirmFunds(t('usdt.gasFlow.confirm', { network: model.network, count: model.recipient_count, amount: model.payable_total_amount || model.total_amount, asset: model.gas_asset }))
      if (!confirmed) return
    }
    const url = operation.url.replace(/:([a-z_]+)/g, (_, key: string) => encodeURIComponent(String(model[key] ?? '')))
    const response = await gatewayRequest(url, operation.method, body)
    visible.value = false
    if (operation.download) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([String(response.data.csv)], { type: 'text/csv;charset=utf-8' }))
      link.download = 'wallets.csv'; link.click(); URL.revokeObjectURL(link.href)
    } else if (operation.key === 'executeGas' && response.data.wallet_method === 'plugin') {
      await signDistribution(response.data)
    } else {
      showResult(response.data)
      if (['testNotifications', 'diagnoseNotifications'].includes(operation.key) && (Number(response.data.sent || 0) <= 0 || Number(response.data.failed || 0) > 0)) ElMessage.warning(t('usdt.mentions.deliveryFailed', { sent: Number(response.data.sent || 0), failed: Number(response.data.failed || 0) }))
    }
    await reload()
  } catch(error) {
    if (!asReportedError(error).reported) ElMessage.error(asReportedError(error).message)
  } finally { submitting.value = false; model.private_key = ''; model.bot_token = ''; model.verify_code = '' }
}
async function confirmFunds(message: string) {
  try { await ElMessageBox.confirm(message, t('usdt.fundsFlow.confirmTitle'), { type: 'warning', confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel') }); return true } catch { return false }
}
async function signDistribution(payload: GatewayRow) {
  const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string, params?: unknown[] }) => Promise<unknown> }}).ethereum
  if (!ethereum) throw new Error(t('usdt.noWallet'))
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
  const chainId = '0x' + BigInt(String(payload.chain_id)).toString(16)
  await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] })
  const hash = await ethereum.request({ method: 'eth_sendTransaction', params: [{ from: accounts[0], to: payload.contract_address, data: payload.contract_data, value: '0x' + BigInt(String(payload.value_wei)).toString(16) }] })
  // Show the hash before recording it; a failed API call must never cause a second broadcast.
  showResult({ tx_hash: hash, distribution_id: payload.distribution_id, message: t('usdt.submitted') })
  await gatewayRequest('/gas-distributions/' + encodeURIComponent(String(payload.distribution_id)) + '/plugin-result', 'POST', { tx_hash: hash })
}
onMounted(() => { if (!config.list) reload() })
</script>
<style scoped>
.gateway-form, .gateway-details { margin-top: 20px; }
.gateway-load-error { margin-bottom: 16px; }
.gateway-value { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0; max-height: 360px; overflow: auto; }
.gateway-qr { width: 220px; max-width: 100%; }
.selected-addresses { margin-top: 12px; max-height: 140px; }
</style>
