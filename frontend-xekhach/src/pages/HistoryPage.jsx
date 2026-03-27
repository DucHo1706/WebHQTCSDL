import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Vui long dang nhap de xem lich su!");
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

    const handleCancelOrder = async (donHangId) => {
        if (!window.confirm("Ban co chac chan muon huy don hang nay? Tien se duoc hoan lai (neu da thanh toan).")) return;
        
        try {
            const res = await api.post('/Bookings/cancel', { donHangId });
            if (res.data.success) {
                alert(res.data.message);
                window.location.reload(); 
            }
        } catch (error) {
            alert("Loi huy ve:\n" + (error.response?.data?.message || error.message));
        }
    };

    const handlePayOrder = async (donHangId) => {
        if (!window.confirm("Xac nhan thanh toan cho don hang nay?")) return;
        
        try {
            const res = await api.post('/Bookings/pay', { donHangId });
            if (res.data.success) {
                alert("Thanh toan thanh cong! Ve cua ban da duoc xuat.");
                window.location.reload(); 
            }
        } catch (error) {
            alert("Loi thanh toan:\n" + (error.response?.data?.message || error.message));
        }
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
                                
                                {item.trangThaiVe !== 'DaHuy' && (
                                    <Button variant="outline-danger" size="sm" onClick={() => handleCancelOrder(item.donHangId)}>
                                        Huy Ve
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
        </Container>
    );
};

export default HistoryPage;