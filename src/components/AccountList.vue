<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElTable, ElTableColumn, ElInput, ElSelect, ElOption, ElButton, ElMessageBox, ElMessage } from 'element-plus';
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
const validationErrors = ref<Record<string, { login?: boolean; password?: boolean }>>({});

const hasLocalAccounts = computed(() => {
  return props.accounts.some(account => account.type === AccountType.LOCAL);
});

const validateAccount = (account: Account): boolean => {
  const errors: { login?: boolean; password?: boolean } = {};
  
  // Логин обязателен
  if (!account.login || account.login.trim() === '') {
    errors.login = true;
  }
  
  // Пароль обязателен только для локальных записей
  if (account.type === AccountType.LOCAL && (!account.password || account.password.trim() === '')) {
    errors.password = true;
  }
  
  validationErrors.value[account.id] = errors;
  
  // Возвращаем true если нет ошибок
  return Object.keys(errors).length === 0;
};

const clearValidationErrors = (accountId: string): void => {
  delete validationErrors.value[accountId];
};

const hasFieldError = (accountId: string, field: 'login' | 'password'): boolean => {
  return !!validationErrors.value[accountId]?.[field];
};


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



const handleLoginUpdate = (account: Account, value: string): void => {
  handleFieldUpdate(account, 'login', value);
};

const handlePasswordUpdate = (account: Account, value: string): void => {
  handleFieldUpdate(account, 'password', value);
};

const handleLoginBlur = (account: Account): void => {
  const isValid = validateAccount(account);
  if (isValid) {
    clearValidationErrors(account.id);
    ElMessage.success('Запись сохранена');
  }
};

const handlePasswordBlur = (account: Account): void => {
  const isValid = validateAccount(account);
  if (isValid) {
    clearValidationErrors(account.id);
    ElMessage.success('Запись сохранена');
  }
};

const handleTypeChange = (account: Account, value: AccountType): void => {
  handleFieldUpdate(account, 'type', value);
  
  // Валидация после изменения типа
  const isValid = validateAccount(account);
  if (isValid) {
    clearValidationErrors(account.id);
    ElMessage.success('Запись сохранена');
  }
};

const handleSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // Если это LDAP запись и колонка "Пароль" (индекс 3)
  if (row.type === AccountType.LDAP && columnIndex === 3) {
    return [0, 0]; // Скрываем ячейку
  }
  
  // Если это LDAP запись и колонка "Логин" (индекс 2)
  if (row.type === AccountType.LDAP && columnIndex === 2) {
    return [1, 2]; // Растягиваем на 2 колонки
  }
  
  return [1, 1]; // Обычная ячейка
};
</script>

<template>
  <div class="account-list">
    <el-table
      :data="props.accounts"
      style="width: 100%"
      empty-text="Нет учетных записей"
      table-layout="auto"
      :span-method="handleSpanMethod"
    >
      <el-table-column label="Метки" min-width="150">
        <template #default="{ row }">
          <el-input
            :model-value="row.tags"
            @input="(value: string) => handleTagsUpdate(row, value)"
            @blur="() => handleLoginBlur(row)"
            size="small"
            maxlength="50"
            show-word-limit
            placeholder="Введите метки"
          />
        </template>
      </el-table-column>

      <el-table-column label="Тип записи" width="150">
        <template #default="{ row }">
          <el-select
            :model-value="row.type"
            @change="(value: AccountType) => handleTypeChange(row, value)"
            size="small"
            style="width: 100%"
          >
            <el-option :label="AccountType.LOCAL" :value="AccountType.LOCAL" />
            <el-option :label="AccountType.LDAP" :value="AccountType.LDAP" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column label="Логин" min-width="300">
        <template #default="{ row }">
          <div v-if="row.type === AccountType.LOCAL" class="login-field-local">
            <el-input
              :model-value="row.login"
              @input="(value: string) => handleLoginUpdate(row, value)"
              @blur="() => handleLoginBlur(row)"
              size="small"
              placeholder="Значение"
              :class="{ 'error-field': hasFieldError(row.id, 'login') }"
            />
          </div>
          <div v-else class="login-field-ldap">
            <el-input
              :model-value="row.login"
              @input="(value: string) => handleLoginUpdate(row, value)"
              @blur="() => handleLoginBlur(row)"
              size="small"
              placeholder="Значение"
              :class="{ 'error-field': hasFieldError(row.id, 'login') }"
            />
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

      <el-table-column label="Пароль" min-width="180">
        <template #default="{ row }">
          <div v-if="row.type === AccountType.LOCAL" class="password-field-with-actions">
            <div class="password-input-wrapper">
              <el-input
                :model-value="row.password || ''"
                @input="(value: string) => handlePasswordUpdate(row, value)"
                @blur="() => handlePasswordBlur(row)"
                :type="showPasswordMap[row.id] ? 'text' : 'password'"
                size="small"
                placeholder="● ● ● ● ● ●"
                :class="{ 'error-field': hasFieldError(row.id, 'password') }"
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

.login-field-local {
  width: 100%;
}

.login-field-ldap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.login-field-ldap .el-input {
  flex: 1;
  min-width: 0;
}

/* Для LDAP записей поле логина растягивается на всю ширину объединенной ячейки */
:deep(.el-table__row .el-table__cell:nth-child(3)[rowspan="2"]) {
  width: calc(100% + 180px); /* Ширина колонки логина + ширина колонки пароля */
}

.password-field-ldap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.ldap-password-text {
  flex: 1;
  color: var(--el-text-color-placeholder);
  font-style: italic;
  padding: 8px 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
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

/* Стили для полей с ошибками валидации */
:deep(.error-field .el-input__wrapper) {
  border-color: var(--el-color-danger) !important;
  box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}

:deep(.error-field .el-input__wrapper:hover) {
  border-color: var(--el-color-danger) !important;
}

:deep(.error-field .el-input__wrapper.is-focus) {
  border-color: var(--el-color-danger) !important;
  box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}
</style>
