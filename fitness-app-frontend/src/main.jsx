import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { Provider } from 'react-redux'
import { store } from './store/store'
import { AuthProvider } from 'react-oauth2-code-pkce'
import { authConfig } from './authConfig'
import { ThemeModeProvider } from './context/ThemeModeContext'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <AuthProvider
    authConfig={authConfig}
    loadingComponent={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', color: '#ff9800', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
        Initializing PulseForge...
      </div>
    }
  >
    <Provider store={store}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </Provider>
  </AuthProvider>,
)