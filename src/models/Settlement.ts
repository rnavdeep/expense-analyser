/**
 * Settlement types. The `*Dto` interfaces mirror the raw JSON returned by the
 * backend (camelCase, see SettlementController + ExpenseController balances/{userId}).
 */

export interface SettlementDto {
  id: string
  payerUserId: string
  payerUserName: string
  payeeUserId: string
  payeeUserName: string
  amount: number
  note: string | null
  createdAt: string
}

export interface CreateSettlementRequest {
  payeeUserId: string
  amount: number
  note?: string
}

export interface BalanceDetailEntryDto {
  type: 'expense' | 'settlement'
  id: string
  description: string
  amount: number
  direction: 'youOwe' | 'owedToYou'
  createdAt: string
}

export interface BalanceDetailDto {
  userId: string
  userName: string
  netAmount: number
  direction: 'youOwe' | 'owedToYou' | 'settled'
  entries: BalanceDetailEntryDto[]
}
