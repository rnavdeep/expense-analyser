export interface ExpenseData {
  NAME: string
  ADDRESS: string
  TOTAL: string
}

export default class ExpenseResults {
  private data: any

  constructor(data: any) {
    this.data = data
  }

  getName(): string {
    return this.data.NAME || this.data.VENDOR_NAME || 'Unknown'
  }

  getAddress(): string {
    return this.data.ADDRESS || this.data.ADDRESS_BLOCK || this.data.VENDOR_ADDRESS || 'Unknown'
  }

  getTotalAmount(): string {
    return this.data.TOTAL || 'Unknown'
  }

  extractSummary(): ExpenseData {
    return {
      NAME: this.getName(),
      ADDRESS: this.getAddress(),
      TOTAL: this.getTotalAmount()
    }
  }
}
