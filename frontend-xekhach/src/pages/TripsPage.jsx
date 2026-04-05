import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import api from '../services/api';

const TripsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const diemDi = searchParams.get('diemDi');
    const diemDen = searchParams.get('diemDen');
    const ngayDi = searchParams.get('ngayDi') || '';

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState('');

    // --- STATE CHO POPUP THÔNG BÁO ---
    const [dialog, setDialog] = useState({ show: false, title: '', message: '', isSuccess: false });
    const showAlert = (message, isSuccess = false, title = 'Thông báo') => setDialog({ show: true, title, message, isSuccess });
    
    const handleCloseDialog = () => {
        setDialog({ ...dialog, show: false });
        if (dialog.isSuccess) {
            window.location.reload(); // Reset lại sơ đồ ghế sau khi báo thành công
        }
    };

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const queryParams = { diemDi: diemDi?.trim(), diemDen: diemDen?.trim() };
                // Nếu có ngày đi thì mới nhét vào query parameters
                if (ngayDi) queryParams.ngay = ngayDi;

                // Gọi API C# lấy danh sách chuyến xe
                const response = await api.get('/Trips/search', {
                    params: queryParams
                });
                if (response.data.success) {
                    setTrips(response.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tìm chuyến xe:", error);
            } finally {
                setLoading(false);
            }
        };

        if (diemDi && diemDen) {
            fetchTrips();
        } else {
            setLoading(false);
        }
    }, [diemDi, diemDen, ngayDi]);

    const handleOpenSeatMap = async (trip) => {
        setSelectedTrip(trip);
        setSelectedSeat('');
        setShowModal(true);
        try {
            // Gọi API lấy ghế đã đặt
            const res = await api.get(`/Trips/${trip.chuyenXeId}/seats`);
            if (res.data.success) {
                setBookedSeats(res.data.data); // vd: ["A01", "A02"]
            }
        } catch (err) {
            console.error("Lỗi lấy ghế:", err);
        }
    };

    const handleBookTicket = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            showAlert("Vui lòng đăng nhập để đặt vé!", false);
            return;
        }
        if (!selectedSeat) {
            showAlert("Vui lòng chọn 1 ghế trống!", false);
            return;
        }

        const user = JSON.parse(userStr);
        try {
            const res = await api.post('/Bookings', {
                userId: user.userId,
                chuyenXeId: selectedTrip.chuyenXeId,
                maGhe: selectedSeat
            });
            if (res.data.success) {
                setShowModal(false);
                showAlert(res.data.message, true);
            }
        } catch (err) {
            showAlert("Lỗi đặt vé: " + (err.response?.data?.message || err.message), false);
        }
    };

    const generateSeats = (soLuong) => {
        return Array.from({ length: soLuong }, (_, i) => {
            const num = i + 1;
            return num < 10 ? `A0${num}` : `A${num}`;
        });
    };

    return (
        <Container className="py-5">
            <h3 className="fw-bold mb-4" style={{ color: '#ef5222' }}>
                 KẾT QUẢ TÌM KIẾM: {diemDi} ➔ {diemDen}
            </h3>
            <p className="text-muted fw-bold mb-4">
                {ngayDi ? `Ngày khởi hành: ${new Date(ngayDi).toLocaleDateString('vi-VN')}` : 'Tất cả chuyến xe sắp tới'}
            </p>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" style={{ color: '#ef5222' }} />
                    <p className="mt-3">Đang tìm chuyến xe phù hợp...</p>
                </div>
            ) : trips.length === 0 ? (
                <Card className="text-center p-5 border-0 shadow-sm">
                    <h5 className="text-muted">Rất tiếc, không có chuyến xe nào phù hợp với tìm kiếm của bạn.</h5>
                </Card>
            ) : (
                trips.map((trip) => (
                    <Card key={trip.chuyenXeId} className="mb-4 shadow-sm border-0" style={{ borderRadius: '15px' }}>
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                {/* Cột 1: Thời gian */}
                                <Col md={3} className="text-center border-end">
                                    <h3 className="fw-bold text-dark mb-0">
                                        {new Date(trip.thoiGianXuatPhat).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </h3>
                                    <Badge bg="success" className="mt-2 p-2">Sắp Chạy</Badge>
                                </Col>

                                {/* Cột 2: Thông tin xe */}
                                <Col md={5} className="ps-4">
                                    <h5 className="fw-bold">{trip.tenLoai}</h5>
                                    <p className="text-muted mb-1">Tuyến: {trip.tenTuyen}</p>
                                    <p className="mb-0">
                                        <span className="fw-bold text-success">Còn {trip.soGheConTrong} chỗ trống</span> 
                                        <span className="text-muted"> / {trip.soLuongGhe} chỗ</span>
                                    </p>
                                </Col>

                                {/* Cột 3: Giá và Nút Đặt */}
                                <Col md={4} className="text-end">
                                    <h4 className="fw-bold mb-3" style={{ color: '#ef5222' }}>
                                        {trip.giaVeCoBan.toLocaleString('vi-VN')} đ
                                    </h4>
                                    <Button 
                                        variant="warning" 
                                        className="fw-bold px-4 py-2 rounded-pill shadow-sm"
                                        style={{ backgroundColor: '#f58220', color: '#fff', border: 'none' }}
                                        onClick={() => handleOpenSeatMap(trip)} 
                                    >
                                        CHỌN GHẾ
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))
            )}

            {/* BẢNG MODAL CHỌN GHẾ CHÈN Ở ĐÂY */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#ef5222' }}>
                        Chọn Ghế - Chuyến {selectedTrip?.tenTuyen}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4">
                    <div className="mb-4">
                        <Badge bg="secondary" className="me-2 p-2">Ghế đã đặt</Badge>
                        <Badge bg="light" text="dark" className="border me-2 p-2">Ghế trống</Badge>
                        <Badge bg="success" className="p-2">Ghế đang chọn</Badge>
                    </div>
                    
                    <div className="d-flex flex-wrap gap-3 justify-content-center bg-light p-4 rounded shadow-sm">
                        {selectedTrip && generateSeats(selectedTrip.soLuongGhe).map(seat => {
                            const isBooked = bookedSeats.includes(seat);
                            const isSelected = selectedSeat === seat;
                            return (
                                <Button
                                    key={seat}
                                    variant={isBooked ? "secondary" : (isSelected ? "success" : "light")}
                                    className={isBooked ? "" : "border"}
                                    disabled={isBooked}
                                    onClick={() => setSelectedSeat(seat)}
                                    style={{ width: '70px', height: '50px', fontWeight: 'bold' }}
                                >
                                    {seat}
                                </Button>
                            );
                        })}
                    </div>
                    <h5 className="mt-4">
                        Ghế đã chọn: <strong className="text-success">{selectedSeat || 'Chưa chọn'}</strong>
                    </h5>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy bỏ</Button>
                    <Button style={{ backgroundColor: '#ef5222', border: 'none' }} onClick={handleBookTicket}>
                        XÁC NHẬN ĐẶT VÉ
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* POPUP THÔNG BÁO KẾT QUẢ */}
            <Modal show={dialog.show} onHide={handleCloseDialog} centered backdrop="static">
                <Modal.Header closeButton style={{ backgroundColor: dialog.isSuccess ? '#198754' : '#ef5222', color: 'white' }}>
                    <Modal.Title className="fw-bold">{dialog.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center">
                    <h5 className="mb-0 lh-base">{dialog.message}</h5>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                    <Button variant={dialog.isSuccess ? "success" : "primary"} className="px-4 fw-bold" onClick={handleCloseDialog}>ĐÃ HIỂU</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default TripsPage;