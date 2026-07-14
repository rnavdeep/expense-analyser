export interface ExpenseCreateForm {
  title: string
  description: string
  amount: number
  allowReceipts: boolean
  files: File[] // Array of File objects
}
export class ExpenseDataDto {
  title: string
  description: string
  amount: number
  allowReceipts: boolean

  constructor(title: string, description: string, amount: number = 0, allowReceipts: boolean = true) {
    this.title = title
    this.description = description
    this.amount = amount
    this.allowReceipts = allowReceipts
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

  constructor(
    id: string,
    title: string,
    description: string,
    amount: number,
    createdAt: string,
    allowReceipts: boolean = true,
    scannedReceiptsTotal: number = 0
  ) {
    this.id = id
    this.title = title
    this.description = description
    this.amount = amount
    this.createdAt = createdAt
    this.allowReceipts = allowReceipts
    this.scannedReceiptsTotal = scannedReceiptsTotal
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
