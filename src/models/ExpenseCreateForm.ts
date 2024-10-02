export interface ExpenseCreateForm {
  title: string
  description: string
  files: File[] // Array of File objects
}
export class ExpenseDataDto {
  title: string
  description: string
  files: Object[] // Array of File objects

  constructor(title: string, description: string, files: Object[]) {
    this.title = title
    this.description = description
    this.files = files
  }
}
