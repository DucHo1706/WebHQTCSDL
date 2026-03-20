import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
    const [soDienThoai, setSoDienThoai] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Gọi API C# hoặc Node.js tùy backend bạn đang chạy
            const res = await api.post('/Auth/login', { soDienThoai, matKhau });
            
            if (res.data.success || res.data.token) {
                // Lưu Token và User vào bộ nhớ trình duyệt
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                
                alert("Đăng nhập thành công!");
                navigate('/'); // Quay về trang chủ
                window.location.reload(); // Reload để Navbar cập nhật tên
            }
        } catch (error) {
            alert("Đăng nhập thất bại: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '70vh' }}>
            <Card className="shadow p-4 border-0" style={{ width: '400px', borderRadius: '15px' }}>
                <h3 className="text-center fw-bold mb-4" style={{ color: '#ef5222' }}>ĐĂNG NHẬP</h3>
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                        <Form.Control type="text" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Mật khẩu</Form.Label>
                        <Form.Control type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} required />
                    </Form.Group>
                    <Button type="submit" className="w-100 fw-bold rounded-pill" style={{ backgroundColor: '#ef5222', border: 'none' }}>
                        ĐĂNG NHẬP
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default LoginPage;