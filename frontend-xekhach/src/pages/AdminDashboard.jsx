import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Form, Button, Table, Badge, Modal, Spinner, Tabs, Tab } from 'react-bootstrap';
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

    // --- STATE CHO ĐỔI VÉ (ADMIN) ---
    const [showExchangeModal, setShowExchangeModal] = useState(false);
    const [exchangeTicket, setExchangeTicket] = useState(null);
    const [exchangeDate, setExchangeDate] = useState('');
    const [availableTrips, setAvailableTrips] = useState([]);
    const [selectedNewTrip, setSelectedNewTrip] = useState(null);
    const [newBookedSeats, setNewBookedSeats] = useState([]);
    const [selectedNewSeat, setSelectedNewSeat] = useState('');
    const [loadingTrips, setLoadingTrips] = useState(false);

    // --- STATE CHO AUDIT LOGS ---
    const [auditLogs, setAuditLogs] = useState({ cancelLogs: [], exchangeLogs: [] });

    // --- STATE CHO CUSTOM POPUP (DIALOG) GIỮA MÀN HÌNH ---
    const [dialog, setDialog] = useState({ show: false, type: 'alert', title: '', message: '', inputLabel: '', inputValue: '', onConfirm: null });

    const showAlert = (message, title = 'Thông báo') => setDialog({ show: true, type: 'alert', title, message, onConfirm: null });
    const showConfirm = (message, onConfirm, title = 'Xác nhận') => setDialog({ show: true, type: 'confirm', title, message, onConfirm });
    const showPrompt = (message, inputLabel, defaultValue, onConfirm, title = 'Nhập thông tin') => setDialog({ show: true, type: 'prompt', title, message, inputLabel, inputValue: defaultValue, onConfirm });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return navigate('/login');
        const user = JSON.parse(userStr);
        if (!user.roles.includes('Admin')) {
            showAlert("Truy cập bị từ chối!");
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
            showAlert("Lỗi tải báo cáo: " + err.message);
        }
    };

    const loadAuditLogs = async () => {
        try {
            const res = await api.get('/Admin/audit-logs');
            if (res.data.success) setAuditLogs(res.data.data);
        } catch (err) {
            console.error("Loi tai nhat ky:", err);
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Admin/add-route', routeForm);
            showAlert("Thành công: " + res.data.message);
            loadDropdownData();
            // SUA DOI 3: Reset form khong co tuyenXeId nua
            setRouteForm({ tenTuyen: '', diemDi: '', diemDen: '', khoangCach: '' });
        } catch (error) {
            showAlert("Database báo lỗi:\n" + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteRoute = (tuyenXeId) => {
        showConfirm('Bạn có chắc chắn muốn xóa tuyến xe này không?', async () => {
            try {
                const res = await api.post('/Admin/delete-route', `"${tuyenXeId}"`, { headers: { 'Content-Type': 'application/json' }});
                showAlert("Thành công: " + res.data.message);
                loadDropdownData();
            } catch (error) {
                showAlert("Database từ chối xóa:\n" + (error.response?.data?.message || error.message));
            }
        });
    };

    const handleAddTrip = async (e) => {
        e.preventDefault();
        if (!tripForm.tuyenXeId || !tripForm.xeId) {
            showAlert("Vui lòng chọn tuyến xe và xe!"); return;
        }
        try {
            const res = await api.post('/Admin/add-trip', tripForm);
            showAlert("Thành công: " + res.data.message);
            loadSchedule(); 
        } catch (error) {
            showAlert("Database báo lỗi:\n" + (error.response?.data?.message || error.message));
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

    const handleClearExpired = () => {
        showConfirm("Hệ thống sẽ quét và hủy toàn bộ các vé Giữ Chỗ đã quá hạn 15 phút mà chưa thanh toán. Xác nhận thực hiện?", async () => {
            try {
                const res = await api.post('/Admin/clear-expired-tickets');
                if (res.data.success) {
                    showAlert(res.data.message);
                    loadTickets(); 
                }
            } catch (error) {
                showAlert("Lỗi: " + (error.response?.data?.message || error.message));
            }
        });
    };

    // --- LOGIC HỦY / ĐỔI VÉ CHO ADMIN ---
    const handleCancelTicket = (ticket) => {
        const veId = ticket.veId || ticket.VeId;
        if (!veId) return showAlert("Lỗi: Không tìm thấy Mã Vé! Hãy kiểm tra lại API /Admin/tickets");
        
        showPrompt("Nhập lý do hủy vé (VD: Khách yêu cầu, Sự cố xe...):", "Lý do hủy", "Khách yêu cầu", async (lyDo) => {
            if (!lyDo) return;
            try {
                const res = await api.post('/Admin/cancel-ticket', { veId, lyDoHuy: lyDo });
                if (res.data.success) {
                    showAlert(res.data.message);
                    loadTickets();
                }
            } catch (error) {
                showAlert("Lỗi hủy vé: " + (error.response?.data?.message || JSON.stringify(error.response?.data?.errors) || error.message));
            }
        });
    };

    const handleOpenExchange = (ticket) => {
        setExchangeTicket(ticket);
        setExchangeDate('');
        setAvailableTrips([]);
        setSelectedNewTrip(null);
        setSelectedNewSeat('');
        setShowExchangeModal(true);
    };

    const handleSearchNewTrips = async () => {
        if (!exchangeDate) return showAlert("Vui lòng chọn ngày muốn đổi!");
        setLoadingTrips(true);
        setSelectedNewTrip(null);
        try {
            const parts = exchangeTicket.tenTuyen.split(' - ');
            const diemDi = parts[0]?.trim();
            const diemDen = parts[1]?.trim();

            const res = await api.get('/Trips/search', { params: { diemDi, diemDen, ngay: exchangeDate } });
            if (res.data.success) setAvailableTrips(res.data.data);
        } catch (error) {
            console.error("Lỗi tìm chuyến:", error);
        } finally {
            setLoadingTrips(false);
        }
    };

    const handleSelectNewTrip = async (trip) => {
        setSelectedNewTrip(trip);
        setSelectedNewSeat('');
        try {
            const res = await api.get(`/Trips/${trip.chuyenXeId}/seats`);
            if (res.data.success) setNewBookedSeats(res.data.data);
        } catch (err) {
            console.error("Lỗi lấy ghế:", err);
        }
    };

    const handleConfirmExchange = () => {
        if (!selectedNewSeat) return showAlert("Vui lòng chọn 1 ghế trống!");
        
        showConfirm("Xác nhận đổi vé cho khách sang chuyến và ghế này? Hệ thống sẽ tự tính tiền chênh lệch!", async () => {
            const veCuId = exchangeTicket.veId || exchangeTicket.VeId;
            if (!veCuId) return showAlert("Lỗi: Không tìm thấy Mã Vé Cũ! Hãy kiểm tra lại API /Admin/tickets");

            try {
                const res = await api.post('/Bookings/exchange', {
                    veCuId: veCuId,
                    chuyenXeMoiId: selectedNewTrip.chuyenXeId,
                    maGheMoi: selectedNewSeat
                });
                if (res.data.success) {
                    showAlert(res.data.message);
                    setShowExchangeModal(false);
                    loadTickets();
                }
            } catch (error) {
                showAlert("Lỗi đổi vé:\n" + (error.response?.data?.message || JSON.stringify(error.response?.data?.errors) || error.message));
            }
        });
    };

    const generateSeats = (soLuong) => Array.from({ length: soLuong }, (_, i) => i + 1 < 10 ? `A0${i + 1}` : `A${i + 1}`);

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
                                <Button variant={activeTab === 'audit' ? 'dark' : 'outline-dark'} className="text-start fw-bold" onClick={() => { setActiveTab('audit'); loadAuditLogs(); }}>
                                    Nhat Ky He Thong
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
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <h4 className="fw-bold mb-1">Danh Sach Ve He Thong</h4>
                                            <p className="text-muted mb-0">Du lieu duoc lay tu View VW_ChiTietVe_KhachHang cua Oracle.</p>
                                        </div>
                                        <Button variant="warning" className="fw-bold shadow-sm" onClick={handleClearExpired}>
                                            ⚡ GIẢI PHÓNG GHẾ QUÁ HẠN
                                        </Button>
                                    </div>
                                    <Table hover bordered responsive className="bg-white">
                                        <thead className="bg-light">
                                            <tr>
                                                <th>Mã Vé</th>
                                                <th>Khach Hang</th>
                                                <th>SDT</th>
                                                <th>Ngay Dat</th>
                                                <th>Tuyen Xe</th>
                                                <th>Ghe</th>
                                                <th>Gia Ve</th>
                                                <th>Trang Thai</th>
                                                <th>Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map((t, idx) => (
                                                <tr key={idx} className="align-middle">
                                                    <td className="fw-bold text-secondary">{t.veId || t.VeId || 'N/A'}</td>
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
                                                    <td>
                                                        {t.trangThaiVe !== 'DaHuy' && new Date(t.thoiGianXuatPhat) > new Date() ? (
                                                            <>
                                                                {t.trangThaiVe === 'DaXuat' && (
                                                                    <Button variant="outline-warning" size="sm" className="me-1 mb-1 fw-bold" onClick={() => handleOpenExchange(t)}>Đổi Vé</Button>
                                                                )}
                                                                <Button variant="outline-danger" size="sm" className="mb-1 fw-bold" onClick={() => handleCancelTicket(t)}>Hủy</Button>
                                                            </>
                                                        ) : t.trangThaiVe !== 'DaHuy' ? (
                                                            <span className="text-muted fst-italic" style={{ fontSize: '0.85rem' }}>Đã khởi hành</span>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ))}
                                            {tickets.length === 0 && <tr><td colSpan="9" className="text-center py-4">Chua co du lieu ve.</td></tr>}
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
                                                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => {
                                                                    showConfirm('Bắt đầu chuyến xe này?', async () => {
                                                                        try {
                                                                            const res = await api.post('/Admin/update-status', { chuyenXeId: trip.chuyenXeId, action: 'start' });
                                                                            showAlert(res.data.message); loadSchedule();
                                                                        } catch(e) { showAlert("Lỗi: " + (e.response?.data?.message || e.message)); }
                                                                    });
                                                                }}>Bat Dau</Button>
                                                            )}
                                                            {trip.trangThai === 'DangChay' && (
                                                                <Button variant="outline-success" size="sm" className="me-2" onClick={() => {
                                                                    showConfirm('Xác nhận hoàn thành chuyến xe?', async () => {
                                                                        try {
                                                                            const res = await api.post('/Admin/update-status', { chuyenXeId: trip.chuyenXeId, action: 'complete' });
                                                                            showAlert(res.data.message); loadSchedule();
                                                                        } catch(e) { showAlert("Lỗi: " + (e.response?.data?.message || e.message)); }
                                                                    });
                                                                }}>Hoan Thanh</Button>
                                                            )}
                                                            {(trip.trangThai === 'SapChay' || trip.trangThai === 'DangChay') && (
                                                                <Button variant="outline-danger" size="sm" onClick={() => {
                                                                    showConfirm('Hủy chuyến xe này?', async () => {
                                                                        try {
                                                                            const res = await api.post('/Admin/update-status', { chuyenXeId: trip.chuyenXeId, action: 'cancel' });
                                                                            showAlert(res.data.message); loadSchedule();
                                                                        } catch(e) { showAlert("Lỗi: " + (e.response?.data?.message || e.message)); }
                                                                    });
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

                            {/* TAB NHẬT KÝ HỆ THỐNG (AUDIT LOGS) */}
                            {activeTab === 'audit' && (
                                <div>
                                    <h4 className="fw-bold mb-3">Nhat Ky Hoat Dong (Audit Logs)</h4>
                                    <p className="text-muted">Du lieu duoc ghi nhan tu dong boi he thong Trigger cua Oracle Database.</p>
                                    
                                    <Tabs defaultActiveKey="cancel" className="mb-3">
                                        <Tab eventKey="cancel" title={`Lich Su Huy Ve (${auditLogs.cancelLogs.length})`}>
                                            <Table striped bordered hover className="bg-white">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th>Log ID</th>
                                                        <th>Ma Ve</th>
                                                        <th>Ma Ghe</th>
                                                        <th>Nguoi Thuc Hien</th>
                                                        <th>Thoi Gian Huy</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {auditLogs.cancelLogs.map((log, idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-muted"><small>{log.logId}</small></td>
                                                            <td className="fw-bold text-danger">{log.veId}</td>
                                                            <td>{log.maGhe}</td>
                                                            <td>{log.nguoiHuy}</td>
                                                            <td>{new Date(log.thoiGianHuy).toLocaleString('vi-VN')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Tab>
                                        <Tab eventKey="exchange" title={`Lich Su Doi Ve (${auditLogs.exchangeLogs.length})`}>
                                            <Table striped bordered hover className="bg-white">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th>Ma Doi Ve</th>
                                                        <th>Ve Cu ➔ Ve Moi</th>
                                                        <th>Tien Hoan / Thu Them</th>
                                                        <th>Thoi Gian Thuc Hien</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {auditLogs.exchangeLogs.map((log, idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-muted"><small>{log.maDoiVe}</small></td>
                                                            <td><Badge bg="secondary">{log.veCuId}</Badge> ➔ <Badge bg="success">{log.veMoiId}</Badge></td>
                                                            <td className="fw-bold">{log.tienThuThem > 0 ? <span className="text-danger">Thu: {log.tienThuThem.toLocaleString()} đ</span> : log.tienHoan > 0 ? <span className="text-success">Hoan: {log.tienHoan.toLocaleString()} đ</span> : <span className="text-muted">- Khong doi -</span>}</td>
                                                            <td>{new Date(log.thoiGian).toLocaleString('vi-VN')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Tab>
                                    </Tabs>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* MODAL ĐỔI VÉ DÀNH CHO ADMIN */}
            <Modal show={showExchangeModal} onHide={() => setShowExchangeModal(false)} size="lg" centered>
                <Modal.Header closeButton style={{ backgroundColor: '#ffc107', color: '#000' }}>
                    <Modal.Title className="fw-bold">ĐỔI VÉ XE CHO KHÁCH</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 bg-white">
                    {exchangeTicket && (
                        <>
                            <div className="mb-4 bg-light p-3 rounded border">
                                <h6 className="fw-bold text-secondary mb-2">THÔNG TIN VÉ CŨ:</h6>
                                <div>Mã vé: <strong>{exchangeTicket.veId}</strong> - Khách hàng: <strong>{exchangeTicket.hoTen}</strong></div>
                                <div>Tuyến: <strong>{exchangeTicket.tenTuyen}</strong> - Ghế: <strong>{exchangeTicket.maGhe}</strong></div>
                            </div>

                            <h6 className="fw-bold text-secondary mb-3">CHỌN CHUYẾN XE MỚI (CÙNG TUYẾN):</h6>
                            <Row className="mb-4 align-items-end">
                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold">Ngày khởi hành mới</Form.Label>
                                        <Form.Control type="date" value={exchangeDate} onChange={e => setExchangeDate(e.target.value)} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Button variant="primary" className="w-100 fw-bold" onClick={handleSearchNewTrips}>
                                        TÌM CHUYẾN
                                    </Button>
                                </Col>
                            </Row>

                            {loadingTrips && <div className="text-center py-3"><Spinner animation="border" variant="warning" /></div>}
                            
                            {availableTrips.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-success fw-bold">Tìm thấy {availableTrips.length} chuyến xe:</p>
                                    <div className="d-flex flex-column gap-2">
                                        {availableTrips.map(trip => (
                                            <Card 
                                                key={trip.chuyenXeId} 
                                                className={`border ${selectedNewTrip?.chuyenXeId === trip.chuyenXeId ? 'border-warning bg-warning bg-opacity-10' : ''}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleSelectNewTrip(trip)}
                                            >
                                                <Card.Body className="d-flex justify-content-between align-items-center p-3">
                                                    <div><strong className="text-dark fs-5">{new Date(trip.thoiGianXuatPhat).toLocaleTimeString('vi-VN')}</strong> - {trip.tenLoai}</div>
                                                    <div className="text-end">
                                                        <span className="text-danger fw-bold me-3">{trip.giaVeCoBan.toLocaleString('vi-VN')} đ</span>
                                                        <Badge bg="info">Còn {trip.soGheConTrong} ghế</Badge>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedNewTrip && (
                                <div className="bg-light p-3 rounded border mt-3 text-center">
                                    <h6 className="fw-bold text-secondary mb-3">CHỌN GHẾ MỚI</h6>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {generateSeats(selectedNewTrip.soLuongGhe).map(seat => (
                                            <Button key={seat} variant={newBookedSeats.includes(seat) ? "secondary" : (selectedNewSeat === seat ? "success" : "outline-dark")} disabled={newBookedSeats.includes(seat)} onClick={() => setSelectedNewSeat(seat)} style={{ width: '60px', fontWeight: 'bold' }}>
                                                {seat}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowExchangeModal(false)}>Hủy</Button>
                    <Button variant="warning" className="fw-bold" onClick={handleConfirmExchange} disabled={!selectedNewSeat}>XÁC NHẬN ĐỔI VÉ</Button>
                </Modal.Footer>
            </Modal>

            {/* COMPONENT POPUP THÔNG BÁO DÙNG CHUNG */}
            <Modal show={dialog.show} onHide={() => setDialog({ ...dialog, show: false })} centered backdrop="static">
                <Modal.Header closeButton style={{ backgroundColor: dialog.type === 'alert' ? '#17a2b8' : '#ffc107', color: dialog.type === 'alert' ? '#fff' : '#000' }}>
                    <Modal.Title className="fw-bold">{dialog.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <p className="fs-5 mb-0">{dialog.message}</p>
                    {dialog.type === 'prompt' && (
                        <Form.Group className="mt-4">
                            <Form.Label className="fw-bold text-secondary">{dialog.inputLabel}</Form.Label>
                            <Form.Control autoFocus type="text" value={dialog.inputValue} onChange={e => setDialog({ ...dialog, inputValue: e.target.value })} />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {dialog.type !== 'alert' && <Button variant="secondary" onClick={() => setDialog({ ...dialog, show: false })}>Hủy Bỏ</Button>}
                    <Button variant={dialog.type === 'alert' ? 'info' : 'primary'} className="fw-bold px-4" onClick={() => {
                        if (dialog.onConfirm) { dialog.type === 'prompt' ? dialog.onConfirm(dialog.inputValue) : dialog.onConfirm(); }
                        setDialog({ ...dialog, show: false });
                    }}>Xác Nhận</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminDashboard;