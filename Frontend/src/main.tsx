import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Homepage from './pages/Homepage'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'
import Register from './pages/Register'
import DiscordCallback from './pages/DiscordCallback'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/discord-callback' element={<DiscordCallback />} />
          <Route path='/' element={<Homepage />} />
        </Routes>
      </BrowserRouter>

      <Toaster position='bottom-right' />
    </AuthProvider>
  </StrictMode>,
)
