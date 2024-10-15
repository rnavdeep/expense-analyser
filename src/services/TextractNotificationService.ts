// src/services/signalRService.ts
import * as signalR from '@microsoft/signalr'
import { useNotificationStore } from '../stores/Notifications'
let connection: signalR.HubConnection | null = null
const startConnection = async () => {
  if (connection) {
    try {
      await connection.stop() // Stop the existing connection if it exists
      console.log('Existing connection stopped.')
    } catch (err) {
      console.error('Error stopping existing connection: ', err)
    }
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5223/textractNotification')
    .build()
  monitorHub()
  try {
    await connection.start()
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
      notificationStore.GetUnreadNotifications()
      notificationStore.GetReadNotifications()
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
