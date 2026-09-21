<template>
  <section class="gas-contracts">
    <header class="gas-contracts-heading"><h2>{{ t('usdt.gasContracts.title') }}</h2><p>{{ t('usdt.gasContracts.hint') }}</p></header>
    <el-alert v-if="!canRead" :title="t('usdt.gasContracts.noAccess')" type="info" :closable="false" />
    <div v-else class="gas-contract-grid">
      <el-card v-for="chain in chains" :key="chain" shadow="never" :data-chain="chain">
        <template #header>
          <div class="gas-contract-heading">
            <h3>{{ chainName(chain) }}</h3>
            <el-tag :type="state[chain].error ? 'danger' : state[chain].loaded && state[chain].address ? 'success' : 'info'">{{ t(state[chain].error ? 'usdt.gasContracts.loadFailed' : !state[chain].loaded ? 'common.loading' : state[chain].address ? 'usdt.gasContracts.configured' : 'usdt.gasContracts.unconfigured') }}</el-tag>
          </div>
        </template>
        <el-alert v-if="state[chain].error" :title="state[chain].error" type="error" :closable="false" class="gas-contract-message" />
        <div v-loading="state[chain].loading" class="gas-contract-content">
          <p class="gas-contract-label">{{ t('usdt.gasContracts.address') }}</p>
          <code class="gas-contract-address">{{ state[chain].loaded ? state[chain].address || t('usdt.gasContracts.unconfigured') : '—' }}</code>
          <el-form v-if="state[chain].editing" class="gas-contract-form" label-position="top" :disabled="state[chain].saving" @submit.prevent="save(chain)">
            <el-form-item :label="t('usdt.gasContracts.editAddress', { chain: chainName(chain) })">
              <el-input v-model="state[chain].draft" :aria-label="t('usdt.gasContracts.editAddress', { chain: chainName(chain) })" :placeholder="chain === 'BEP20' ? '0x…' : 'T…'" autocomplete="off" />
            </el-form-item>
            <p class="gas-contract-help">{{ t('usdt.gasContracts.saveHint') }}</p>
            <el-alert v-if="state[chain].saveError" :title="state[chain].saveError" type="error" :closable="false" class="gas-contract-message" />
            <div class="gas-contract-actions">
              <el-button :disabled="state[chain].saving" @click="cancel(chain)">{{ t('common.cancel') }}</el-button>
              <el-button type="primary" native-type="submit" :loading="state[chain].saving" :disabled="!canWrite || state[chain].draft.trim() === state[chain].address">{{ t('usdt.gasContracts.save', { chain: chainName(chain) }) }}</el-button>
            </div>
          </el-form>
          <div v-else class="gas-contract-actions">
            <el-button :disabled="state[chain].loading" @click="load(chain)">{{ t('common.refresh') }}</el-button>
            <el-button v-if="canWrite" :disabled="!state[chain].loaded || state[chain].loading" @click="edit(chain)">{{ t('usdt.gasContracts.edit', { chain: chainName(chain) }) }}</el-button>
          </div>
          <p v-if="state[chain].saved" role="status" class="gas-contract-saved">{{ t('usdt.gasContracts.saved', { chain: chainName(chain) }) }}</p>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onActivated, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { getBatchContractSettings, getRuntimeSettings, updateBatchContractSettings, updateRuntimeSettings } from '@/api/usdt-settings'
import { asReportedError } from '@/utils/request'

const { t } = useI18n()
const user = useUserStore()
const canWrite = computed(() => user.permisaction.some(value => value === '*:*:*' || value === 'usdt:settings:write'))
const canRead = computed(() => canWrite.value || user.permisaction.includes('usdt:settings:read'))
const chains = ['BEP20', 'TRC20'] as const
type Chain = typeof chains[number]
const empty = () => ({ address: '', draft: '', loaded: false, loading: false, saving: false, editing: false, error: '', saveError: '', saved: false })
const state = reactive({ BEP20: empty(), TRC20: empty() })
const chainName = (chain: Chain) => chain === 'BEP20' ? 'BSC (BEP20)' : 'TRON (TRC20)'

async function load(chain: Chain) {
  const item = state[chain]
  if (!canRead.value || item.loading || item.saving || item.editing) return
  item.loading = true
  item.error = ''
  item.saved = false
  try {
    const address = chain === 'BEP20' ? (await getBatchContractSettings()).data.contract_address : (await getRuntimeSettings()).data.trc_batch_gas_contract_address
    if (!canRead.value) return
    item.address = address?.trim() || ''
    item.loaded = true
  } catch(error) { item.error = asReportedError(error).message; item.loaded = false } finally { item.loading = false }
}
function edit(chain: Chain) {
  const item = state[chain]
  if (!canWrite.value || !item.loaded || item.loading) return
  item.draft = item.address
  item.saveError = ''
  item.saved = false
  item.editing = true
}
function cancel(chain: Chain) {
  const item = state[chain]
  if (item.saving) return
  item.editing = false
  item.draft = ''
  item.saveError = ''
}
async function save(chain: Chain) {
  const item = state[chain]
  if (!canWrite.value || item.saving || !item.editing) return
  const address = item.draft.trim()
  if (address === item.address) return
  const valid = chain === 'BEP20' ? /^0x[0-9a-fA-F]{40}$/.test(address) : /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
  if (!valid) { item.saveError = t('usdt.gasContracts.invalidAddress', { chain: chainName(chain) }); return }
  item.saving = true
  item.saveError = ''
  item.saved = false
  try {
    // Both endpoints replace their full settings object. Read immediately before
    // saving to preserve unrelated settings changed elsewhere since this page loaded.
    if (chain === 'BEP20') {
      const latest = (await getBatchContractSettings()).data
      item.address = (await updateBatchContractSettings({ ...latest, contract_address: address })).data.contract_address
    } else {
      const latest = (await getRuntimeSettings()).data
      item.address = (await updateRuntimeSettings({ ...latest, trc_batch_gas_contract_address: address })).data.trc_batch_gas_contract_address
    }
    item.editing = false
    item.draft = ''
    item.saved = true
  } catch(error) { item.saveError = asReportedError(error).message } finally { item.saving = false }
}
function refresh() { void load('BEP20'); void load('TRC20') }
watch(canRead, allowed => { if (allowed) refresh(); else { Object.assign(state.BEP20, empty()); Object.assign(state.TRC20, empty()) } }, { immediate: true })
onActivated(refresh)
</script>

<style scoped>
.gas-contracts { margin-bottom: 20px; }
.gas-contracts-heading { margin-bottom: 14px; }
.gas-contracts-heading h2 { margin: 0; font-size: 18px; }
.gas-contracts-heading p, .gas-contract-help { margin: 8px 0 0; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.6; }
.gas-contract-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.gas-contract-grid > .el-card { margin-top: 0; }
.gas-contract-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.gas-contract-heading h3 { margin: 0; font-size: 16px; }
.gas-contract-label { margin: 0 0 10px; color: var(--el-text-color-secondary); font-size: 13px; }
.gas-contract-address { display: block; overflow-wrap: anywhere; word-break: break-all; font-size: 14px; line-height: 1.6; user-select: all; }
.gas-contract-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.gas-contract-actions :deep(.el-button + .el-button) { margin-left: 0; }
.gas-contract-form { margin-top: 20px; }
.gas-contract-message { margin-bottom: 12px; }
.gas-contract-help + .gas-contract-message { margin-top: 12px; }
.gas-contract-saved { color: var(--el-color-success); font-size: 13px; margin-bottom: 0; }
@media (max-width: 900px) { .gas-contract-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
