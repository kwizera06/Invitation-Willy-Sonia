import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BackgroundSlider from './components/BackgroundSlider';
import LanguageSwitcher from './components/LanguageSwitcher';
import InvitationPage from './pages/InvitationPage';
import RSVPForm from './pages/RSVPForm';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <LanguageSwitcher />
        {/* Global Persistent Background Slider */}
        <BackgroundSlider />

        <main className="content-wrapper">
          <Routes>
            <Route path="/" element={<InvitationPage />} />
            <Route path="/rsvp" element={<RSVPForm />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
