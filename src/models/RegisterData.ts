export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  roles: string[]
}
export class RegisterRequestDto {
  username: string
  email: string
  password: string
  roles: string[]

  constructor(username: string, password: string, email: string, roles: string[]) {
    this.username = username
    this.password = password
    this.roles = roles
    this.email = email
  }
}
