import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('routes');
    
    const [reportData, setReportData] = useState(null);
    const [schedules, setSchedules] = useState([]); 
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [tripForm, setTripForm] = useState({ tuyenXeId: '', xeId: '', thoiGianXuatPhat: '', thoiGianDuKienDen: '', giaVeCoBan: '' });
    
    // SUA DOI 1: Bo tuyenXeId ra khoi State mac dinh
    const [routeForm, setRouteForm] = useState({ tenTuyen: '', diemDi: '', diemDen: '', khoangCach: '' });
    
    // SUA DOI 2: Them mang danh sach cac tinh thanh de lam Dropdown
    const PROVINCES = ["TP.HCM", "Da Lat", "Nha Trang", "Can Tho", "Vung Tau", "Phan Thiet", "Da Nang", "Hue", "Ha Noi"];
const [tickets, setTickets] = useState([]);
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return navigate('/login');
        const user = JSON.parse(userStr);
        if (!user.roles.includes('Admin')) {
            alert("Truy cap bi tu choi!");
            navigate('/');
        } else {
            loadDropdownData();
        }
    }, [navigate]);

    const loadDropdownData = async () => {
        try {
            const resRoutes = await api.get('/Routes');
            if (resRoutes.data.success) setRoutes(resRoutes.data.data);

            const resVehicles = await api.get('/Admin/vehicles');
            if (resVehicles.data.success) setVehicles(resVehicles.data.data);
        } catch (err) {
            console.error("Loi tai du lieu:", err);
        }
    };

    const loadSchedule = async () => {
        try {
            const res = await api.get('/Admin/schedule');
            if (res.data.success) setSchedules(res.data.data);
        } catch (err) {
            console.error("Loi tai lich trinh:", err);
        }
    };

    const loadReport = async () => {
        try {
            const res = await api.get('/Reports/revenue?tuNgay=2026-03-01&denNgay=2026-03-31');
            if (res.data.success) setReportData(res.data.data);
        } catch (err) {
            alert("Loi tai bao cao: " + err.message);
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Admin/add-route', routeForm);
            alert("Thanh cong: " + res.data.message);
            loadDropdownData();
            // SUA DOI 3: Reset form khong co tuyenXeId nua
            setRouteForm({ tenTuyen: '', diemDi: '', diemDen: '', khoangCach: '' });
        } catch (error) {
            alert("Database bao loi:\n" + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteRoute = async (tuyenXeId) => {
        if(!window.confirm('Ban co chac chan muon xoa tuyen xe nay khong?')) return;
        try {
            const res = await api.post('/Admin/delete-route', `"${tuyenXeId}"`, { headers: { 'Content-Type': 'application/json' }});
            alert("Thanh cong: " + res.data.message);
            loadDropdownData();
        } catch (error) {
            alert("Database tu choi xoa:\n" + (error.response?.data?.message || error.message));
        }
    };

    const handleAddTrip = async (e) => {
        e.preventDefault();
        if (!tripForm.tuyenXeId || !tripForm.xeId) {
            alert("Vui long chon tuyen xe va xe!"); return;
        }
        try {
            const res = await api.post('/Admin/add-trip', tripForm);
            alert("Thanh cong: " + res.data.message);
            loadSchedule(); 
        } catch (error) {
            alert("Database bao loi:\n" + (error.response?.data?.message || error.message));
        }
    };
const loadTickets = async () => {
        try {
            const res = await api.get('/Admin/tickets');
            if (res.data.success) setTickets(res.data.data);
        } catch (err) {
            console.error("Loi tai danh sach ve:", err);
        }
    };
    return (
        <Container fluid className="py-4 bg-light" style={{ minHeight: '80vh' }}>
            <Row>
                <Col md={3}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Body>
                            <h5 className="fw-bold mb-4" style={{ color: '#ef5222' }}>TRANG QUAN TRI</h5>
                            <Nav className="flex-column gap-2">
                                <Button variant={activeTab === 'routes' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => {setActiveTab('routes'); loadDropdownData();}}>
                                    Quan Ly Tuyen Xe
                                </Button>
                                <Button variant={activeTab === 'add-trip' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => {setActiveTab('add-trip'); loadSchedule();}}>
                                    Quan Ly Va Len Lich
                                </Button>
                                <Button variant={activeTab === 'report' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => { setActiveTab('report'); loadReport(); }}>
                                    Thong Ke Doanh Thu
                                </Button>
                                <Button variant={activeTab === 'tickets' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => { setActiveTab('tickets'); loadTickets(); }}>
                                    Quan Ly Ve Khach Hang
                                </Button>
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={9}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            
                            {/* TAB QUAN LY TUYEN XE */}
                            {activeTab === 'routes' && (
                                <div>
                                    <h4 className="fw-bold mb-3">Danh Sach Tuyen Xe</h4>
                                    <Table hover bordered className="bg-white mb-5">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Mã Tuyến</th>
                                                <th>Tên Tuyến</th>
                                                <th>Điểm Đi</th>
                                                <th>Điểm Đến</th>
                                                <th>Khoảng Cách</th>
                                                <th>Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {routes.map(r => (
                                                <tr key={r.tuyenXeId} className="align-middle">
                                                    <td className="fw-bold text-secondary">{r.tuyenXeId}</td>
                                                    <td>{r.tenTuyen}</td>
                                                    <td>{r.diemDi}</td>
                                                    <td>{r.diemDen}</td>
                                                    <td>{r.khoangCach} km</td>
                                                    <td>
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteRoute(r.tuyenXeId)}>
                                                            Xoa Tuyen
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <h4 className="fw-bold mb-3 pt-3 border-top">Them Tuyen Xe Moi</h4>
                                    <p className="text-muted">Procedure SP_ThemTuyenXe se chan neu diem di va diem den giong nhau. Ma Tuyen se duoc tu dong tao.</p>
                                    
                                    {/* SUA DOI 4: Form cap nhat moi voi Dropdown va Tu dong dien Ten Tuyen */}
                                    <Form onSubmit={handleAddRoute} className="bg-light p-4 rounded border">
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Diem Di</Form.Label>
                                                    <Form.Select 
                                                        value={routeForm.diemDi} 
                                                        onChange={e => {
                                                            const newDiemDi = e.target.value;
                                                            const newTenTuyen = newDiemDi && routeForm.diemDen ? `${newDiemDi} - ${routeForm.diemDen}` : routeForm.tenTuyen;
                                                            setRouteForm({...routeForm, diemDi: newDiemDi, tenTuyen: newTenTuyen});
                                                        }} 
                                                        required
                                                    >
                                                        <option value="">-- Chon Diem Di --</option>
                                                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Diem Den</Form.Label>
                                                    <Form.Select 
                                                        value={routeForm.diemDen} 
                                                        onChange={e => {
                                                            const newDiemDen = e.target.value;
                                                            const newTenTuyen = routeForm.diemDi && newDiemDen ? `${routeForm.diemDi} - ${newDiemDen}` : routeForm.tenTuyen;
                                                            setRouteForm({...routeForm, diemDen: newDiemDen, tenTuyen: newTenTuyen});
                                                        }} 
                                                        required
                                                    >
                                                        <option value="">-- Chon Diem Den --</option>
                                                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={8} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Ten Tuyen (Tu dong tao)</Form.Label>
                                                    <Form.Control type="text" value={routeForm.tenTuyen} onChange={e => setRouteForm({...routeForm, tenTuyen: e.target.value})} placeholder="VD: Sai Gon - Vung Tau" required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={4} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Khoang Cach (km)</Form.Label>
                                                    <Form.Control type="number" min="1" value={routeForm.khoangCach} onChange={e => setRouteForm({...routeForm, khoangCach: e.target.value})} required />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button type="submit" variant="success" className="fw-bold px-4 shadow">THEM TUYEN XE</Button>
                                    </Form>
                                </div>
                            )}
{/* TAB QUAN LY VE */}
                            {activeTab === 'tickets' && (
                                <div>
                                    <h4 className="fw-bold mb-3">Danh Sach Ve He Thong</h4>
                                    <p className="text-muted">Du lieu duoc lay tu View VW_ChiTietVe_KhachHang cua Oracle.</p>
                                    <Table hover bordered responsive className="bg-white">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Khach Hang</th>
                                                <th>SDT</th>
                                                <th>Ngay Dat</th>
                                                <th>Tuyen Xe</th>
                                                <th>Ghe</th>
                                                <th>Gia Ve</th>
                                                <th>Trang Thai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map((t, idx) => (
                                                <tr key={idx} className="align-middle">
                                                    <td className="fw-bold">{t.hoTen}</td>
                                                    <td>{t.soDienThoai}</td>
                                                    <td>{new Date(t.ngayDat).toLocaleString('vi-VN')}</td>
                                                    <td>
                                                        <div>{t.tenTuyen}</div>
                                                        <small className="text-muted">Khoi hanh: {new Date(t.thoiGianXuatPhat).toLocaleString('vi-VN')}</small>
                                                    </td>
                                                    <td><Badge bg="info" className="fs-6">{t.maGhe}</Badge></td>
                                                    <td className="text-danger fw-bold">{t.giaVeThucTe.toLocaleString('vi-VN')} d</td>
                                                    <td>
                                                        {t.trangThaiVe === 'GiuCho' && <Badge bg="warning" text="dark">Giu Cho</Badge>}
                                                        {t.trangThaiVe === 'DaXuat' && <Badge bg="success">Da Xuat</Badge>}
                                                        {t.trangThaiVe === 'DaHuy' && <Badge bg="secondary">Da Huy</Badge>}
                                                    </td>
                                                </tr>
                                            ))}
                                            {tickets.length === 0 && <tr><td colSpan="7" className="text-center py-4">Chua co du lieu ve.</td></tr>}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                            {/* TAB QUAN LY VA LEN LICH (GIỮ NGUYÊN) */}
                            {activeTab === 'add-trip' && (
                                <div>
                                    <h4 className="fw-bold mb-3">Danh Sach Lich Trinh Xe</h4>
                                    <div className="mb-5 border rounded shadow-sm overflow-hidden">
                                        <Table hover responsive className="mb-0 bg-white">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>ID Chuyen</th>
                                                    <th>Tuyen</th>
                                                    <th>Xe ID</th>
                                                    <th>TG Xuat Phat</th>
                                                    <th>Trang Thai</th>
                                                    <th>Hanh Dong</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedules.map(trip => (
                                                    <tr key={trip.chuyenXeId} className="align-middle">
                                                        <td className="fw-bold text-secondary">{trip.chuyenXeId}</td>
                                                        <td>{trip.tenTuyen}</td>
                                                        <td>{trip.xeId}</td>
                                                        <td>{new Date(trip.thoiGianXuatPhat).toLocaleString('vi-VN')}</td>
                                                        <td>
                                                            {trip.trangThai === 'SapChay' && <Badge bg="primary">Sap Chay</Badge>}
                                                            {trip.trangThai === 'DangChay' && <Badge bg="warning" text="dark">Dang Chay</Badge>}
                                                            {trip.trangThai === 'HoanThanh' && <Badge bg="success">Hoan Thanh</Badge>}
                                                            {trip.trangThai === 'Huy' && <Badge bg="secondary">Da Huy</Badge>}
                                                        </td>
                                                        <td>
                                                            {trip.trangThai === 'SapChay' && (
                                                                <Button variant="outline-primary" size="sm" className="me-2" onClick={async () => {
                                                                    if(!window.confirm('Bat dau chuyen xe nay?')) return;
                                                                    try {
                                                                        const res = await api.post('/Admin/update-status', { chuyenXeId: trip.chuyenXeId, action: 'start' });
                                                                        alert(res.data.message); loadSchedule();
                                                                    } catch(e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
                                                                }}>Bat Dau</Button>
                                                            )}
                                                            {trip.trangThai === 'DangChay' && (
                                                                <Button variant="outline-success" size="sm" className="me-2" onClick={async () => {
                                                                    if(!window.confirm('Xac nhan hoan thanh chuyen xe?')) return;
                                                                    try {
                                                                        const res = await api.post('/Admin/update-status', { chuyenXeId: trip.chuyenXeId, action: 'complete' });
                                                                        alert(res.data.message); loadSchedule();
                                                                    } catch(e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
                                                                }}>Hoan Thanh</Button>
                                                            )}
                                                            {(trip.trangThai === 'SapChay' || trip.trangThai === 'DangChay') && (
                                                                <Button variant="outline-danger" size="sm" onClick={async () => {
                                                                    if(!window.confirm('Huy chuyen xe nay?')) return;
                                                                    try {
                                                                        const res = await api.post('/Admin/update-status', { chuyenXeId: trip.chuyenXeId, action: 'cancel' });
                                                                        alert(res.data.message); loadSchedule();
                                                                    } catch(e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
                                                                }}>Huy Chuyen</Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>

                                    <h4 className="fw-bold mb-3 pt-3 border-top">Len Lich Chuyen Xe Moi</h4>
                                    <p className="text-muted">Database se tu dong chay Trigger kiem tra trung lich.</p>
                                    <Form onSubmit={handleAddTrip} className="bg-light p-4 rounded border">
                                        <Row>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Tuyen Xe</Form.Label>
                                                    <Form.Select value={tripForm.tuyenXeId} onChange={e => setTripForm({...tripForm, tuyenXeId: e.target.value})} required>
                                                        <option value="">-- Chon Tuyen Xe --</option>
                                                        {routes.map(r => (<option key={r.tuyenXeId} value={r.tuyenXeId}>{r.tenTuyen}</option>))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Chon Xe</Form.Label>
                                                    <Form.Select value={tripForm.xeId} onChange={e => setTripForm({...tripForm, xeId: e.target.value})} required>
                                                        <option value="">-- Chon Xe --</option>
                                                        {vehicles.map(v => (<option key={v.xeId} value={v.xeId}>Xe {v.xeId} - Bien so: {v.bienSo} ({v.tenLoai})</option>))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Thoi Gian Xuat Phat</Form.Label>
                                                    <Form.Control type="datetime-local" value={tripForm.thoiGianXuatPhat} onChange={e => setTripForm({...tripForm, thoiGianXuatPhat: e.target.value})} required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6} className="mb-3">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Thoi Gian Du Kien Den</Form.Label>
                                                    <Form.Control type="datetime-local" value={tripForm.thoiGianDuKienDen} onChange={e => setTripForm({...tripForm, thoiGianDuKienDen: e.target.value})} required />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12} className="mb-4">
                                                <Form.Group>
                                                    <Form.Label className="fw-bold">Gia Ve Co Ban (VND)</Form.Label>
                                                    <Form.Control type="number" min="0" value={tripForm.giaVeCoBan} onChange={e => setTripForm({...tripForm, giaVeCoBan: e.target.value})} required />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button type="submit" variant="success" className="fw-bold px-4 shadow">LUU LICH TRINH VAO ORACLE</Button>
                                    </Form>
                                </div>
                            )}

                            {/* TAB BAO CAO DOANH THU (GIỮ NGUYÊN) */}
                            {activeTab === 'report' && reportData && (
                                <div>
                                    <h4 className="fw-bold mb-4">Bao Cao Doanh Thu Thang 03/2026</h4>
                                    <h5 className="text-danger fw-bold mb-4">Tong Doanh Thu He Thong: {reportData.tongDoanhThu.toLocaleString('vi-VN')} VND</h5>
                                    <Table striped bordered hover>
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Tuyen Xe</th>
                                                <th>So Ve Da Xuat</th>
                                                <th>Doanh Thu (VND)</th>
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