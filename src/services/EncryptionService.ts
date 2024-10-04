import CryptoJS from 'crypto-js'

class EncryptionService {
  private secretKey: string

  constructor() {
    this.secretKey = 'CLNWdt98ejGk7H5Wkxue2q/cI3b41e+rxVtPhCoVP90=' // Use a secure secret key
  }

  // Method to encrypt data
  encrypt(data: any): string {
    const jsonData = JSON.stringify(data) // Convert data to JSON string

    // Generate a random IV
    const iv = CryptoJS.lib.WordArray.random(128 / 8) // 128 bits = 16 bytes

    // Encrypt the data with the IV
    const encrypted = CryptoJS.AES.encrypt(jsonData, CryptoJS.enc.Base64.parse(this.secretKey), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Combine IV and encrypted data in a single string
    const result = iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString()
    return result // Return IV and encrypted data
  }

  // Method to decrypt data
  decrypt(encryptedData: string): any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey)
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
    console.log(decryptedData)
    return JSON.parse(decryptedData)
  }
}

export default new EncryptionService()
