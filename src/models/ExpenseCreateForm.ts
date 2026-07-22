export interface ExpenseCreateForm {
  title: string
  description: string
  amount: number
  category: string
  allowReceipts: boolean
  files: File[] // Array of File objects
}
export class ExpenseDataDto {
  title: string
  description: string
  amount: number
  category?: string
  allowReceipts: boolean

  constructor(
    title: string,
    description: string,
    amount: number = 0,
    allowReceipts: boolean = true,
    category?: string
  ) {
    this.title = title
    this.description = description
    this.amount = amount
    this.allowReceipts = allowReceipts
    this.category = category
  }
}

export class ExpenseListDataDto {
  id: string
  title: string
  description: string
  amount: number
  createdAt: string
  allowReceipts: boolean
  scannedReceiptsTotal: number
  sharedByUsername?: string

  constructor(
    id: string,
    title: string,
    description: string,
    amount: number,
    createdAt: string,
    allowReceipts: boolean = true,
    scannedReceiptsTotal: number = 0,
    sharedByUsername?: string
  ) {
    this.id = id
    this.title = title
    this.description = description
    this.amount = amount
    this.createdAt = createdAt
    this.allowReceipts = allowReceipts
    this.scannedReceiptsTotal = scannedReceiptsTotal
    this.sharedByUsername = sharedByUsername
  }
}
export class UpdateExpenseDto {
  id: string
  title: string
  description: string
  amount?: number
  constructor(id: string, title: string, description: string, amount?: number) {
    this.id = id
    this.title = title
    this.description = description
    this.amount = amount
  }
}
