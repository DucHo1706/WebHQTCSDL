import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Row, Col, Tabs, Tab, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    
    // --- STATE CHO POPUP THÔNG BÁO ---
    const [dialog, setDialog] = useState({ show: false, type: 'alert', title: '', message: '', onConfirm: null, isSuccess: false });
    const showAlert = (message, isSuccess = false, title = 'Thông báo') => setDialog({ show: true, type: 'alert', title, message, onConfirm: null, isSuccess });
    const showConfirm = (message, onConfirm, title = 'Xác nhận') => setDialog({ show: true, type: 'confirm', title, message, onConfirm, isSuccess: false });

    useEffect(() => {
        const fetchHistory = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            setCurrentUser(user); 
            
            try {
                const res = await api.get(`/Bookings/history/${user.userId}`);
                if (res.data.success) {
                    setHistory(res.data.data);
                }
            } catch (error) {
                console.error("Loi tai lich su:", error);
            }
        };
        fetchHistory();
    }, [navigate]);

    const handlePayOrder = (donHangId) => {
        showConfirm("Xác nhận thanh toán cho đơn hàng này?", async () => {
            try {
                const res = await api.post('/Bookings/pay', { donHangId });
                if (res.data.success) {
                    showAlert("Thanh toán thành công! Vé của bạn đã được xuất.", true);
                }
            } catch (error) {
                showAlert("Lỗi thanh toán:\n" + (error.response?.data?.message || error.message));
            }
        });
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setShowTicketModal(true);
    };

    // Phan loai ve vao cac mang rieng biet de hien thi tren cac Tab
    const pendingTickets = history.filter(t => t.trangThaiVe === 'GiuCho');
    const successTickets = history.filter(t => t.trangThaiVe === 'DaXuat');
    const canceledTickets = history.filter(t => t.trangThaiVe === 'DaHuy');

    // Ham ve Bảng chung de tranh lap lai code 3 lan
    const renderTicketTable = (ticketList) => (
        <Table responsive hover className="mb-0 bg-white">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                    <th>Ma Ve</th>
                    <th>Tuyen Xe</th>
                    <th>Ngay Di</th>
                    <th>Ghe</th>
                    <th>Gia Ve</th>
                    <th>Trang Thai</th>
                    <th>Hanh Dong</th>
                </tr>
            </thead>
            <tbody>
                {ticketList.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4 text-muted">Khong co ve nao trong muc nay.</td></tr>
                ) : (
                    ticketList.map((item, idx) => (
                        <tr key={idx} className="align-middle">
                            <td className="fw-bold text-secondary">{item.veId}</td>
                            <td className="fw-bold">{item.tenTuyen}</td>
                            <td>{new Date(item.ngayDi).toLocaleString('vi-VN')}</td>
                            <td><Badge bg="info" className="fs-6">{item.maGhe}</Badge></td>
                            <td className="text-danger fw-bold">{item.giaVe.toLocaleString('vi-VN')} VND</td>
                            <td>
                                {item.trangThaiVe === 'GiuCho' && <Badge bg="warning" text="dark">Giu Cho</Badge>}
                                {item.trangThaiVe === 'DaXuat' && <Badge bg="success">Da Xuat</Badge>}
                                {item.trangThaiVe === 'DaHuy' && <Badge bg="secondary">Da Huy</Badge>}
                            </td>
                            <td>
                                <Button variant="outline-primary" size="sm" className="me-2 fw-bold" onClick={() => handleViewTicket(item)}>
                                    Chi Tiet
                                </Button>

                                {item.trangThaiVe === 'GiuCho' && (
                                    <Button variant="success" size="sm" className="me-2 fw-bold" onClick={() => handlePayOrder(item.donHangId)}>
                                        Thanh Toan
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </Table>
    );

    return (
        <Container className="py-5" style={{ minHeight: '70vh' }}>
            <h3 className="fw-bold mb-4" style={{ color: '#ef5222' }}>LICH SU DAT VE CUA TOI</h3>
            
            <Alert variant="info" className="fw-bold shadow-sm mb-4" style={{ borderLeft: '5px solid #0dcaf0' }}>
                💡 Để đảm bảo quyền lợi, tính năng Đổi/Hủy vé trực tuyến đã được khóa. Quý khách có nhu cầu thay đổi lịch trình vui lòng liên hệ Hotline <strong className="text-danger">1900 1234</strong> hoặc đến trực tiếp quầy vé để được nhân viên hỗ trợ.
            </Alert>

            {/* Su dung Tabs de chia loai ve */}
            <Card className="shadow-sm border-0 rounded-3 p-3 bg-light">
                <Tabs defaultActiveKey="success" className="mb-3">
                    <Tab eventKey="success" title={`Ve Da Xuat (${successTickets.length})`}>
                        <div className="border rounded overflow-hidden shadow-sm">
                            {renderTicketTable(successTickets)}
                        </div>
                    </Tab>
                    <Tab eventKey="pending" title={`Cho Thanh Toan (${pendingTickets.length})`}>
                        <div className="border rounded overflow-hidden shadow-sm">
                            {renderTicketTable(pendingTickets)}
                        </div>
                    </Tab>
                    <Tab eventKey="canceled" title={`Ve Da Huy (${canceledTickets.length})`}>
                        <div className="border rounded overflow-hidden shadow-sm">
                            {renderTicketTable(canceledTickets)}
                        </div>
                    </Tab>
                </Tabs>
            </Card>

            {/* MODAL HIEN THI VE DIEN TU */}
            <Modal show={showTicketModal} onHide={() => setShowTicketModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#ef5222', color: 'white' }}>
                    <Modal.Title className="fw-bold">THONG TIN VE DIEN TU</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedTicket && (
                        <div style={{ border: '2px dashed #ccc', borderRadius: '10px', padding: '20px', backgroundColor: '#fdfdfd' }}>
                            <div className="text-center border-bottom pb-3 mb-3">
                                <h4 className="fw-bold" style={{ color: '#ef5222' }}>PHUONG NAM LINE</h4>
                                <div className="text-muted">Ma ve: <strong className="text-dark">{selectedTicket.veId}</strong></div>
                            </div>
                            
                            <Row className="mb-3">
                                <Col xs={5} className="text-muted fw-bold">Khach Hang:</Col>
                                <Col xs={7} className="fw-bold text-end">{currentUser?.hoTen}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col xs={5} className="text-muted fw-bold">So Dien Thoai:</Col>
                                <Col xs={7} className="fw-bold text-end">{currentUser?.soDienThoai}</Col>
                            </Row>
                            <Row className="mb-3 bg-light p-2 rounded">
                                <Col xs={5} className="text-muted fw-bold">Tuyen Xe:</Col>
                                <Col xs={7} className="fw-bold text-end text-primary">{selectedTicket.tenTuyen}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col xs={5} className="text-muted fw-bold">Thoi Gian Di:</Col>
                                <Col xs={7} className="fw-bold text-end">{new Date(selectedTicket.ngayDi).toLocaleString('vi-VN')}</Col>
                            </Row>
                            <Row className="mb-3">
                                <Col xs={5} className="text-muted fw-bold">Ma Ghe:</Col>
                                <Col xs={7} className="fw-bold text-end"><Badge bg="info" className="fs-6">{selectedTicket.maGhe}</Badge></Col>
                            </Row>
                            <Row className="mb-3 border-top pt-3">
                                <Col xs={5} className="text-muted fw-bold">Tong Tien:</Col>
                                <Col xs={7} className="fw-bold text-end text-danger fs-5">{selectedTicket.giaVe.toLocaleString('vi-VN')} VND</Col>
                            </Row>
                            <Row>
                                <Col xs={5} className="text-muted fw-bold">Trang Thai:</Col>
                                <Col xs={7} className="fw-bold text-end">
                                    {selectedTicket.trangThaiVe === 'GiuCho' && <span className="text-warning">Chua Thanh Toan (Giu Cho)</span>}
                                    {selectedTicket.trangThaiVe === 'DaXuat' && <span className="text-success">Da Thanh Toan (Da Xuat Ve)</span>}
                                    {selectedTicket.trangThaiVe === 'DaHuy' && <span className="text-secondary">Da Huy</span>}
                                </Col>
                            </Row>

                            {selectedTicket.trangThaiVe === 'DaXuat' && (
                                <div className="text-center mt-4 pt-3 border-top">
                                    <small className="text-muted fst-italic">Vui long dua ma ve nay cho phu xe khi len xe.</small>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTicketModal(false)}>Dong</Button>
                    {selectedTicket?.trangThaiVe === 'DaXuat' && (
                        <Button variant="primary" onClick={() => window.print()}>In Ve</Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* COMPONENT POPUP THÔNG BÁO */}
            <Modal show={dialog.show} onHide={() => { setDialog({ ...dialog, show: false }); if (dialog.isSuccess) window.location.reload(); }} centered backdrop="static">
                <Modal.Header closeButton style={{ backgroundColor: dialog.type === 'alert' ? (dialog.isSuccess ? '#198754' : '#17a2b8') : '#ffc107', color: dialog.type === 'alert' ? '#fff' : '#000' }}>
                    <Modal.Title className="fw-bold">{dialog.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-center">
                    <p className="fs-5 mb-0 lh-base">{dialog.message}</p>
                </Modal.Body>
                <Modal.Footer className="justify-content-center">
                    {dialog.type === 'confirm' && <Button variant="secondary" className="px-4" onClick={() => setDialog({ ...dialog, show: false })}>Hủy Bỏ</Button>}
                    <Button variant={dialog.type === 'confirm' ? 'primary' : 'info'} className="fw-bold px-4 text-white" onClick={() => {
                        if (dialog.onConfirm) dialog.onConfirm();
                        setDialog({ ...dialog, show: false });
                        if (dialog.isSuccess) window.location.reload();
                    }}>Xác Nhận</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default HistoryPage;