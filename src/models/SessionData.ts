export class SessionData {
  userName: string
  isLoggedIn: boolean
  constructor(userName: string, isLoggedIn: boolean) {
    ;(this.userName = userName), (this.isLoggedIn = isLoggedIn)
  }
}
