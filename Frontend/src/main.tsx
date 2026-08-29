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
import UnauthenticatedRoute from './components/routing/UnauthenticatedRoute'
import AuthenticatedRoute from './components/routing/AuthenticatedRoute'
import AppLayout from './components/layout/AppLayout'
import AccountSettings from './pages/AccountSettings'
import PersonalListViewer from './pages/PersonalListViewer'

import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                {/* Authentication routes - only accessible if not already authenticated */}
                <Routes>
                    <Route element={<UnauthenticatedRoute />}>
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<Register />} />
                        <Route path='/discord-callback' element={<DiscordCallback />} />
                    </Route>
                </Routes>

                {/* Application routes - only accessible to authenticated users */}
                <Routes>
                    <Route element={<AuthenticatedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path='/' element={<Homepage />} />
                            
                            <Route path='/settings' element={<AccountSettings />} />

                            <Route path='/user/:user_id/list' element={<PersonalListViewer />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>

            <Toaster position='bottom-right' />
        </AuthProvider>
    </StrictMode>,
)
