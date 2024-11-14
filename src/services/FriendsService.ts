import type { UserDto } from '@/models/UserDto'
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_APP_API_URL

const API_URL = BASE_URL + '/Friends'

class FriendsService {
  async GetUser(searchQuery: string): Promise<any> {
    try {
      const resp = await axios.get(`${API_URL}/${searchQuery}`, {
        withCredentials: true
      })
      if (resp.status == 200) {
        return resp.data
      }
      if (resp.status == 404) {
        return 'Not Found'
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get user')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  async SendRequest(user: UserDto): Promise<any> {
    try {
      const resp = await axios.post(
        `${API_URL}/sendRequest`,
        user, // Send the id and username in the request body
        { withCredentials: true }
      )

      if (resp.status == 400) {
        return resp.statusText
      }
    } catch (error) {
      console.error('Error sending request:', error)
      return 'Error occurred'
    }
  }
  async AcceptRequest(id: String): Promise<any> {
    try {
      const resp = await axios.post(`${API_URL}/acceptRequest`, id, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      if (resp.status == 400) {
        return resp.statusText
      }
    } catch (error) {
      // Handle any potential errors
      console.error('Error sending request:', error)
      return 'Error occurred'
    }
  }
  async GetFriends(): Promise<any> {
    try {
      const resp = await axios.get(`${API_URL}/getFriends`, { withCredentials: true })

      if (resp.status == 404) {
        return resp.statusText
      }
      return resp.data
    } catch (error) {
      console.error('Error sending request:', error)
      return 'Error occurred'
    }
  }
}

export default new FriendsService()
