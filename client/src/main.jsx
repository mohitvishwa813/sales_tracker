import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { Analytics } from '@vercel/analytics/react';

const updateSW = registerSW({
  onNeedRefresh() {
    console.log('App needs refresh');
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>,
)
