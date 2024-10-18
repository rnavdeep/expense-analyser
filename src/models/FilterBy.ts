export class FilterBy {
  propertyName: string
  value: any
  type: string

  constructor(propertyName: string, value: any, type: string) {
    this.propertyName = propertyName
    this.value = value
    this.type = type
  }
}
