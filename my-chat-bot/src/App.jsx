import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import ChatDashboard from './ChatDashboard';
import Login from './login';
import Signup from './signup';
import LoadingScreen from './Loadingscreen';
import WizBotWebsite from './WizBotWebsite';
import './index.css';
import './App.css';

function App() {
  const [user, loading] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(true);

  if (loading) return <LoadingScreen />;

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <Router>
        <Routes>
          <Route path="/" element={<WizBotWebsite />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/chat" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/chat" />} />
          <Route path="/chat" element={user ? <ChatDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
