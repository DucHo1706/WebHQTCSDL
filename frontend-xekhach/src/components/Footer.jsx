import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-5 mt-auto">
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: '#ef5222' }}>PHƯƠNG NAM LINE</h5>
                        <p className="text-light" style={{ opacity: 0.8 }}>Hệ thống đặt vé xe khách trực tuyến hàng đầu, mang lại trải nghiệm an toàn, nhanh chóng và tiện lợi cho mọi hành trình của bạn.</p>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3">THÔNG TIN LIÊN HỆ</h5>
                        <p className="mb-2" style={{ opacity: 0.8 }}>Hotline: <strong>1900 1234</strong></p>
                        <p className="mb-2" style={{ opacity: 0.8 }}>Email: hotro@phuongnamline.vn</p>
                        <p className="mb-2" style={{ opacity: 0.8 }}>Địa chỉ: 123 Đường Bến Xe, Quận 1, TP.HCM</p>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3">HỖ TRỢ KHÁCH HÀNG</h5>
                        <p className="mb-2" style={{ cursor: 'pointer', opacity: 0.8 }}>Hướng dẫn đặt vé</p>
                        <p className="mb-2" style={{ cursor: 'pointer', opacity: 0.8 }}>Chính sách hoàn/hủy vé</p>
                        <p className="mb-2" style={{ cursor: 'pointer', opacity: 0.8 }}>Quy định hành lý</p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;