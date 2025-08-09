export const AccountType = {
  LOCAL: 'Локальная',
  LDAP: 'LDAP'
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];

export interface Account {
  id: string;
  tags: string;
  type: AccountType;
  login: string;
  password: string | null;
}
