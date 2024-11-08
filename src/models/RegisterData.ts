export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  roles: string[]
}
export class RegisterRequestDto {
  Username: string
  Email: string
  Password: string
  Roles: string[]

  constructor(username: string, password: string, email: string, roles: string[]) {
    this.Username = username
    this.Password = password
    this.Roles = roles
    this.Email = email
  }
}
