import type { ExpenseDto } from './ExpenseDto'

export interface FriendDto {
  userId: string
  username: string
  acceptedAt: Date
  sharedExpenses: ExpenseDto[]
}
