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
  (e: 'update', account: Account): void;
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
        confirmButtonText: 'Удалить',
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



const handleFieldUpdate = (account: Account, field: keyof Account, value: any): void => {
  const updatedAccount = { ...account, [field]: value };
  
  // Если изменился тип на LDAP, обнуляем пароль
  if (field === 'type' && value === AccountType.LDAP) {
    updatedAccount.password = null;
  }
  
  emit('update', updatedAccount);
};

const handleTagsUpdate = (account: Account, value: string): void => {
  // Ограничение на 50 символов
  const limitedValue = value.length > 50 ? value.slice(0, 50) : value;
  handleFieldUpdate(account, 'tags', limitedValue);
};

const handleTypeUpdate = (account: Account, value: AccountType): void => {
  handleFieldUpdate(account, 'type', value);
};

const handleLoginUpdate = (account: Account, value: string): void => {
  handleFieldUpdate(account, 'login', value);
};

const handlePasswordUpdate = (account: Account, value: string): void => {
  handleFieldUpdate(account, 'password', value);
};
</script>

<template>
  <div class="account-list">
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
            :model-value="row.tags"
            @input="(value: string) => handleTagsUpdate(row, value)"
            size="small"
            maxlength="50"
            show-word-limit
            placeholder="Введите метки через ;"
          />
        </template>
      </el-table-column>

      <el-table-column label="Тип записи" width="150">
        <template #default="{ row }">
          <el-select
            :model-value="row.type"
            @change="(value: AccountType) => handleTypeUpdate(row, value)"
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
            @input="(value: string) => handleLoginUpdate(row, value)"
            size="small"
            placeholder="Значение"
          />
        </template>
      </el-table-column>

      <el-table-column label="Пароль" min-width="180">
        <template #default="{ row }">
          <div class="password-field-with-actions">
            <div class="password-input-wrapper">
              <el-input
                v-if="row.type === AccountType.LOCAL"
                :model-value="row.password || ''"
                @input="(value: string) => handlePasswordUpdate(row, value)"
                :type="showPasswordMap[row.id] ? 'text' : 'password'"
                size="small"
                placeholder="● ● ● ● ● ●"
              >
                <template #suffix>
                  <el-button
                    :icon="showPasswordMap[row.id] ? Hide : View"
                    link
                    size="small"
                    @click="togglePasswordVisibility(row.id)"
                    style="padding: 0 4px"
                  />
                </template>
              </el-input>
              <el-input
                v-else
                model-value="—"
                readonly
                disabled
                size="small"
              />
            </div>
            <el-button
              :icon="Delete"
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
              title="Удалить запись"
              class="delete-button"
            />
          </div>
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

.password-field-with-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.password-input-wrapper {
  flex: 1;
}

.delete-button {
  flex-shrink: 0;
  color: var(--el-color-danger);
}

.delete-button:hover {
  color: var(--el-color-danger-light-3);
  background-color: var(--el-color-danger-light-9);
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
