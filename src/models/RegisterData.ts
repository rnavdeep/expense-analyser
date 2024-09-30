export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}
export class RegisterRequestDto {
  username: string
  password: string
  roles?: string[]

  constructor(username: string, password: string, roles?: string[]) {
    this.username = username
    this.password = password
    this.roles = roles
  }
}