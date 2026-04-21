import axios from 'axios';
import { access } from 'fs';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { setModal } from '../../pages/frm/common/Frm';
import { ModalAction } from '../../pages/frm/FrmLogin.modalReducer';
import { axiosAuthJoinAccess } from '../../utils/axiosInstance';
import styles from './SignupModal.module.css';

interface buttonProps {
    onCancel(e?: React.MouseEvent<HTMLButtonElement>): void;
}

interface joinProps extends buttonProps {
    joinModal: setModal;
    dispatch: React.Dispatch<ModalAction>;
    // setJoinModal: React.Dispatch<React.SetStateAction<setModal>>;
}

//접근권한신청폼 타입
type AccessAllowForm = {
    userId: string;
    pwd: string;
    pwdChk: string;
    userName: string;
    userPhone: string;
    emailAddress: string;
    role: string;
    applyStatus: string;
};

//접근권한요청폼
type AccessFormRequest = Omit<AccessAllowForm, 'pwdChk'>;

//접근권한응답폼
type AccessFormResponse = {
    userId: string;
    createdAt: string;
};

//유효성체크 에러 타입
type Errors = Partial<Record<keyof AccessAllowForm, string>>;

//주요함수
const SignupModal: React.FC<joinProps> = ({ onCancel, joinModal, dispatch }) => {
    //접근권한폼 신청하기 누른 후, 이후 에러 발생시 그 입력란으로 포커스 이동
    const inputRefs = {
        userId: useRef<HTMLInputElement>(null),
        pwd: useRef<HTMLInputElement>(null),
        pwdChk: useRef<HTMLInputElement>(null),
        userName: useRef<HTMLInputElement>(null),
        userPhone: useRef<HTMLInputElement>(null),
        emailAddress: useRef<HTMLInputElement>(null),
    };

    //비밀번호길이체크
    const PWD_MIN = 8;
    //비밀번호 정규식패턴체크(소문자1개이상, 대문자1개이상, 숫자1개이상, 특수문자1개이상이되, 전체문자 1개이상)
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

    //접근권한신청폼 양식
    const [accessForm, setAccessForm] = useState<AccessAllowForm>({
        userId: '',
        pwd: '',
        pwdChk: '',
        userName: '',
        userPhone: '',
        emailAddress: '',
        role: 'USER',
        applyStatus: 'WAITING'
    });

    //에러상태관리
    const [errors, setErrors] = useState<Errors>({});

    //모달창닫기
    const chgCssShow = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({ type: 'ANIMATE_CLOSE_MODAL', payload: 'joinModal' });

        setTimeout(() => {
            onCancel();
        }, 300);
    };

    //접근권한신청이벤트
    const doingJoin = async (e: React.FormEvent<HTMLFormElement>) => {
        //폼의 기본 제출동작 방지
        e.preventDefault();

        const eMap = validate(accessForm);
        setErrors(eMap);
        if (Object.keys(eMap).length > 0) {
            //첫 에러 필드로 포커스 이동
            // const firstKey = Object.keys(eMap)[0] as keyof Errors;
            const firstKey = Object.keys(eMap)[0] as keyof typeof inputRefs;
            inputRefs[firstKey].current?.focus();
            return;
        }

        try {
            const payload: AccessFormRequest = {
                userId: accessForm.userId,
                pwd: accessForm.pwd.trim(),
                userName: accessForm.userName.trim(),
                userPhone: accessForm.userPhone.trim(),
                emailAddress: accessForm.emailAddress.trim(),
                role: accessForm.role,
                applyStatus: accessForm.applyStatus
            };
            // 서버로 접근권한 신청요청
            const res = await axiosAuthJoinAccess.post<AccessFormResponse>('/cloudJoinAccess', payload);
            console.log(res.data.userId);
            console.log(res.data.createdAt);
            localStorage.setItem("userId", res.data.userId);
            toast.info('접근권한 신청이 완료되었으며 현재 신청대기중입니다');
            //모달창닫기
            dispatch({ type: 'CLOSE_MODAL', payload: 'joinModal' });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error : ', error.response?.data || error.message);
                toast.error('접근권한 신청 중 오류가 발생했습니다');
            } else {
                console.log('Unexpected error : ', error);
                toast.error('알 수 없는 오류가 발생했습니다');
            }
        }
    };

    // 아이디, 비번, 이름, 휴대폰번호, 이메일 입력값에 따라 해당창에 설정
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type } = e.target as HTMLInputElement;
        setAccessForm((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    //비밀번호 확인칸에서 다른 칸으로 focus시 블러처리
    const onBlurPwdChk = () => {
        const e = validate(accessForm);
        setErrors((prevState) => ({
            ...prevState,
            pwdChk: e.pwdChk,
        }));
    };

    //유효성체크
    const validate = (v: AccessAllowForm): Errors => {
        const errs: Errors = {};
        const pwd = v.pwd.trim();
        const pwdChk = v.pwdChk.trim();

        if (pwd.length < PWD_MIN) errs.pwd = `비밀번호는 최소 ${PWD_MIN}자 이상입니다`;
        else if (!PWD_REGEX.test(pwd)) errs.pwd = '대/소문자, 숫자, 특수문자를 포함해 주세요';

        if (v.pwd !== v.pwd.trim()) errs.pwd = '비밀번호 앞뒤 공백은 사용할 수 없습니다';
        if (v.pwdChk !== v.pwdChk.trim()) errs.pwdChk = '비밀번호 앞뒤 공백은 사용할 수 없습니다';

        //개인정보 포함 방지
        if (v.userId && pwd.toLowerCase().includes(v.userId.toLowerCase())) {
            errs.pwd = '비밀번호에 아이디를 포함할 수 없습니다';
        }

        //비밀번호 일치여부
        if (v.pwd !== v.pwdChk) errs.pwdChk = '비밀번호가 일치하지 않습니다';

        //공백 입력방지
        ['userId', 'userName', 'userPhone', 'emailAddress'].forEach((each) => {
            const key = each as keyof AccessAllowForm;
            if (!v[key] || !v[key].trim()) errs[key] = '필수 입력값입니다';
        });

        return errs;
    };

    return (
        <div className={`${styles.modalOverlay} ${joinModal.cssAddShow ? styles.show : ''}`}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} type="button" onClick={chgCssShow}>
                    &times;
                </button>
                <h2 className={styles.modalTitle}>권한신청</h2>
                <form className={styles.form} onSubmit={doingJoin}>
                    <div className={styles.formGroup}>
                        <label>아이디</label>
                        <input
                            type="text"
                            ref={inputRefs.userId}
                            className={styles.input}
                            name="userId"
                            value={accessForm.userId}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>비밀번호</label>
                        <input
                            type="password"
                            ref={inputRefs.pwd}
                            className={styles.input}
                            name="pwd"
                            value={accessForm.pwd}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>
                    {/* 비밀번호 유효성 검사 실패시 표시 */}
                    {errors.pwd && <small>{errors.pwd}</small>}
                    <div className={styles.formGroup}>
                        <label>비밀번호 확인</label>
                        <input
                            type="password"
                            ref={inputRefs.pwdChk}
                            className={styles.input}
                            name="pwdChk"
                            value={accessForm.pwdChk}
                            onChange={handleChange}
                            onBlur={onBlurPwdChk}
                            autoComplete="new-password"
                        />
                        {/* 비밀번호 확인 유효성 검사 실패시 표시 */}
                        {errors.pwdChk && <small>{errors.pwdChk}</small>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>이름</label>
                        <input
                            type="text"
                            ref={inputRefs.userName}
                            className={styles.input}
                            name="userName"
                            value={accessForm.userName}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>휴대폰번호</label>
                        <input
                            type="tel"
                            ref={inputRefs.userPhone}
                            className={styles.input}
                            name="userPhone"
                            value={accessForm.userPhone}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>이메일</label>
                        <input
                            type="email"
                            ref={inputRefs.emailAddress}
                            className={styles.input}
                            name="emailAddress"
                            value={accessForm.emailAddress}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>
                    <button
                        className={styles.submitButton}
                        disabled={
                            !accessForm.userId ||
                            !accessForm.pwd ||
                            !accessForm.pwdChk ||
                            !accessForm.userName ||
                            !accessForm.userPhone ||
                            !accessForm.emailAddress
                        }
                    >
                        접근권한 신청하기
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupModal;
