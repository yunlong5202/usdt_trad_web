<template>
  <PageContainer>
    <el-alert v-if="loadError" :title="loadError" type="error" :closable="false" class="gateway-load-error" />
    <ProTable v-if="config.list" :table="table" selection :row-key="resource === 'nodes' ? 'network' : resource === 'collection' ? 'address' : 'id'">
      <template v-if="config.query.length" #search>
        <el-form-item v-for="key in config.query" :key="key" :label="label(key)">
          <GatewayField v-model="table.query[key]" :field="fields[key]" />
        </el-form-item>
      </template>
      <template #toolbar>
        <el-button @click="table.getList()">{{ t('usdt.refresh') }}</el-button>
        <template v-for="operation in config.operations.filter(item => !item.row || item.key === 'saveNode')" :key="operation.key">
          <el-button v-if="operation.read" @click="open(operation)">{{ t(`usdt.operations.${operation.key}`) }}</el-button>
          <el-button v-else v-permisaction="['usdt:' + resource + ':write']" :disabled="Boolean(operation.selection && !table.selection.length)" @click="open(operation)">{{ t(`usdt.operations.${operation.key}`) }}</el-button>
        </template>
      </template>
      <el-table-column v-for="key in config.columns" :key="key" :prop="key" :label="label(key)" min-width="130" show-overflow-tooltip>
        <template #default="{ row }">
          <DateCell v-if="key.endsWith('_at')" :value="row[key]" />
          <el-tag v-else-if="key === 'status'">{{ row[key] }}</el-tag>
          <span v-else>{{ display(row[key]) }}</span>
        </template>
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
      <el-alert :title="t('usdt.confirm')" type="info" :closable="false" />
      <el-form label-position="top" class="gateway-form" @submit.prevent="submit">
        <el-form-item v-for="key in active?.fields ?? []" :key="key" :label="label(key)">
          <GatewayField v-model="model[key]" :field="fields[key]" :disabled="submitting" />
        </el-form-item>
        <el-alert v-if="active?.selection" :title="String(table.selection.length) + ' ' + t('usdt.fields.addresses')" :closable="false" />
      </el-form>
      <template #footer>
        <el-button :disabled="submitting" @click="visible = false">{{ t('usdt.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="submit">{{ t('usdt.submit') }}</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="resultVisible" :title="t('usdt.result')" width="min(840px, 94vw)" @closed="result = {}">
      <img v-if="result.qr_svg_data_uri" :src="String(result.qr_svg_data_uri)" alt="TOTP QR" class="gateway-qr">
      <el-descriptions :column="1" border>
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
import { ElMessage } from 'element-plus'
import PageContainer from '@/components/PageContainer/index.vue'
import ProTable from '@/components/ProTable/index.vue'
import DateCell from '@/components/DateCell/index.vue'
import { useTable } from '@/composables'
import { gatewayRequest, type GatewayRow } from '@/api/usdt'
import GatewayField from './GatewayField.vue'
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
const table = useTable<GatewayRow, GatewayRow>({
  idKey: props.resource === 'nodes' ? 'network' : props.resource === 'collection' ? 'address' : 'id',
  immediate: Boolean(config.list),
  onError: error => { loadError.value = error.message },
  paginated: Boolean(config.paged),
  defaultQuery: () => Object.fromEntries(config.query.map(key => [key, key === 'network' ? 'BEP20' : ''])),
  api: async query => {
    const response = await gatewayRequest(config.url, 'GET', { ...query, page: query.pageIndex, page_size: query.pageSize, limit: 200 })
    loadError.value = ''
    const rows = (response.data[config.list!] ?? []) as GatewayRow[]
    return { ...response, data: config.paged ? { list: rows, count: Number(response.data.total ?? rows.length) } : rows }
  }
})
const visible = ref(false)
const submitting = ref(false)
const active = ref<Operation>()
const model = reactive<GatewayRow>({})
const result = ref<GatewayRow>({})
const resultVisible = ref(false)
const clearForm = () => { for (const key of Object.keys(model)) delete model[key] }
function showResult(data: GatewayRow) { result.value = data; resultVisible.value = true }
async function reload() {
  if (config.list) { await table.getList(); return }
  try { snapshot.value = (await gatewayRequest(config.url)).data; loadError.value = '' } catch(error) { loadError.value = asReportedError(error).message }
}
async function open(operation: Operation, row: GatewayRow = {}) {
  clearForm()
  active.value = operation
  Object.assign(model, { network: table.query.network || 'BEP20', asset: 'USDT', count: 1, expire_minutes: 30, wallet_method: 'plugin', enabled: true }, operation.defaults, row)
  if (operation.load) {
    try { Object.assign(model, (await gatewayRequest(operation.load, 'GET', { network: model.network, asset: model.asset })).data) } catch { return }
  }
  visible.value = true
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
    if (operation.selection) body[operation.selection] = table.selection.map(row => operation.selection === 'ids' ? row.id : row.address)
    if (operation.fields.includes('addresses')) body.addresses = String(model.addresses ?? '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    if (operation.key === 'importWallets') body.addresses = (body.addresses as string[]).map(address => ({ address }))
    if (operation.key === 'createGas') body.gas_asset = model.network === 'TRC20' ? 'TRX' : 'BNB'
    const url = operation.url.replace(/:([a-z_]+)/g, (_, key: string) => encodeURIComponent(String(model[key] ?? '')))
    const response = await gatewayRequest(url, operation.method, body)
    visible.value = false
    if (operation.download) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([String(response.data.csv)], { type: 'text/csv;charset=utf-8' }))
      link.download = 'wallets.csv'; link.click(); URL.revokeObjectURL(link.href)
    } else if (operation.key === 'executeGas' && response.data.wallet_method === 'plugin') {
      await signDistribution(response.data)
    } else { showResult(response.data) }
    await reload()
  } catch(error) {
    if (!asReportedError(error).reported) ElMessage.error(asReportedError(error).message)
  } finally { submitting.value = false; model.private_key = ''; model.bot_token = '' }
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
</style>
