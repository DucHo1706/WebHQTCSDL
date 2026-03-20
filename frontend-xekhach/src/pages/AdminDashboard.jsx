import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('add-trip');
    
    const [reportData, setReportData] = useState(null);
    const [schedules, setSchedules] = useState([]); // Chứa danh sách lịch trình
    const [tripForm, setTripForm] = useState({ tuyenXeId: '1', xeId: '1', thoiGianXuatPhat: '', thoiGianDuKienDen: '', giaVeCoBan: '' });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return navigate('/login');
        const user = JSON.parse(userStr);
        if (!user.roles.includes('Admin')) {
            alert("Truy cập bị từ chối!");
            navigate('/');
        } else {
            // Load lịch trình ngay khi vào trang
            loadSchedule();
        }
    }, [navigate]);

    // Lấy dữ liệu từ VIEW Oracle
    const loadSchedule = async () => {
        try {
            const res = await api.get('/Admin/schedule');
            if (res.data.success) setSchedules(res.data.data);
        } catch (err) {
            console.error("Lỗi tải lịch trình:", err);
        }
    };

    const loadReport = async () => {
        try {
            const res = await api.get('/Reports/revenue?tuNgay=2026-03-01&denNgay=2026-03-31');
            if (res.data.success) setReportData(res.data.data);
        } catch (err) {
            alert("Lỗi tải báo cáo: " + err.message);
        }
    };

    const handleAddTrip = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Admin/add-trip', tripForm);
            alert("✅ " + res.data.message);
            loadSchedule(); // Refresh lại timeline sau khi thêm thành công
        } catch (error) {
            alert("❌ Database báo lỗi:\n" + (error.response?.data?.message || error.message));
        }
    };

    // Hàm tính toán vị trí và độ dài của Timeline bar (Dựa trên 24h)
    const calculateTimelineStyle = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        // Tính giờ xuất phát theo hệ thập phân (VD: 6h30 = 6.5)
        const startHour = startDate.getHours() + (startDate.getMinutes() / 60);
        let endHour = endDate.getHours() + (endDate.getMinutes() / 60);
        
        // Nếu qua ngày hôm sau thì fix tạm để thanh bar full đến 24h
        if (endDate.getDate() !== startDate.getDate()) endHour = 24; 

        const leftPercent = (startHour / 24) * 100;
        const widthPercent = ((endHour - startHour) / 24) * 100;

        return {
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            backgroundColor: '#ef5222',
            position: 'absolute',
            height: '100%',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        };
    };

    return (
        <Container fluid className="py-4 bg-light" style={{ minHeight: '80vh' }}>
            <Row>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4" style={{ color: '#ef5222' }}>🛠️ TRANG QUẢN TRỊ</h5>
                            <Nav className="flex-column gap-2">
                                <Button variant={activeTab === 'add-trip' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => {setActiveTab('add-trip'); loadSchedule();}}>
                                    🗓️ Quản Lý & Lên Lịch
                                </Button>
                                <Button variant={activeTab === 'report' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => { setActiveTab('report'); loadReport(); }}>
                                    📊 Thống Kê Doanh Thu
                                </Button>
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            
                            {activeTab === 'add-trip' && (
                                <div>
                                    {/* PHẦN 1: BẢNG TIMELINE TRỰC QUAN */}
                                    <h4 className="fw-bold mb-3">Biểu Đồ Lịch Trình Xe (Timeline)</h4>
                                    <div className="mb-5 p-3 bg-white border rounded shadow-sm">
                                        <div className="d-flex border-bottom pb-2 mb-2 text-muted fw-bold" style={{ fontSize: '12px' }}>
                                            <div style={{ width: '100px' }}>Xe ID</div>
                                            <div className="flex-grow-1 position-relative d-flex justify-content-between">
                                                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
                                            </div>
                                        </div>
                                        
                                        {/* Gom nhóm lịch trình theo XeId */}
                                        {[...new Set(schedules.map(s => s.xeId))].map(xeId => {
                                            const tripsOfCar = schedules.filter(s => s.xeId === xeId);
                                            return (
                                                <div key={xeId} className="d-flex align-items-center mb-2">
                                                    <div style={{ width: '100px' }} className="fw-bold text-primary">Xe Số {xeId}</div>
                                                    <div className="flex-grow-1 position-relative bg-light rounded" style={{ height: '30px', border: '1px dashed #ccc' }}>
                                                        {tripsOfCar.map(trip => (
                                                            <div 
                                                                key={trip.chuyenXeId} 
                                                                style={calculateTimelineStyle(trip.thoiGianXuatPhat, trip.thoiGianDuKienDen)}
                                                                title={`${trip.tenTuyen} (${new Date(trip.thoiGianXuatPhat).toLocaleTimeString()} - ${new Date(trip.thoiGianDuKienDen).toLocaleTimeString()})`}
                                                            >
                                                                {trip.tenTuyen}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="mt-3 text-end text-muted fst-italic" style={{ fontSize: '12px' }}>
                                            * Timeline hiển thị theo khung giờ trong ngày (24h). Di chuột vào dải màu cam để xem chi tiết giờ chạy.
                                        </div>
                                    </div>

                                    {/* PHẦN 2: FORM THÊM CHUYẾN XE */}
                                    <h4 className="fw-bold mb-3 pt-3 border-top">➕ Lên Lịch Chuyến Xe Mới</h4>
                                    <p className="text-muted">Database sẽ tự động chạy Trigger <code>TRG_KiemTra_LichTrinhXe</code> để chặn nếu bạn xếp lịch đè lên dải màu cam ở trên.</p>
                                    <Form onSubmit={handleAddTrip} className="bg-light p-4 rounded border">
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Tuyến Xe ID</Form.Label>
                                                    <Form.Control type="text" value={tripForm.tuyenXeId} onChange={e => setTripForm({...tripForm, tuyenXeId: e.target.value})} placeholder="Nhập ID (VD: 1, 2...)" required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Xe ID</Form.Label>
                                                    <Form.Control type="text" value={tripForm.xeId} onChange={e => setTripForm({...tripForm, xeId: e.target.value})} placeholder="Nhập ID (VD: 1, 2...)" required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Thời Gian Xuất Phát</Form.Label>
                                                    <Form.Control type="datetime-local" value={tripForm.thoiGianXuatPhat} onChange={e => setTripForm({...tripForm, thoiGianXuatPhat: e.target.value})} required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Thời Gian Dự Kiến Đến</Form.Label>
                                                    <Form.Control type="datetime-local" value={tripForm.thoiGianDuKienDen} onChange={e => setTripForm({...tripForm, thoiGianDuKienDen: e.target.value})} required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Giá Vé Cơ Bản (VNĐ)</Form.Label>
                                                    <Form.Control type="number" value={tripForm.giaVeCoBan} onChange={e => setTripForm({...tripForm, giaVeCoBan: e.target.value})} placeholder="Nhập số tiền..." required />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button type="submit" variant="success" className="fw-bold px-4 shadow">LƯU LỊCH TRÌNH VÀO ORACLE</Button>
                                    </Form>
                                </div>
                            )}

                            {/* TAB: BÁO CÁO DOANH THU (Giữ nguyên như cũ) */}
                            {activeTab === 'report' && reportData && (
                                <div>
                                    <h4 className="fw-bold mb-4">Báo Cáo Doanh Thu Tháng 03/2026</h4>
                                    <h5 className="text-danger fw-bold mb-4">Tổng Doanh Thu Hệ Thống: {reportData.tongDoanhThu.toLocaleString('vi-VN')} VNĐ</h5>
                                    <Table striped bordered hover>
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Tuyến Xe</th>
                                                <th>Số Vé Đã Xuất</th>
                                                <th>Doanh Thu (VNĐ)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.chiTietTuyen.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{item.tenTuyen}</td>
                                                    <td>{item.soVe}</td>
                                                    <td className="text-success fw-bold">{item.doanhThu.toLocaleString('vi-VN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <p className="text-muted fst-italic">* Dữ liệu được lấy từ SP_ThongKe_DoanhThu_Ngay kết hợp Cursor.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;