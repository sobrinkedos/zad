import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.tsx'

const _origConsoleError = console.error
console.error = (...args) => {
  const s = args.map(a => typeof a === 'string' ? a : '').join(' ')
  if (s.includes('net::ERR_ABORTED')) return
  _origConsoleError(...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
