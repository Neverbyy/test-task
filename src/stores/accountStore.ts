import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AccountType, type Account } from '../types/account';

export const useAccountStore = defineStore('accounts', () => {
  // State
  const accounts = ref<Account[]>([]);
  const isLoading = ref(false);

  // Getters
  const getAccounts = computed(() => accounts.value);
  const getLocalAccounts = computed(() => 
    accounts.value.filter(account => account.type === AccountType.LOCAL)
  );
  const getLdapAccounts = computed(() => 
    accounts.value.filter(account => account.type === AccountType.LDAP)
  );
  const hasLocalAccounts = computed(() => 
    accounts.value.some(account => account.type === AccountType.LOCAL)
  );

  // Actions
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const addAccount = (account: Omit<Account, 'id'>): void => {
    const newAccount: Account = {
      id: generateId(),
      ...account
    };
    
    // Убеждаемся, что tags всегда является массивом
    if (!Array.isArray(newAccount.tags)) {
      newAccount.tags = [];
    }
    
    accounts.value.push(newAccount);
    saveToLocalStorage();
  };

  const updateAccount = (updatedAccount: Account): void => {
    const index = accounts.value.findIndex(acc => acc.id === updatedAccount.id);
    if (index !== -1) {
      accounts.value[index] = updatedAccount;
      saveToLocalStorage();
    }
  };

  const deleteAccount = (id: string): void => {
    const index = accounts.value.findIndex(acc => acc.id === id);
    if (index !== -1) {
      accounts.value.splice(index, 1);
      saveToLocalStorage();
    }
  };

  const clearAccounts = (): void => {
    accounts.value = [];
    saveToLocalStorage();
  };

  // LocalStorage operations
  const saveToLocalStorage = (): void => {
    try {
      localStorage.setItem('accounts', JSON.stringify(accounts.value));
      console.log('Данные сохранены в localStorage:', accounts.value);
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  };

  const loadFromLocalStorage = (): void => {
    try {
      const stored = localStorage.getItem('accounts');
      if (stored) {
        const parsedAccounts = JSON.parse(stored);
        console.log('Загружены данные из localStorage:', parsedAccounts);
        
        // Миграция: преобразуем старые строковые метки в новый формат
        accounts.value = parsedAccounts.map((account: any) => {
          if (typeof account.tags === 'string') {
            // Старый формат - преобразуем в новый
            const tagsArray = account.tags
              .split(';')
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag.length > 0)
              .map((tag: string) => ({ text: tag }));
            
            return { ...account, tags: tagsArray };
          }
          return account;
        });
        console.log('Данные после миграции:', accounts.value);
      } else {
        console.log('В localStorage нет сохраненных данных');
      }
    } catch (error) {
      console.error('Ошибка загрузки из localStorage:', error);
      accounts.value = [];
    }
  };

  // Initialize store
  const initializeStore = (): void => {
    loadFromLocalStorage();
  };

  return {
    // State
    accounts,
    isLoading,
    
    // Getters
    getAccounts,
    getLocalAccounts,
    getLdapAccounts,
    hasLocalAccounts,
    
    // Actions
    addAccount,
    updateAccount,
    deleteAccount,
    clearAccounts,
    initializeStore
  };
});
