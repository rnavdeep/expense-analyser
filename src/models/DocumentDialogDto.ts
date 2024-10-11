export class DocumentDialogDto {
  id: string
  name: string
  url: string
  jobStatus: any
  constructor(id: string, name: string, url: string, jobStatus: any) {
    this.id = id
    this.name = name
    this.url = url
    this.jobStatus = jobStatus
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
