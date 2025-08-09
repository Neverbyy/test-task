<script setup lang="ts">
import { ElButton, ElCard } from 'element-plus';
import 'element-plus/dist/index.css';
import { Plus } from '@element-plus/icons-vue';
import { AccountType } from '../types/account';
import AccountList from './AccountList.vue';
import { useAccountStore } from '../stores/accountStore';

const accountStore = useAccountStore();

const handleAddAccount = (): void => {
  const newAccount = {
    tags: [],
    type: AccountType.LOCAL,
    login: '',
    password: ''
  };
  
  accountStore.addAccount(newAccount);
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
          size="default"
          @click="handleAddAccount"
          circle
          title="Добавить учетную запись">
        </el-button>
      </div>
    </el-card>

    <el-alert
      class="help-alert"
      type="primary"
      :closable="false"
      show-icon
    >
      <template #title>
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
      </template>
    </el-alert>

    <el-card class="list-card" shadow="hover">
      <template #header>
        <span class="list-header">Список учетных записей ({{ accountStore.getAccounts.length }})</span>
      </template>
      <AccountList />
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
