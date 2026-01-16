import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BuilderPage from './pages/BuilderPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BuilderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
