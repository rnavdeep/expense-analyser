// src/services/signalRService.ts
import * as signalR from '@microsoft/signalr'
import { useNotificationStore } from '../stores/Notifications'
let connection: signalR.HubConnection | null = null
const BASE_URL = import.meta.env.VITE_APP_API_URL
const API_URL = BASE_URL + '/textractNotification'
const startConnection = async () => {
  if (connection) {
    try {
      await connection.stop() // Stop the existing connection if it exists
      console.log('Existing connection stopped.')
    } catch (err) {
      console.error('Error stopping existing connection: ', err)
    }
  }

  connection = new signalR.HubConnectionBuilder().withUrl(API_URL).build()
  monitorHub()
  try {
    await connection.start()
    const notificationStore = useNotificationStore()
    notificationStore.GetAllNotifications()

    console.log('SignalR connection started.')
  } catch (err) {
    console.error('SignalR connection error: ', err)
  }
}

const monitorHub = async () => {
  if (connection) {
    connection.on('ReceiveMessage', (message) => {
      const notificationStore = useNotificationStore()
      notificationStore.GetAllNotifications()
      console.log('User-specific notification: ', message)
    })
  }
}

const stopConnection = async () => {
  if (connection) {
    await connection.stop()
    console.log('SignalR connection stopped.')
    connection = null // Clear the connection reference
  }
}

export default {
  start: startConnection,
  stop: stopConnection
}
