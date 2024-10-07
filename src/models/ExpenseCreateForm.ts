export interface ExpenseCreateForm {
  title: string
  description: string
  files: File[] // Array of File objects
}
export class ExpenseDataDto {
  title: string
  description: string

  constructor(title: string, description: string) {
    this.title = title
    this.description = description
  }
}

export class ExpenseListDataDto {
  id: string
  title: string
  description: string
  amount: number
  createdAt: string

  constructor(id: string, title: string, description: string, amount: number, createdAt: string) {
    this.id = id
    this.title = title
    this.description = description
    this.amount = amount
    this.createdAt = createdAt
  }
}
