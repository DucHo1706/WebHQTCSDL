import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Badge } from 'react-bootstrap';
import api from '../services/api';

const HomePage = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [uniqueDiemDi, setUniqueDiemDi] = useState([]);
    const [uniqueDiemDen, setUniqueDiemDen] = useState([]);
    const [searchForm, setSearchForm] = useState({ diemDi: '', diemDen: '', ngayDi: '' });
const [featuredTrips, setFeaturedTrips] = useState([]);
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await api.get('/Routes'); 
                if (response.data.success) {
                    const data = response.data.data;
                    setRoutes(data);
                    setUniqueDiemDi([...new Set(data.map(item => item.diemDi))]);
                    setUniqueDiemDen([...new Set(data.map(item => item.diemDen))]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tuyến xe:", error);
            }
        };
        const fetchFeaturedTrips = async () => {
            try {
                const response = await api.get('/Trips/featured');
                if (response.data.success) {
                    setFeaturedTrips(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy chuyến xe nổi bật:", error);
            }
        };
        fetchRoutes();
        fetchFeaturedTrips();
    }, []);

    const handleChange = (e) => {
        setSearchForm({ ...searchForm, [e.target.name]: e.target.value });
    };

   const handleSearch = (e) => {
        e.preventDefault();
        if (!searchForm.diemDi || !searchForm.diemDen || !searchForm.ngayDi) {
            alert("Vui lòng chọn đầy đủ Điểm đi, Điểm đến và Ngày đi!");
            return;
        }

        // Chuyển trang và truyền dữ liệu lên thanh URL (VD: /trips?diemDi=TP.HCM&diemDen=Đà Lạt&ngayDi=2026-03-20)
        navigate(`/trips?diemDi=${searchForm.diemDi}&diemDen=${searchForm.diemDen}&ngayDi=${searchForm.ngayDi}`);
    };
    

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* 1. BANNER & FORM TÌM KIẾM (CŨ) */}
            <div style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop")',
                backgroundSize: 'cover', backgroundPosition: 'center', height: '450px', position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
            </div>

            <Container style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
                <Card className="shadow-lg border-0 mb-5" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-4">
                        <h4 className="text-center mb-4" style={{ color: '#ef5222', fontWeight: 'bold' }}>
                            🚌 TÌM CHUYẾN XE PHƯƠNG NAM
                        </h4>
                        <Form onSubmit={handleSearch}>
                            <Row>
                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Điểm Đi</Form.Label>
                                        <Form.Select name="diemDi" value={searchForm.diemDi} onChange={handleChange}>
                                            <option value="">-- Chọn điểm đi --</option>
                                            {uniqueDiemDi.map((diem, idx) => <option key={idx} value={diem}>{diem}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Điểm Đến</Form.Label>
                                        <Form.Select name="diemDen" value={searchForm.diemDen} onChange={handleChange}>
                                            <option value="">-- Chọn điểm đến --</option>
                                            {uniqueDiemDen.map((diem, idx) => <option key={idx} value={diem}>{diem}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Ngày Đi</Form.Label>
                                        <Form.Control type="date" name="ngayDi" value={searchForm.ngayDi} onChange={handleChange} min={new Date().toISOString().split("T")[0]} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="text-center mt-3">
                                <Button type="submit" size="lg" style={{ backgroundColor: '#ef5222', borderColor: '#ef5222', borderRadius: '30px', padding: '10px 40px' }} className="fw-bold shadow">
                                    🔍 TÌM CHUYẾN XE
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>

                {/* 2. TUYẾN XE PHỔ BIẾN */}
                <h3 className="fw-bold mb-4 mt-5"> Chuyến Xe Sắp Khởi Hành</h3>
                <Row>
                    {featuredTrips.length === 0 ? (
                        <p className="text-muted">Đang tải dữ liệu chuyến xe...</p>
                    ) : (
                        featuredTrips.map((trip, index) => {
                            // Mảng ảnh minh họa cho sinh động
                            const images = [
                                "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2071&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2111&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1576487248805-fc473a246813?q=80&w=2008&auto=format&fit=crop"
                            ];
                            return (
                                <Col md={4} className="mb-4" key={trip.chuyenXeId}>
                                    <Card className="border-0 shadow-sm h-100 banner-card">
                                        <Card.Img variant="top" src={images[index % 3]} height="200" style={{ objectFit: 'cover' }} />
                                        <Card.Body>
                                            <Card.Title className="fw-bold">{trip.tenTuyen}</Card.Title>
                                            <Card.Text className="text-muted mb-2">
                                                Khởi hành: <strong className="text-dark">{new Date(trip.thoiGianXuatPhat).toLocaleString('vi-VN')}</strong><br/>
                                                Dòng xe: {trip.tenLoai}
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center mt-3">
                                                <h5 style={{ color: '#ef5222', margin: 0 }}>{trip.giaVeCoBan.toLocaleString('vi-VN')}đ</h5>
                                              <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    className="fw-bold rounded-pill"
                                                    onClick={() => {
                                                        // Tách lấy phần YYYY-MM-DD từ thời gian xuất phát
                                                        const ngayDiFormat = trip.thoiGianXuatPhat.split('T')[0];
                                                        
                                                        // Chuyển sang trang kết quả giống như thao tác submit form
                                                        navigate(`/trips?diemDi=${trip.diemDi}&diemDen=${trip.diemDen}&ngayDi=${ngayDiFormat}`);
                                                    }} >
                                                    TÌM VÉ NGAY
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
                {/* 3. KHUYẾN MÃI & SỰ KIỆN */}
                <h3 className="fw-bold mb-4 mt-5">🎁 Chương Trình Khuyến Mãi</h3>
                <Row>
                    <Col md={6} className="mb-4">
                        <Card className="border-0 shadow-sm bg-primary text-white p-3 h-100" style={{ backgroundImage: 'linear-gradient(45deg, #ef5222, #f58220)' }}>
                            <Card.Body>
                                <h4>🎉 Chào Hè Sôi Động - Giảm 20%</h4>
                                <p>Nhập mã <strong>HE2026</strong> để được giảm ngay 20% cho các tuyến đi biển (Nha Trang, Vũng Tàu).</p>
                                <Button variant="light" className="fw-bold text-danger">Xem Chi Tiết</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-4">
                        <Card className="border-0 shadow-sm text-white p-3 h-100" style={{ backgroundImage: 'linear-gradient(45deg, #0052cc, #007bff)' }}>
                            <Card.Body>
                                <h4>🎓 Ưu Đãi Học Sinh Sinh Viên</h4>
                                <p>Đăng ký tài khoản bằng thẻ HSSV để luôn được hưởng mức giá vé ưu đãi rẻ hơn 15% trọn đời.</p>
                                <Button variant="light" className="fw-bold text-primary">Đăng Ký Ngay</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* 4. CAM KẾT CHẤT LƯỢNG */}
                <h3 className="fw-bold mb-4 mt-5 text-center">🏆 Cam Kết Chất Lượng Với Khách Hàng</h3>
                <Row className="text-center mb-5">
                    <Col md={4}>
                        <div className="p-4 bg-white rounded shadow-sm h-100">
                            <h1 className="mb-3">🕒</h1>
                            <h5 className="fw-bold">Đúng Giờ, Đúng Tuyến</h5>
                            <p className="text-muted">Cam kết xuất bến đúng lịch trình, không cao su, không để khách hàng phải chờ đợi.</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-4 bg-white rounded shadow-sm h-100">
                            <h1 className="mb-3">🛑</h1>
                            <h5 className="fw-bold">Không Bắt Khách Dọc Đường</h5>
                            <p className="text-muted">Xe chạy thẳng một mạch, tuyệt đối không chèn ép khách, đảm bảo mỗi người 1 ghế.</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-4 bg-white rounded shadow-sm h-100">
                            <h1 className="mb-3">🛋️</h1>
                            <h5 className="fw-bold">Nội Thất Cao Cấp</h5>
                            <p className="text-muted">100% dòng xe đời mới, giường nằm massage, wifi tốc độ cao và chăn gối sạch sẽ.</p>
                        </div>
                    </Col>
                </Row>

            </Container>
        </div>
    );
};

export default HomePage;