import axios from 'axios'

const API_URL = 'http://localhost:5223/api/Notification'

class NotificationService {
  /**
   *
   * @returns  List of Unread Notifications for logged in user.
   */
  async GetUnreadNotifications(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   *
   * @returns  List of Unread Notifications for logged in user.
   */
  async GetReadNotifications(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}`, {
        params: { read: 1 },
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @returns  List of Unread Notifications for logged in user.
   */
  async GetAllNotifications(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}`, {
        withCredentials: true
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch notifications')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * Marks all unread notifications as read for logged in user.
   */
  async ReadAllUnreadNotifications(): Promise<void> {
    try {
      await axios.post(`${API_URL}/readAll`, null, {
        withCredentials: true
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new NotificationService()
