<script setup lang="ts">
import { onMounted } from 'vue';
import AccountManager from './components/AccountManager.vue';
import { useAccountStore } from './stores/accountStore';

const accountStore = useAccountStore();

onMounted(() => {
  accountStore.initializeStore();
});
</script>

<template>
  <div id="app">
    <AccountManager />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: var(--el-bg-color-page);
}
</style>
