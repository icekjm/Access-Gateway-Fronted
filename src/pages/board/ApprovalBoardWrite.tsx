import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosBoard, axiosJoinAccess } from '../../utils/axiosInstance';
import { BoardWriteReq, BoardWriteRes } from './common/Board';
import styles from './ApprovalBoardWrite.module.css';
import { FnInfo, FnList } from '../frm/common/Frm';

type FormErrors = {
    fnNo: string;
    title: string;
    content: string;
};

const ApprovalBoardWrite: React.FC = () => {
    const navigate = useNavigate();

    const [fnList, setFnList] = useState<FnInfo<FnList>>({ FnInfo: []});

    const [form, setForm] = useState<BoardWriteReq>({
        userId: '',
        fnNo: null,
        title: '',
        content: '',
    });

    const [errors, setErrors] = useState<FormErrors>({
        fnNo: '',
        title: '',
        content: '',
    });

    useEffect(() => {

        const fetchFnList = async () => {
            try {
                
                //로컬스토리지에서
                const userId = localStorage.getItem('userId') ?? '';
                setForm((prev) => ({...prev, userId}));

                const res = await axiosJoinAccess.get<FnInfo<FnList>>('/functions');
                
                //fn_no가 2인것은 제외
                const filteredData = res.data.FnInfo.filter(each => each.fnNo !== 2);
                console.log(filteredData);

                setFnList({FnInfo: filteredData});
            } catch {
                toast.error('기능 목록을 불러오는 중 오류가 발생하였습니다.');
            }
        };
        fetchFnList();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleFnChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, fnNo: value ? Number(value) : null }));
        setErrors((prev) => ({ ...prev, fnNo: '' }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = { fnNo: '', title: '', content: '' };
        let valid = true;

        if (!form.fnNo) {
            newErrors.fnNo = '문의 내용을 선택해주세요.';
            valid = false;
        }
        if (form.title.trim() === '') {
            newErrors.title = '제목을 입력해주세요.';
            valid = false;
        }
        if (form.content.trim() === '') {
            newErrors.content = '내용을 입력해주세요.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {

            const res = await axiosBoard.post<BoardWriteRes>('/posts', form);
            
            toast.success('게시글이 등록되었습니다.');
            toast.info('생성날짜 : ' + res.data.createdAt);
            
            navigate('/board/ApprovalBoard');
        } catch {
            toast.error('게시글 등록 중 오류가 발생하였습니다.');
        }
    };

    const handleCancel = () => {
        navigate('/board/ApprovalBoard');
    };

    return (
        <div className={styles.wrap}>
            <h2 className={styles.pageTitle}>권한/가입 승인요청 게시판 - 새글작성</h2>

            <div className={styles.formCard}>
                <table className={styles.formTable}>
                    <tbody>
                        <tr>
                            <th>문의내용</th>
                            <td>
                                <select
                                    className={`${styles.select} ${errors.fnNo ? styles.error : ''}`}
                                    value={form.fnNo ?? ''}
                                    onChange={handleFnChange}
                                >
                                    <option value="">서비스를 선택하세요.</option>
                                    {fnList.FnInfo.map((fn) => (
                                        <option key={fn.fnNo} value={fn.fnNo}>
                                            {fn.fnNm}
                                        </option>
                                    ))}
                                </select>
                                {errors.fnNo && <div className={styles.errorMsg}>{errors.fnNo}</div>}
                            </td>
                        </tr>
                        <tr>
                            <th>제목</th>
                            <td>
                                <input
                                    className={`${styles.inputTitle} ${errors.title ? styles.error : ''}`}
                                    type="text"
                                    name="title"
                                    placeholder="제목을 입력하세요."
                                    value={form.title}
                                    onChange={handleChange}
                                    maxLength={200}
                                />
                                {errors.title && <div className={styles.errorMsg}>{errors.title}</div>}
                            </td>
                        </tr>
                        <tr>
                            <th>내용</th>
                            <td>
                                <textarea
                                    className={`${styles.textarea} ${errors.content ? styles.error : ''}`}
                                    name="content"
                                    placeholder="내용을 입력하세요."
                                    value={form.content}
                                    onChange={handleChange}
                                />
                                {errors.content && <div className={styles.errorMsg}>{errors.content}</div>}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.btnArea}>
                <button className={styles.btnCancel} onClick={handleCancel}>
                    취소
                </button>
                <button className={styles.btnSubmit} onClick={handleSubmit}>
                    등록
                </button>
            </div>
        </div>
    );
};

export default ApprovalBoardWrite;
