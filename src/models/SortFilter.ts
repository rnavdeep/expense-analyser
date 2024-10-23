export class SortFilter {
  propertyName: string
  ascending: boolean

  constructor(propName: string, asc: boolean = true) {
    this.propertyName = propName
    this.ascending = asc
  }
}
