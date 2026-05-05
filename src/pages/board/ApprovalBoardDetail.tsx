import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import styles from './ApprovalBoardDetail.module.css';
import { axiosBoard } from '../../utils/axiosInstance';

type DetailData = {
    postNo: number;
    fnNm: string;
    applyStatus: string;
    applyStatusNm: string;
    title: string;
    content: string;
    userId: string;
    regDt: string;
};

const ApprovalBoardDetail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as { postNo: number } | null;
    const postNo = state?.postNo ?? null;

    const [detail, setDetail] = useState<DetailData>({
        postNo: postNo ?? 0,
        fnNm: '',
        applyStatus: '',
        applyStatusNm: '',
        title: '',
        content: '',
        userId: '',
        regDt: ''    
    });

    useEffect(() => {
        if (!postNo) return;

        const fetchDetail = async () => {
            const res = await axiosBoard.get<DetailData>(`/posts/${postNo}`);
            setDetail(res.data);
        };

        fetchDetail();
    }, [postNo]);

    if (!postNo) return <Navigate to="/board/ApprovalBoard" replace />;

    const renderStatusBadge = (statusNm: string, statusCd: string) => {
        let cls = styles.statusPending;
        if (statusCd === 'APPROVED') cls = styles.statusApproved;
        else if (statusCd === 'REJECTED') cls = styles.statusRejected;
        // else if (statusCd === 'WAITING') cls = styles.statusPending;
        return <span className={`${styles.statusBadge} ${cls}`}>{statusNm}</span>;
    };

    const handleList = () => {
        navigate('/board/ApprovalBoard');
    };

    const handleEdit = () => {
        navigate('/board/ApprovalBoardWrite', { state: { postNo, mode: 'edit' } });
    };

    const handleDelete = () => {
        // TODO: 삭제 로직 추가
    };

    return (
        <div className={styles.wrap}>
            <h2 className={styles.pageTitle}>권한/가입 승인요청 게시판 - 상세</h2>

            <div className={styles.formCard}>
                <table className={styles.formTable}>
                    <tbody>
                        <tr>
                            <th>문의내용</th>
                            <td>{detail.fnNm}</td>
                        </tr>
                        <tr>
                            <th>신청상태</th>
                            <td>{renderStatusBadge(detail.applyStatusNm, detail.applyStatus)}</td>
                        </tr>
                        <tr>
                            <th>작성자</th>
                            <td>{detail.userId}</td>
                        </tr>
                        <tr>
                            <th>작성일자</th>
                            <td>{detail.regDt}</td>
                        </tr>
                        <tr>
                            <th>제목</th>
                            <td>{detail.title}</td>
                        </tr>
                        <tr>
                            <th>내용</th>
                            <td className={styles.contentCell}>{detail.content}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.btnArea}>
                <button className={styles.btnList} onClick={handleList}>
                    목록
                </button>
                <button className={styles.btnEdit} onClick={handleEdit}>
                    수정
                </button>
                <button className={styles.btnDelete} onClick={handleDelete}>
                    삭제
                </button>
            </div>
        </div>
    );
};

export default ApprovalBoardDetail;