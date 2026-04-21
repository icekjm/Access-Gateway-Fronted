import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ApprovalBoardDetail.module.css';
import { axiosBoard } from '../../utils/axiosInstance';

type DetailData = {
    postNo: number;
    fnNm: string;
    statusCd: string;
    statusNm: string;
    title: string;
    content: string;
    writer: string;
    regDt: string;
};

const ApprovalBoardDetail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { postNo } = location.state as { postNo: number };

    // TODO: postNo로 상세 데이터 조회 로직 추가
    const detail: DetailData = {
        postNo,
        fnNm: '',
        statusCd: '',
        statusNm: '',
        title: '',
        content: '',
        writer: '',
        regDt: '',
    };

    useEffect(() => {

        const fetchDetail = async() => {

            const res = await axiosBoard.get<DetailData>('/posts', {params: postNo})
            console.log(res.data);

        }

    })

    const renderStatusBadge = (statusNm: string, statusCd: string) => {
        let cls = styles.statusPending;
        if (statusCd === 'APPROVED') cls = styles.statusApproved;
        else if (statusCd === 'REJECTED') cls = styles.statusRejected;
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
                            <td>{renderStatusBadge(detail.statusNm, detail.statusCd)}</td>
                        </tr>
                        <tr>
                            <th>작성자</th>
                            <td>{detail.writer}</td>
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