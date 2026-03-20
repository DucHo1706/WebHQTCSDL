import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Vui lòng đăng nhập để xem lịch sử!");
                navigate('/login');
                return;
            }
            const user = JSON.parse(userStr);
            try {
                const res = await api.get(`/Bookings/history/${user.userId}`);
                if (res.data.success) {
                    setHistory(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            }
        };
        fetchHistory();
    }, [navigate]);

    // Hàm gọi Procedure Hủy Đơn Hàng Hoàn Tiền
    const handleCancelOrder = async (donHangId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này? Tiền sẽ được hoàn lại.")) return;
        
        try {
            const res = await api.post('/Bookings/cancel', { donHangId });
            if (res.data.success) {
                alert("🎉 " + res.data.message);
                window.location.reload(); // Tải lại để cập nhật trạng thái
            }
        } catch (error) {
            alert("Lỗi hủy vé: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <Container className="py-5" style={{ minHeight: '70vh' }}>
            <h3 className="fw-bold mb-4" style={{ color: '#ef5222' }}>🕒 LỊCH SỬ ĐẶT VÉ CỦA TÔI</h3>
            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th>Mã Vé</th>
                                <th>Tuyến Xe</th>
                                <th>Ngày Đi</th>
                                <th>Ghế</th>
                                <th>Giá Vé</th>
                                <th>Trạng Thái Vé</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-4">Bạn chưa có chuyến đi nào.</td></tr>
                            ) : (
                                history.map((item, idx) => (
                                    <tr key={idx} className="align-middle">
                                        <td className="fw-bold text-secondary">{item.veId}</td>
                                        <td className="fw-bold">{item.tenTuyen}</td>
                                        <td>{new Date(item.ngayDi).toLocaleString('vi-VN')}</td>
                                        <td><Badge bg="info" className="fs-6">{item.maGhe}</Badge></td>
                                        <td className="text-danger fw-bold">{item.giaVe.toLocaleString('vi-VN')} đ</td>
                                        <td>
                                            {item.trangThaiVe === 'GiuCho' && <Badge bg="warning" text="dark">Giữ Chỗ</Badge>}
                                            {item.trangThaiVe === 'DaXuat' && <Badge bg="success">Đã Xuất</Badge>}
                                            {item.trangThaiVe === 'DaHuy' && <Badge bg="secondary">Đã Hủy</Badge>}
                                        </td>
                                        <td>
                                            {item.trangThaiVe !== 'DaHuy' && (
                                                <Button variant="outline-danger" size="sm" onClick={() => handleCancelOrder(item.donHangId)}>
                                                    Hủy Vé
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default HistoryPage;