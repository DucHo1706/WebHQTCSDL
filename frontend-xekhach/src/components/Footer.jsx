import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#212529', color: '#fff', padding: '40px 0 20px 0', marginTop: '50px' }}>
            <Container>
                <Row>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3" style={{ color: '#ef5222' }}>🚌 PHƯƠNG NAM LINE</h5>
                        <p>Hệ thống đặt vé xe khách trực tuyến hàng đầu, mang đến cho bạn những chuyến đi an toàn, tiện lợi và đẳng cấp nhất.</p>
                        <p>📍 Địa chỉ: 123 Đường Vui Vẻ, Quận 1, TP.HCM</p>
                        <p>📞 Tổng đài: 1900 1234</p>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3">Tuyến Xe Phổ Biến</h5>
                        <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '2' }}>
                            <li>Sài Gòn - Đà Lạt</li>
                            <li>Sài Gòn - Nha Trang</li>
                            <li>Sài Gòn - Cần Thơ</li>
                            <li>Nha Trang - Đà Lạt</li>
                        </ul>
                    </Col>
                    <Col md={4} className="mb-4">
                        <h5 className="fw-bold mb-3">Chính Sách & Quy Định</h5>
                        <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '2' }}>
                            <li>Chính sách bảo mật</li>
                            <li>Quy định hủy/đổi vé</li>
                            <li>Hướng dẫn đặt vé online</li>
                            <li>Cam kết chất lượng</li>
                        </ul>
                    </Col>
                </Row>
                <hr style={{ borderColor: '#495057' }} />
                <div className="text-center pt-2">
                    <p className="mb-0">© 2026 Phương Nam Line. Đồ án môn Hệ Quản Trị CSDL.</p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;