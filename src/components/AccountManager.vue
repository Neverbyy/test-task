<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElCard } from 'element-plus';
import 'element-plus/dist/index.css';
import { Plus } from '@element-plus/icons-vue';
import { type Account } from '../types/account';
import AccountList from './AccountList.vue';

const accounts = ref<Account[]>([

]);

const handleDeleteAccount = (id: string): void => {
  const index = accounts.value.findIndex(acc => acc.id === id);
  if (index !== -1) {
    accounts.value.splice(index, 1);
  }
};

</script>

<template>
  <div class="account-manager">
    <el-card class="header-card" shadow="never">
      <div class="header">
        <h1 class="title">Учетные записи</h1>
        <el-button
          type="primary"
          :icon="Plus"
          size="default">
          Добавить
        </el-button>
      </div>
    </el-card>



    <el-card class="list-card" shadow="hover">
      <template #header>
        <span class="list-header">Список учетных записей ({{ accounts.length }})</span>
      </template>
      <AccountList
        :accounts="accounts"
        @delete="handleDeleteAccount"
      />
    </el-card>
  </div>
</template>

<style scoped>
.account-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-card {
  border: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.form-card,
.list-card {
  border: 1px solid var(--el-border-color-light);
}

.form-header,
.list-header {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  background: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
