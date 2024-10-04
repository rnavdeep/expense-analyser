export class LoginResponse {
  isLoggedIn: boolean
  errors: string
  constructor(isLoggedIn: boolean, errors: string) {
    this.isLoggedIn = isLoggedIn
    this.errors = errors
  }
}
