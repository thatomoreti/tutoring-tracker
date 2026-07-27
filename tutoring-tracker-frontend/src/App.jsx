import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LearnersPage from './pages/LearnersPage';
import SubjectsPage from './pages/SubjectsPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LearnersPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;