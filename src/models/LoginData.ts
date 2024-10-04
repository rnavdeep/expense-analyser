export interface LoginData {
  username: string
  password: string
}
export class LoginDataDto {
  username: string
  password: string

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
  }
}
export class LoginToken {
  token: string | undefined
}
