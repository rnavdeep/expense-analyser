export class DocumentDialogDto {
  id: string
  name: string
  url: string
  constructor(id: string, name: string, url: string) {
    this.id = id
    this.name = name
    this.url = url
  }
}
export class CreateDocumentDto {
  id: any
  file: Object

  constructor(id: any, file: Object) {
    this.id = id
    this.file = file
  }
}
