import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HomePage = () => {
    const [diemDi, setDiemDi] = useState('');
    const [diemDen, setDiemDen] = useState('');
    const [ngay, setNgay] = useState('');
    
    const [allRoutes, setAllRoutes] = useState([]);
    const [diemDiList, setDiemDiList] = useState([]);
    const [diemDenList, setDiemDenList] = useState([]);
    
    const navigate = useNavigate();

    // Gọi API lấy danh sách tuyến xe
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await api.get('/Routes');
                if (res.data && res.data.success) {
                    const routes = res.data.data;
                    setAllRoutes(routes);
                    
                    // Lấy danh sách điểm đi duy nhất
                    const uniqueDi = [...new Set(routes.map(r => r.diemDi))].sort();
                    setDiemDiList(uniqueDi);
                    
                    // Mặc định Điểm đến hiển thị tất cả
                    const uniqueDen = [...new Set(routes.map(r => r.diemDen))].sort();
                    setDiemDenList(uniqueDen);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách địa điểm:", error);
            }
        };
        fetchLocations();
    }, []);

    // Xử lý khi chọn Điểm Đi để lọc Điểm Đến
    const handleDiemDiChange = (e) => {
        const selectedDi = e.target.value;
        setDiemDi(selectedDi);
        setDiemDen(''); // Reset Điểm đến khi đổi Điểm đi

        if (selectedDi) {
            // Lọc ra các Điểm đến có tuyến từ Điểm đi đã chọn
            const filteredDen = allRoutes.filter(r => r.diemDi === selectedDi).map(r => r.diemDen);
            setDiemDenList([...new Set(filteredDen)].sort());
        } else {
            // Trả lại toàn bộ Điểm đến nếu không chọn Điểm đi
            const allDen = [...new Set(allRoutes.map(r => r.diemDen))].sort();
            setDiemDenList(allDen);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!diemDi || !diemDen) {
            alert("Vui lòng chọn Điểm đi và Điểm đến!");
            return;
        }
        // Chuyển hướng người dùng sang trang TripsPage cùng với URL Parameters
        navigate(`/trips?diemDi=${diemDi}&diemDen=${diemDen}&ngayDi=${ngay}`);
    };

    return (
        <div>
            {/* Hero Section with Banner Image */}
            <div style={{ 
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop")', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                padding: '120px 0 100px 0', 
                color: 'white', 
                textAlign: 'center' 
            }}>
                <Container>
                    <h1 className="fw-bold mb-3 display-4">HÀNH TRÌNH VẠN DẶM, KHỞI ĐẦU TỪ ĐÂY</h1>
                    <p className="fs-5 mb-5 text-light">Hệ thống đặt vé xe khách trực tuyến nhanh chóng, an toàn và uy tín nhất.</p>
                    
                    <Card className="shadow p-4 mx-auto" style={{ maxWidth: '900px', borderRadius: '15px', color: '#333' }}>
                        <Form onSubmit={handleSearch}>
                            <Row className="g-3 text-start">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-secondary">ĐIỂM ĐI</Form.Label>
                                        <Form.Select value={diemDi} onChange={handleDiemDiChange} required className="p-2 fw-semibold text-dark">
                                            <option value="">-- Chọn Điểm Đi --</option>
                                            {diemDiList.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-secondary">ĐIỂM ĐẾN</Form.Label>
                                        <Form.Select value={diemDen} onChange={e => setDiemDen(e.target.value)} required className="p-2 fw-semibold text-dark">
                                            <option value="">-- Chọn Điểm Đến --</option>
                                            {diemDenList.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-secondary">NGÀY ĐI (Tùy chọn)</Form.Label>
                                        <Form.Control type="date" value={ngay} onChange={e => setNgay(e.target.value)} className="p-2" />
                                    </Form.Group>
                                </Col>
                                <Col md={3} className="d-flex align-items-end">
                                    <Button type="submit" className="w-100 fw-bold p-2" style={{ backgroundColor: '#ef5222', border: 'none' }}>
                                        TÌM CHUYẾN XE
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Container>
            </div>

            {/* Tuyến Đường Phổ Biến Section */}
            <Container className="py-5 mt-4">
                <h3 className="text-center fw-bold mb-5" style={{ color: '#333' }}>CÁC TUYẾN ĐƯỜNG PHỔ BIẾN</h3>
                <Row className="g-4">
                    {[
                        { di: 'TP.HCM', den: 'Đà Lạt', gia: '250.000', km: '300km', color1: '#ff7e5f', color2: '#feb47b' },
                        { di: 'TP.HCM', den: 'Nha Trang', gia: '350.000', km: '430km', color1: '#00c6ff', color2: '#0072ff' },
                        { di: 'TP.HCM', den: 'Cần Thơ', gia: '150.000', km: '165km', color1: '#11998e', color2: '#38ef7d' },
                        { di: 'Nha Trang', den: 'Đà Lạt', gia: '200.000', km: '140km', color1: '#b92b27', color2: '#1565C0' }
                    ].map((route, idx) => (
                        <Col md={3} key={idx}>
                            <Card 
                                className="border-0 shadow-sm text-white h-100 transition-hover" 
                                style={{ borderRadius: '15px', background: `linear-gradient(135deg, ${route.color1} 0%, ${route.color2} 100%)`, cursor: 'pointer' }} 
                                onClick={() => { 
                                    setDiemDi(route.di); 
                                    setDiemDen(route.den); 
                                    window.scrollTo({top: 0, behavior: 'smooth'}); 
                                }}
                            >
                                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                                    <div>
                                        <h4 className="fw-bold mb-1">{route.di}</h4>
                                        <div className="mb-2 opacity-75 fw-semibold">Đến</div>
                                        <h4 className="fw-bold">{route.den}</h4>
                                    </div>
                                    <div className="mt-4 pt-3 border-top border-light border-opacity-25 d-flex justify-content-between align-items-center">
                                        <span className="fw-bold fs-5">Từ {route.gia}đ</span>
                                        <Badge bg="light" text="dark" className="px-2 py-1">{route.km}</Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Khuyến Mãi Section */}
            <Container className="py-5">
                <h3 className="text-center fw-bold mb-5" style={{ color: '#333' }}>ƯU ĐÃI NỔI BẬT</h3>
                <Row className="g-4">
                    <Col md={6}>
                        <Card className="border-0 shadow-sm overflow-hidden h-100 rounded-4">
                            <div style={{ height: '250px', backgroundImage: 'url("https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2069&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <Card.Body className="p-4">
                                <Badge bg="danger" className="mb-2 px-3 py-2">MỚI</Badge>
                                <h4 className="fw-bold">Giảm 20% cho Khách Hàng Mới</h4>
                                <p className="text-muted fs-5">Nhập mã <strong>CHAO-BAN</strong> để được giảm ngay 20% cho lần đặt vé đầu tiên trên hệ thống Phương Nam Line.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm overflow-hidden h-100 rounded-4">
                            <div style={{ height: '250px', backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <Card.Body className="p-4">
                                <Badge bg="warning" text="dark" className="mb-2 px-3 py-2">HOT</Badge>
                                <h4 className="fw-bold">Trải nghiệm Limousine Sài Gòn - Đà Lạt</h4>
                                <p className="text-muted fs-5">Giảm giá siêu sốc đầu tháng 3. Tận hưởng không gian phòng nằm riêng tư với mức giá chỉ từ 250.000đ.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Info Section */}
            <Container className="py-5 bg-light rounded-4 my-4">
                <h3 className="text-center fw-bold mb-5" style={{ color: '#333' }}>TẠI SAO CHỌN PHƯƠNG NAM LINE?</h3>
                <Row className="text-center g-4">
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '15px' }}>
                            <h4 className="fw-bold text-primary mb-3">100+</h4>
                            <h5 className="fw-bold">Tuyến Xe Mở Rộng</h5>
                            <p className="text-muted">Kết nối hàng chục tỉnh thành trên khắp cả nước, mang đến nhiều sự lựa chọn cho khách hàng.</p>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '15px' }}>
                            <h4 className="fw-bold text-success mb-3">100%</h4>
                            <h5 className="fw-bold">Chắc Chắn Có Ghế</h5>
                            <p className="text-muted">Hệ thống chọn ghế trực tuyến thời gian thực, đảm bảo giữ chỗ chính xác tuyệt đối.</p>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm p-4 bg-white" style={{ borderRadius: '15px' }}>
                            <h4 className="fw-bold text-warning mb-3">24/7</h4>
                            <h5 className="fw-bold">Hỗ Trợ Tận Tâm</h5>
                            <p className="text-muted">Đội ngũ tổng đài viên và nhân viên phòng vé luôn sẵn sàng giải đáp và xử lý sự cố.</p>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* About Us Section */}
            <div className="bg-white py-5 border-top">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6} className="pe-md-5">
                            <h2 className="fw-bold mb-4" style={{ color: '#ef5222' }}>VỀ NHÀ XE PHƯƠNG NAM</h2>
                            <p className="fs-5 text-muted mb-3" style={{ lineHeight: '1.8' }}>
                                Thành lập với sứ mệnh mang đến những chuyến đi an toàn và trọn vẹn nhất, <strong className="text-dark">Phương Nam Line</strong> không ngừng nâng cao chất lượng dịch vụ vận tải hành khách.
                            </p>
                            <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                                Chúng tôi tự hào sở hữu hệ thống xe đa dạng từ <strong className="text-dark">Limousine VIP 22 phòng</strong>, <strong className="text-dark">Giường nằm đôi 34 phòng</strong> cao cấp đến xe ghế ngồi mềm tiện lợi. Cùng với đội ngũ tài xế giàu kinh nghiệm và nhân viên phục vụ tận tâm, Phương Nam cam kết khởi hành đúng giờ, không nhồi nhét khách, đảm bảo mang lại cho bạn trải nghiệm thoải mái như ở chính ngôi nhà của mình.
                            </p>
                            <div className="d-flex gap-4 mt-4">
                                <div className="text-center border p-3 rounded shadow-sm bg-light flex-fill">
                                    <h3 className="fw-bold text-primary mb-1">04+</h3>
                                    <span className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Dòng Xe Mới</span>
                                </div>
                                <div className="text-center border p-3 rounded shadow-sm bg-light flex-fill">
                                    <h3 className="fw-bold text-success mb-1">50+</h3>
                                    <span className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Chuyến/Ngày</span>
                                </div>
                                <div className="text-center border p-3 rounded shadow-sm bg-light flex-fill">
                                    <h3 className="fw-bold text-danger mb-1">1M+</h3>
                                    <span className="text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Khách Hàng</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6} className="mt-5 mt-md-0">
                            <Card className="border-0 p-0 rounded-4 shadow-lg overflow-hidden" style={{ minHeight: '400px' }}>
                                {/* Hình ảnh minh họa dàn xe */}
                                <img src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop" alt="Xe khach Phuong Nam" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '400px' }} />
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default HomePage;