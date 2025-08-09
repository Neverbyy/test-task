<script setup lang="ts">
import { ref } from 'vue';
import { ElTable, ElTableColumn, ElInput, ElSelect, ElOption, ElButton, ElAlert, ElMessageBox, ElMessage } from 'element-plus';
import { Delete, View, Hide } from '@element-plus/icons-vue';
import { AccountType, type Account } from '../types/account';

interface Props {
  accounts: Account[];
}

interface Emits {
  (e: 'delete', id: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showPasswordMap = ref<Record<string, boolean>>({});



const handleDelete = async (account: Account): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `Вы уверены что хотите удалить запись "${account.login}"?`,
      'Подтверждение удаления',
      {
        confirmButtonText: 'Да, удалить',
        cancelButtonText: 'Отмена',
        type: 'warning',
      }
    );
    
    emit('delete', account.id);
    ElMessage.success('Запись удалена');
  } catch (error) {
    // Пользователь отменил удаление
  }
};

const togglePasswordVisibility = (accountId: string): void => {
  showPasswordMap.value[accountId] = !showPasswordMap.value[accountId];
};

const formatTags = (tags: string): string => {
  return tags || '—';
};

const formatPassword = (account: Account): string => {
  if (account.type === AccountType.LDAP) {
    return '—';
  }
  
  if (!account.password) {
    return '—';
  }
  
  return showPasswordMap.value[account.id] ? account.password : '● ● ● ● ● ●';
};

const getPasswordInputType = (account: Account): string => {
  if (account.type === AccountType.LDAP) {
    return 'text';
  }
  return showPasswordMap.value[account.id] ? 'text' : 'password';
};
</script>

<template>
  <div class="account-list">
    <el-alert
      class="help-alert"
      type="info"
      :closable="false"
      show-icon
    >
      <template #title>
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
      </template>
    </el-alert>

    <el-table
      :data="props.accounts"
      style="width: 100%"
      stripe
      border
      empty-text="Нет учетных записей"
      table-layout="auto"
    >
      <el-table-column label="Метки" min-width="150">
        <template #default="{ row }">
          <el-input
            :model-value="formatTags(row.tags)"
            readonly
            size="small"
          />
        </template>
      </el-table-column>

      <el-table-column label="Тип записи" width="150">
        <template #default="{ row }">
          <el-select
            :model-value="row.type"
            disabled
            size="small"
            style="width: 100%"
          >
            <el-option :label="AccountType.LOCAL" :value="AccountType.LOCAL" />
            <el-option :label="AccountType.LDAP" :value="AccountType.LDAP" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="Логин" min-width="120">
        <template #default="{ row }">
          <el-input
            :model-value="row.login"
            readonly
            size="small"
            placeholder="Значение"
          />
        </template>
      </el-table-column>

      <el-table-column label="Пароль" min-width="150">
        <template #default="{ row }">
          <div class="password-field">
            <el-input
              :model-value="formatPassword(row)"
              :type="getPasswordInputType(row)"
              readonly
              size="small"
              :disabled="row.type === AccountType.LDAP"
            >
              <template 
                v-if="row.type === AccountType.LOCAL && row.password"
                #suffix
              >
                <el-button
                  :icon="showPasswordMap[row.id] ? Hide : View"
                  link
                  size="small"
                  @click="togglePasswordVisibility(row.id)"
                  style="padding: 0 4px"
                />
              </template>
            </el-input>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Действия" width="80" fixed="right">
        <template #default="{ row }">
          <el-button
            :icon="Delete"
            type="danger"
            link
            size="small"
            @click="handleDelete(row)"
            title="Удалить запись"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.account-list {
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
}

.help-alert {
  margin-bottom: 16px;
}

.password-field {
  width: 100%;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: var(--el-disabled-bg-color);
}

:deep(.el-select.is-disabled .el-input__wrapper) {
  background-color: var(--el-disabled-bg-color);
}
</style>
