<template>
  <PageContainer>
    <div class="binding-heading">
      <h2>{{ t('usdt.memberAddresses.title') }}</h2>
      <p>{{ t('usdt.memberAddresses.description') }}</p>
    </div>
    <el-alert v-if="error" :title="error" type="error" :closable="false" />
    <ProTable :table="table" row-key="id" :empty-text="t('usdt.memberAddresses.empty')">
      <template #search>
        <el-form-item :label="t('usdt.fields.member_id')">
          <el-input v-model="table.query.member_id" :placeholder="t('usdt.memberAddresses.memberPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="t('usdt.fields.network')">
          <el-select v-model="table.query.network" clearable>
            <el-option v-for="network in ['BEP20', 'TRC20']" :key="network" :label="network" :value="network" />
          </el-select>
        </el-form-item>
      </template>
      <template #toolbar><el-button @click="table.getList()">{{ t('usdt.refresh') }}</el-button></template>
      <el-table-column prop="member_id" :label="t('usdt.fields.member_id')" min-width="130" />
      <el-table-column prop="network" :label="t('usdt.fields.network')" min-width="100" />
      <el-table-column prop="address" :label="t('usdt.fields.address')" min-width="280" show-overflow-tooltip />
      <el-table-column prop="asset" :label="t('usdt.fields.asset')" min-width="85" />
      <el-table-column prop="created_at" :label="t('usdt.fields.created_at')" min-width="110">
        <template #default="{ row }"><DateCell :value="row.created_at" /></template>
      </el-table-column>
    </ProTable>
  </PageContainer>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageContainer from '@/components/PageContainer/index.vue'
import ProTable from '@/components/ProTable/index.vue'
import DateCell from '@/components/DateCell/index.vue'
import { useTable } from '@/composables'
import { gatewayRequest, type GatewayRow } from '@/api/usdt'

defineOptions({ name: 'USDTMemberAddresses' })
const { t } = useI18n()
const error = ref('')
const table = useTable<GatewayRow, GatewayRow>({
  idKey: 'id',
  defaultQuery: () => ({ member_id: '', network: '' }),
  onError: failure => { error.value = failure.message },
  api: async query => {
    const response = await gatewayRequest('/member-addresses', 'GET', { ...query, page: query.pageIndex, page_size: query.pageSize })
    error.value = ''
    return { ...response, data: { list: (response.data.items ?? []) as GatewayRow[], count: Number(response.data.total ?? 0) }}
  }
})
</script>
<style scoped>
.binding-heading { margin-bottom: 20px; }
.binding-heading h2 { margin: 0 0 8px; font-size: 20px; }
.binding-heading p { margin: 0; color: var(--el-text-color-secondary); line-height: 1.7; }
</style>
