import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import invitationVideo from './assets/Will&Sonia.mp4';
import InvitationPage from './pages/InvitationPage';
import RSVPForm from './pages/RSVPForm';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Global Persistent Video Background */}
        <div className="video-background-wrapper">
          <video className="global-video" autoPlay muted loop playsInline>
            <source src={invitationVideo} type="video/mp4" />
          </video>
          <div className="global-video-overlay" />
        </div>

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
