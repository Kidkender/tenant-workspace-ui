<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import UserMenu from '@/components/layout/UserMenu.vue'
import TenantSwitcher from '@/components/tenant/TenantSwitcher.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <TenantSwitcher />
        <UserMenu />
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
