import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TripsPage from './pages/TripsPage';
import HistoryPage from './pages/HistoryPage';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
    return (
        <Router>
            <div className="d-flex flex-column min-vh-100 bg-light">
                <NavigationBar />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/trips" element={<TripsPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;