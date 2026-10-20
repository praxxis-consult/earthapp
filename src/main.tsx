import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import SessionBootstrap from './feature/authentication/SessionBootstrap'
import Realtime from './feature/realtime/Realtime'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SessionBootstrap>
          <Realtime />
          <App />
        </SessionBootstrap>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
