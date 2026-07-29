import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LearnersPage from './pages/LearnersPage';
import SubjectsPage from './pages/SubjectsPage';
import SessionsPage from './pages/SessionsPage';
import InvoicesPage from './pages/InvoicesPage';
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LearnersPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;