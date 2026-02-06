import { createRoot } from 'react-dom/client'
import './tailwind.css'
import './lib/i18n'
import App from './App'

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)

root.render(<App />)
