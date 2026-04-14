import React, { useEffect, useRef, useState } from 'react';
import { setModal } from '../../pages/frm/common/Frm';
import styles from './TwoFactorAuth.module.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { axiosTwofa } from '../../utils/axiosInstance';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ModalAction } from '../../pages/frm/FrmLogin.modalReducer';

interface buttonProps {
    onCancel(e?: React.MouseEvent<HTMLButtonElement>): void;
    userId: string;
}

interface twoFactorProps extends buttonProps {
    twoFactorModal: setModal;
    dispatch: React.Dispatch<ModalAction>;
    // setTwoFactorModal: React.Dispatch<React.SetStateAction<setModal>>;
}

interface SendCodeRequest {
    method: 'sms' | 'email';
    conDevice: string;
    userId: string;
}

interface SendCodeResponse {
    success: boolean;
    message: string;
}

interface VerifyCodeRequest {
    conDevice: string;
    code: string;
}

interface VerifyCodeResponse {
    success: boolean;
    message: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
}

const TwoFactorAuth: React.FC<twoFactorProps> = ({ onCancel, twoFactorModal, userId, dispatch }) => {
    const navigate = useNavigate();

    const [authMethod, setAuthMethod] = useState<'sms' | 'email'>('sms');
    const [contactValue, setContactValue] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const methodRef = useRef<HTMLInputElement>(null);

    //아래 useEffect를 한번만 실행하도록 함
    const onceRef = useRef(false);

    //세션스토리지에서 preAuthToken 가지고 오기
    useEffect(() => {
        if (onceRef.current) return;
        onceRef.current = true;

        const preAuthToken = sessionStorage.getItem('preAuthToken');
        if (!preAuthToken) {
            toast.error('preAuthToken이 없습니다. 다시 로그인을 시도해주세요');

            //1.모달닫기
            dispatch({ type: 'ANIMATE_CLOSE_MODAL', payload: 'twoFactor' });

            setTimeout(() => {
                onCancel();
            }, 300);

            return;
        }
    }, []);

    //인증번호 전송
    const handleSendCode = async () => {
        //sms인증번호 받기전
        if (codeSent === false) {
            if (authMethod === 'sms' && (!contactValue.trim() || contactValue.trim().length !== 11)) {
                toast.warning('올바른 휴대폰 번호를 입력해주세요');
                methodRef.current?.focus();
                return;
            } else if (authMethod === 'email' && !contactValue.trim()) {
                toast.warning('유효한 이메일 주소를 입력해주세요');
                methodRef.current?.focus();
                return;
            }

            try {
                const payload: SendCodeRequest = {
                    method: authMethod,
                    conDevice: contactValue,
                    userId: userId,
                };

                const res = await axiosTwofa.post<SendCodeResponse>('/sendCode', payload);

                if (res.data.success) {
                    //res의 본문 data객체에서 success라는 boolean값이 존재하는지 확인
                    toast.success('인증코드가 전송되었습니다');
                    setCodeSent(true);
                } else {
                    toast.error(`전송실패: ${res.data.message}`);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error : ', error.response?.data || error.message);
                    toast.error('데이터를 불러오는 중 오류가 발생했습니다');
                } else {
                    console.log('Unexpected error : ', error);
                    toast.error('알 수 없는 오류가 발생했습니다');
                }
            }
        } else {
            //sms인증번호 받은 후 인증번호 검증로직
            if (!code.trim() || code.trim().length !== 6) {
                toast.warning('올바른 인증코드를 입력해주세요');
                return;
            }

            try {
                //preAuthToken 가지고 오기
                const preAuthToken = sessionStorage.getItem('preAuthToken');
                if (!preAuthToken) {
                    toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
                    dispatch({ type: 'ANIMATE_CLOSE_MODAL', payload: 'twoFactor' });
                    setTimeout(() => onCancel(), 300);
                    return;
                }

                const payload: VerifyCodeRequest = {
                    conDevice: contactValue,
                    code: code,
                };

                const res = await axiosTwofa.post<VerifyCodeResponse>('/verifyCode', payload, {
                    headers: {
                        Authorization: `Bearer ${preAuthToken}`,
                    },
                });

                if (res.data.success) {
                    toast.success('인증에 성공하였습니다');

                    const { accessToken, refreshToken } = res.data;
                    // console.log('accessToken발급완료 : ', accessToken);
                    // console.log('refreshToken발급완료 : ', refreshToken);
                    // console.log('전체데이터 : ', res.data);

                    console.log('응답 accessToken', res.data.accessToken);
                    console.log('응답 refreshToken', res.data.refreshToken);

                    //로컬스토리지에 발급받은 토큰을 셋팅
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    localStorage.setItem('userId', userId);
                    console.log('저장 후 accessToken', localStorage.getItem('accessToken'));
                    console.log('저장 후 refreshToken', localStorage.getItem('refreshToken'));

                    setTimeout(() => {
                        onCancel();
                        //대시보드로 이동, 추후 관리자 권한값도 같이 이동시켜야함
                        navigate('/dashboard/LoggingDashboard');
                    }, 300);
                } else {
                    toast.error(`인증실패: ${res.data.message}`);
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error : ', error.response?.data || error.message);
                    toast.error('서버 오류로 인증 실패');
                } else {
                    console.log('Unexpected error : ', error);
                    toast.error('알 수 없는 오류가 발생했습니다');
                }
            }
        }
    };

    const chgCssShow = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({ type: 'ANIMATE_CLOSE_MODAL', payload: 'twoFactor' });

        setTimeout(() => {
            onCancel();
        }, 300);
    };

    return (
        <div className={`${styles.overlay} ${twoFactorModal.cssAddShow ? styles.show : ''} `}>
            <div className={styles.modal}>
                <h2 className={styles.title}>2단계 인증</h2>

                <div className={styles.methodButtons}>
                    <button
                        className={`${styles.smsButton} ${authMethod === 'sms' ? styles.active : ''}`}
                        onClick={() => {
                            setAuthMethod('sms');
                            setContactValue('');
                            setCodeSent(false);
                        }}
                    >
                        SMS
                    </button>
                    <button
                        className={`${styles.emailButton} ${authMethod === 'email' ? styles.active : ''}  `}
                        onClick={() => {
                            setAuthMethod('email');
                            setContactValue('');
                            setCodeSent(false);
                        }}
                    >
                        이메일
                    </button>
                </div>

                {!codeSent ? (
                    <input
                        className={styles.codeInput}
                        type="text"
                        placeholder={authMethod === 'sms' ? '휴대폰 번호를 입력하세요' : '이메일 주소를 입력하세요'}
                        value={contactValue}
                        ref={methodRef}
                        onChange={(e) => setContactValue(e.target.value)}
                    />
                ) : (
                    <input
                        className={styles.codeInput}
                        type="text"
                        placeholder="인증코드를 입력하세요"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                )}

                <div className={styles.buttonGroup}>
                    <button className={styles.transferBtn} onClick={handleSendCode}>
                        {codeSent ? '인증코드 확인' : '전송'}
                    </button>
                    <button className={styles.closeBtn} onClick={chgCssShow}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;
