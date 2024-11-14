import type { ExpenseDto } from './ExpenseDto'

export interface FriendDto {
  username: string
  acceptedAt: Date
  sharedExpenses: ExpenseDto[]
}
