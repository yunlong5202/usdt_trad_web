<template>
  <PageContainer card>
    <h1>USDT Gateway</h1>
    <p>{{ t('usdt.welcome') }}</p>
    <div class="gateway-links">
      <router-link v-for="route in links" :key="route.path" :to="route.path">
        <el-card shadow="hover">{{ route.meta?.title }}</el-card>
      </router-link>
    </div>
  </PageContainer>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PageContainer from '@/components/PageContainer/index.vue'
defineOptions({ name: 'Dashboard' })
const router = useRouter()
const { t } = useI18n()
const links = computed(() => router.getRoutes().filter(route => route.path.startsWith('/usdt/') && route.meta?.title))
</script>
<style scoped>
.gateway-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px; }
</style>
