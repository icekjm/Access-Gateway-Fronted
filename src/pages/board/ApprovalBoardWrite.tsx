import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosJoinAccess } from '../../utils/axiosInstance';
import { BoardWriteReq, BoardWriteRes } from './common/Board';
import styles from './ApprovalBoardWrite.module.css';

type FormErrors = {
    title: string;
    content: string;
};

const ApprovalBoardWrite: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<BoardWriteReq>({
        title: '',
        content: '',
    });

    const [errors, setErrors] = useState<FormErrors>({
        title: '',
        content: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // 입력 시 해당 필드 에러 초기화
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = { title: '', content: '' };
        let valid = true;

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
            await axiosJoinAccess.post<BoardWriteRes>('/board/insertBoardPost', form);
            toast.success('게시글이 등록되었습니다.');
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
