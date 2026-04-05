import React, { useState } from 'react';
import { Container, Card, Form, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ hoTen: '', soDienThoai: '', email: '', matKhau: '' });
    const navigate = useNavigate();

    // Dùng Modal thay cho alert để demo cho đẹp
    const [dialog, setDialog] = useState({ show: false, message: '', isSuccess: false });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Auth/register', formData);
            if (res.data.success) {
                setDialog({ show: true, message: res.data.message, isSuccess: true });
            }
        } catch (error) {
            // In thẳng lỗi Trigger của Oracle ra màn hình
            setDialog({ show: true, message: (error.response?.data?.message || error.message), isSuccess: false });
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '70vh' }}>
            <Card className="shadow p-4 border-0" style={{ width: '450px', borderRadius: '15px' }}>
                <h3 className="text-center fw-bold mb-4" style={{ color: '#ef5222' }}>ĐĂNG KÝ TÀI KHOẢN</h3>
                <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Họ và Tên</Form.Label>
                        <Form.Control type="text" placeholder="Nguyễn Văn A" required onChange={(e) => setFormData({...formData, hoTen: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                        <Form.Control type="text" placeholder="Gồm 10 số..." required onChange={(e) => setFormData({...formData, soDienThoai: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Email (Tuỳ chọn)</Form.Label>
                        <Form.Control type="email" placeholder="example@gmail.com" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Mật khẩu</Form.Label>
                        <Form.Control type="password" required onChange={(e) => setFormData({...formData, matKhau: e.target.value})} />
                    </Form.Group>
                    <Button type="submit" className="w-100 fw-bold rounded-pill mb-3" style={{ backgroundColor: '#ef5222', border: 'none' }}>
                        HOÀN TẤT ĐĂNG KÝ
                    </Button>
                    <div className="text-center">
                        <span>Đã có tài khoản? </span>
                        <span className="text-primary fw-bold" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Đăng nhập</span>
                    </div>
                </Form>
            </Card>

            {/* POPUP THÔNG BÁO */}
            <Modal show={dialog.show} onHide={() => { setDialog({ ...dialog, show: false }); if (dialog.isSuccess) navigate('/login'); }} centered>
                <Modal.Header closeButton style={{ backgroundColor: dialog.isSuccess ? '#198754' : '#dc3545', color: 'white' }}>
                    <Modal.Title className="fw-bold">Thông báo</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 fw-bold text-center fs-5 text-danger">{dialog.message}</Modal.Body>
            </Modal>
        </Container>
    );
};

export default RegisterPage;