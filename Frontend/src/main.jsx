//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import { SocketProvider } from './socket/SocketProvider.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <SocketProvider>
      <App />

    </SocketProvider>
  </AuthProvider>,
)
