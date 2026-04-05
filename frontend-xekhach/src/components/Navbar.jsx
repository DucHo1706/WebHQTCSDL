import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
    const navigate = useNavigate();
    
    // Kiểm tra xem có user trong localStorage không
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload(); // Tải lại trang để xóa cache
    };

    return (
        <Navbar expand="lg" style={{ backgroundColor: '#ef5222' }} variant="dark" className="shadow-sm py-3">
            <Container>
                <Navbar.Brand onClick={() => navigate('/')} style={{cursor: 'pointer'}} className="fw-bold fs-4">
                     PHƯƠNG NAM LINE
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link onClick={() => navigate('/')} className="text-white fw-semibold">TRANG CHỦ</Nav.Link>
                    </Nav>
                    
                    <Nav>
                        {user ? (
                            <div className="d-flex align-items-center">
                                
                             <span className="text-white fw-bold me-3">👋 Xin chào, {user.hoTen}</span>
                             {user.roles && user.roles.includes('Admin') && (
                                 <Button variant="light" size="sm" onClick={() => navigate('/admin')} className="rounded-pill fw-bold me-2" style={{ color: '#ef5222' }}>
                                     QUẢN TRỊ
                                 </Button>
                             )}
                             <Button variant="outline-light" size="sm" onClick={() => navigate('/history')} className="rounded-pill fw-bold me-2">
                                  LỊCH SỬ VÉ
                             </Button>
                             <Button variant="dark" size="sm" onClick={handleLogout} className="rounded-pill fw-bold">
                                 ĐĂNG XUẤT
                             </Button>
                         </div>
                        ) : (
                            <Button variant="outline-light" className="fw-bold px-4 rounded-pill" onClick={() => navigate('/login')}>
                                 ĐĂNG NHẬP
                            </Button>
                            
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;