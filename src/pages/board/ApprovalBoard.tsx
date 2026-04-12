import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosJoinAccess } from '../../utils/axiosInstance';
import {
    BoardPost,
    BoardListRes,
    BoardSearchReq,
    SearchType,
    SEARCH_TYPE_LABEL,
} from './common/Board';
import styles from './ApprovalBoard.module.css';
import { initialModalState, modalReducer } from '../frm/FrmLogin.modalReducer';
import SelectGaModal from '../../components/SelectGaModal/SelectGaModal';

const PAGE_SIZE = 10;

const ApprovalBoard: React.FC = () => {
    const navigate = useNavigate();

    //모달창관리 리듀서
    const [modalState, dispatch] = useReducer(modalReducer, initialModalState);

    // 검색 조건
    const [searchType, setSearchType] = useState<SearchType>('title');
    const [searchValue, setSearchValue] = useState<string>('');

    // 게시글 목록
    const [postList, setPostList] = useState<BoardPost[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // 선택된 게시글 (체크박스)
    const [selectedNos, setSelectedNos] = useState<number[]>([]);

    // 목록 조회
    const fetchList = useCallback(async (page: number, type: SearchType, value: string) => {
        try {
            const req: BoardSearchReq = {
                searchType: type,
                searchValue: value.trim(),
                page,
                pageSize: PAGE_SIZE,
            };
            const res = await axiosJoinAccess.post<BoardListRes>('/board/selectBoardList', req);
            setPostList(res.data.postList);
            setTotalPages(res.data.totalPages || 1);
            setSelectedNos([]);
        } catch {
            toast.error('게시글 목록을 불러오는 중 오류가 발생하였습니다.');
        }
    }, []);

    useEffect(() => {
        fetchList(currentPage, searchType, searchValue);
    }, [currentPage]);

    // 검색 실행
    const handleSearch = () => {
        setCurrentPage(1);
        fetchList(1, searchType, searchValue);
    };

    const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    // 전체 체크박스
    const handleCheckAll = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedNos(postList.map((p) => p.postNo));
        } else {
            setSelectedNos([]);
        }
    };

    const handleCheckOne = (postNo: number) => {
        setSelectedNos((prev) =>
            prev.includes(postNo) ? prev.filter((n) => n !== postNo) : [...prev, postNo]
        );
    };

    // 새글 작성
    const handleNew = () => {
        navigate('/board/ApprovalBoardWrite');
    };

    // 수정
    const handleEdit = () => {
        if (selectedNos.length !== 1) {
            toast.warning('수정할 게시글을 1건만 선택해주세요.');
            return;
        }
        navigate('/board/ApprovalBoardWrite', { state: { postNo: selectedNos[0], mode: 'edit' } });
    };

    // 삭제
    const handleDelete = async () => {
        if (selectedNos.length === 0) {
            toast.warning('삭제할 게시글을 선택해주세요.');
            return;
        }
        try {
            await axiosJoinAccess.post('/board/deleteBoardPost', { postNos: selectedNos });
            toast.success('삭제되었습니다.');
            fetchList(currentPage, searchType, searchValue);
        } catch {
            toast.error('삭제 중 오류가 발생하였습니다.');
        }
    };

    // 제목 클릭 → 상세
    const handleRowClick = (postNo: number) => {
        navigate('/board/ApprovalBoardDetail', { state: { postNo } });
    };

    // 신청상태 뱃지
    const renderStatusBadge = (statusNm: string, statusCd: string) => {
        let cls = styles.statusPending;
        if (statusCd === 'APPROVED') cls = styles.statusApproved;
        else if (statusCd === 'REJECTED') cls = styles.statusRejected;
        return <span className={`${styles.statusBadge} ${cls}`}>{statusNm}</span>;
    };

    // 페이지네이션 번호 계산 (최대 10개)
    const getPaginationRange = () => {
        const blockSize = 10;
        const blockStart = Math.floor((currentPage - 1) / blockSize) * blockSize + 1;
        const blockEnd = Math.min(blockStart + blockSize - 1, totalPages);
        const pages: number[] = [];
        for (let i = blockStart; i <= blockEnd; i++) pages.push(i);
        return { pages, blockStart, blockEnd };
    };

    const { pages, blockStart, blockEnd } = getPaginationRange();

    const imagePath: string = process.env.REACT_APP_IMG_PROJECT + 'common/';

    // 해당 이미지 클릭시 이전 기능 인트로 화면으로 이동
    const goingBackInt = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        
        try {
            const res = await axiosJoinAccess.get('/FrmIntro');
        } catch(error) {
            toast.error('뒤로가기 중 오류가 발생하였습니다');
        }
        
        window.location.href = '/';
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.titleRow}>
                <img
                    src={`${imagePath}arrow_prev.png`}
                    alt="뒤로가기"
                    className={styles.backBtn}
                    onClick={() => dispatch({ type: 'EXCLUSIVE_OPEN_MODAL', payload:'goingBackModal'})}
                />
                <h2 className={styles.pageTitle}>권한/가입 승인요청 게시판</h2>
            </div>

            {/* 검색 영역 */}
            <div className={styles.searchArea}>
                <select
                    className={styles.searchDropdown}
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as SearchType)}
                >
                    {(Object.keys(SEARCH_TYPE_LABEL) as SearchType[]).map((key) => (
                        <option key={key} value={key}>
                            {SEARCH_TYPE_LABEL[key]}
                        </option>
                    ))}
                </select>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder="검색어를 입력하세요."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
                <button className={styles.searchBtn} onClick={handleSearch}>
                    검색
                </button>
            </div>

            {/* 버튼 영역 */}
            <div className={styles.actionArea}>
                <button className={styles.btnNew} onClick={handleNew}>
                    새글작성
                </button>
                <button
                    className={`${styles.btnEdit} ${selectedNos.length !== 1 ? styles.btnDisabled : ''}`}
                    onClick={handleEdit}
                >
                    수정
                </button>
                <button
                    className={`${styles.btnDelete} ${selectedNos.length === 0 ? styles.btnDisabled : ''}`}
                    onClick={handleDelete}
                >
                    삭제
                </button>
            </div>

            {/* 테이블 */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.tdCheckbox}>
                                <input
                                    type="checkbox"
                                    onChange={handleCheckAll}
                                    checked={
                                        postList.length > 0 &&
                                        selectedNos.length === postList.length
                                    }
                                />
                            </th>
                            <th>기능명</th>
                            <th>신청상태</th>
                            <th>글제목</th>
                            <th>작성자</th>
                            <th>작성일자</th>
                        </tr>
                    </thead>
                    <tbody>
                        {postList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.noData}>
                                    게시글이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            postList.map((post) => (
                                <tr key={post.postNo}>
                                    <td className={styles.tdCheckbox}>
                                        <input
                                            type="checkbox"
                                            checked={selectedNos.includes(post.postNo)}
                                            onChange={() => handleCheckOne(post.postNo)}
                                        />
                                    </td>
                                    <td>{post.fnNm}</td>
                                    <td>{renderStatusBadge(post.statusNm, post.statusCd)}</td>
                                    <td
                                        className={styles.tdTitle}
                                        onClick={() => handleRowClick(post.postNo)}
                                    >
                                        {post.title}
                                    </td>
                                    <td>{post.writer}</td>
                                    <td>{post.regDt}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            <div className={styles.pagination}>
                {/* 이전 블록 */}
                <button
                    className={`${styles.pageBtn} ${blockStart === 1 ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage(blockStart - 1)}
                    disabled={blockStart === 1}
                >
                    &laquo;
                </button>
                <button
                    className={`${styles.pageBtn} ${currentPage === 1 ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>

                {pages.map((p) => (
                    <button
                        key={p}
                        className={`${styles.pageBtn} ${p === currentPage ? styles.pageBtnActive : ''}`}
                        onClick={() => setCurrentPage(p)}
                    >
                        {p}
                    </button>
                ))}

                {/* 다음 블록 */}
                <button
                    className={`${styles.pageBtn} ${currentPage === totalPages ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
                <button
                    className={`${styles.pageBtn} ${blockEnd === totalPages ? styles.pageBtnDisabled : ''}`}
                    onClick={() => setCurrentPage(blockEnd + 1)}
                    disabled={blockEnd === totalPages}
                >
                    &raquo;
                </button>
            </div>

            {modalState.goingBackModal.isOpen && (
                <SelectGaModal
                    onConfirm={goingBackInt}
                    onCancel={() => dispatch({ type: 'CLOSE_MODAL', payload: 'goingBackModal' })}
                    selectGaModal={modalState.goingBackModal}
                    dispatch={dispatch}
                    message="기능 선택화면으로 이동하시겠습니까?"
                />
            )}
        </div>
    );
};

export default ApprovalBoard;
