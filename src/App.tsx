import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'
import MembershipPage from './pages/MembershipPage'
import MyPage from './pages/MyPage'
import NotFoundPage from './pages/NotFoundPage'
import SubscribePage from './pages/SubscribePage'
import AppLayout from './shared/layout/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
