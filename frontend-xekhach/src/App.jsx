import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TripsPage from './pages/TripsPage'; 
import LoginPage from './pages/LoginPage'; 
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';
function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavigationBar />
        
        {/* Vùng nội dung thay đổi tùy theo URL */}
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/login" element={<LoginPage />} /> 
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;