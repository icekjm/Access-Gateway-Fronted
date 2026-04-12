import React, { ChangeEvent, useEffect, useReducer, useRef, useState } from 'react';
import axios from 'axios';
import { BringGaInfo, DbInfo, FnInfo, FormIdPass, loginReq, loginRes, SelectedFn, setModal } from './common/Frm';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify'; // react-toastify 모듈 import
import SelectFnModal from '../../components/SelectFnModal/SelectFnModal';
import TwoFactorAuth from '../../components/TwoFactorAuth/TwoFactorAuth';
import SignupModal from '../../components/joinModal/SignupModal';
import { initialModalState, modalReducer } from './FrmLogin.modalReducer';
import { axiosJoinAccess, axiosLogin } from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import styles from './FrmLogin.module.css';

const FrmLogin: React.FC = () => {

    const imagePath = process.env.REACT_APP_IMG_PROJECT + 'common/';

    //모달창관리 리듀서
    const [modalState, dispatch] = useReducer(modalReducer, initialModalState);

    //DB로부터 해당FN 정보 받아오기
    const [bringFnInfo, setBringFnInfo] = useState<DbInfo<SelectedFn> | undefined>();
    //아이디 패스워드 입력값 설정
    const [formIdPass, setFormIdPass] = useState<FormIdPass>({
        userId: '',
        pwd: '',
        loginOff: true
    });
    // 이전에 체크박스들에 체크되어있을때 쿠키로부터 아이디값, 자동로그인 값 가져오기
    let fnNo: string = Cookies.get('fnNo') || '';

    //pass ref 설정
    const passRef = useRef<HTMLInputElement>(null);

    //현재 url 받기
    const currentWhere: string = window.location.href;

    //뒤로가기 막기 이벤트 설정
    useEffect(() => {
        window.onpopstate = (e: PopStateEvent): void => {
            if (window.location.hash === '#init') {
                window.history.go(1);
            }
        };

        window.history.pushState({}, '', '#init');
        window.history.pushState({}, '', currentWhere);

        return (): void => {
            window.onpopstate = null;
        };
    }, []);

    // 이전페이지에서 선택된 Fn정보 불러오기
    useEffect(() => {
        
        const fetchData = async () => {
            try {
                const res = await axiosJoinAccess.get<DbInfo<SelectedFn>>('/loginInfo');
                setBringFnInfo(res.data);
            } catch(error) {
                toast.error('데이터를 불러오는 중 오류가 발생하였습니다');
            }
        }

        fetchData();

    }, []);

    // 아이디 패스워드 둘다 존재시 로그인버튼 활성화
    useEffect(() => {
        if (formIdPass.userId && formIdPass.pwd) {
            setFormIdPass((prevState) => ({
                ...prevState,
                loginOff: false,
            }));
        } else {
            setFormIdPass((prevState) => ({
                ...prevState,
                loginOff: true,
            }));
        }
    }, [formIdPass.userId, formIdPass.pwd]);

    // 아이디, 패스워드, 체크박스 이벤트
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormIdPass((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    //id 입력후 엔터 누를때 패스워드입력란에 포커싱
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            if (passRef.current) {
                passRef.current.focus();
            }
        }
    };

    //로그인 버튼 클릭
    const doingLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        //폼의 기본 제출동작 방지
        e.preventDefault();

        console.log('[디버깅] doingLogin 함수 호출됨');

        if (formIdPass.userId && formIdPass.pwd) {

            if (bringFnInfo && bringFnInfo.DbInfo) {

                let transferServerForm: loginReq = {
                    userId: formIdPass.userId,
                    password: formIdPass.pwd,
                };

                try {
                    const res = await axiosLogin.post<loginRes>('/prelogin', transferServerForm, {
                        headers: {'Content-Type' : 'application/json'}
                    })

                    const { mfaRequired, preAuthToken } = res.data;

                    if (mfaRequired) {
                        if (!preAuthToken) {
                            toast.error('mfaRequired=true인데 preAuthToken이 없습니다.');
                        }

                        sessionStorage.setItem('preAuthToken', preAuthToken);
                        console.log('preToken 저장 완료:', preAuthToken);

                        //TWO FACTOR 화면으로 보내기
                        dispatch({ type: 'EXCLUSIVE_OPEN_MODAL', payload: 'twoFactor' });
                    }

                } catch(err) {
                    if(axios.isAxiosError(err)) {
                        const status = err?.response?.status;
                        const msg = err?.response?.data?.message;

                    if (status === 401) {
                        toast.error(msg || '아이디 또는 비밀번호가 올바르지 않습니다' );
                    } else if (status === 403) {
                        toast.error( msg || '승인되지 않은 계정입니다. 관리자에게 문의해주세요.');
                    } else {
                        toast.error( msg || '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' );
                    }
                    }
                    
                }
            }
        }
    };

    // 해당 이미지 클릭시 이전 기능 인트로 화면으로 이동
    const goingBackInt = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        
        try {
            const res = await axiosJoinAccess.delete('/session');
        } catch(error) {
            toast.error('뒤로가기 중 오류가 발생하였습니다');
        }
        // navigate(-1);
        window.location.href = '/';
    };

    return (
        <div className={styles.pageWrap}>
            {/* 뒤로가기 */}
            <img
                src={`${imagePath}arrow_prev.png`}
                className={styles.backBtn}
                alt="뒤로가기"
                onClick={() => dispatch({ type: 'EXCLUSIVE_OPEN_MODAL', payload: 'goingBackModal' })}
            />

            {/* 우측 상단 로고 */}
            {bringFnInfo && (
                <div className={styles.logoWrap}>
                    <img src={`${imagePath}${bringFnInfo.DbInfo.logoNm}`} className={styles.logoImg} alt="" />
                </div>
            )}

            {/* 로그인 카드 */}
            <div className={styles.card}>

                {/* 서비스 이미지 */}
                <div className={styles.serviceImgWrap}>
                    <img src={`${imagePath}loginImg.png`} className={styles.serviceImg} alt="" />
                </div>

                {/* 폼 */}
                <form className={styles.form} onSubmit={doingLogin}>
                    <div className={styles.inputWrap}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="사용자ID"
                            name="userId"
                            value={formIdPass.userId}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                        />
                    </div>
                    <div className={styles.inputWrap}>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="비밀번호"
                            name="pwd"
                            ref={passRef}
                            value={formIdPass.pwd}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.findRow}>
                        <span className={styles.findLink}>아이디</span>
                        <span className={styles.findSep}>|</span>
                        <span className={styles.findLink}>패스워드 찾기</span>
                    </div>

                    <div className={styles.btnWrap}>
                        <button className={styles.loginBtn} disabled={formIdPass.loginOff} type="submit">
                            로그인
                        </button>
                        <button
                            className={styles.joinBtn}
                            type="button"
                            onClick={() => dispatch({ type: 'EXCLUSIVE_OPEN_MODAL', payload: 'joinModal' })}
                        >
                            접근권한신청
                        </button>
                    </div>
                </form>
            </div>

            {modalState.goingBackModal.isOpen && (
                <SelectFnModal
                    onConfirm={goingBackInt}
                    onCancel={() => dispatch({ type: 'CLOSE_MODAL', payload: 'goingBackModal' })}
                    selectFnModal={modalState.goingBackModal}
                    dispatch={dispatch}
                    message="기능 선택화면으로 이동하시겠습니까?"
                />
            )}
            {modalState.twoFactor.isOpen && (
                <TwoFactorAuth
                    onCancel={() => dispatch({ type: 'CLOSE_MODAL', payload: 'twoFactor' })}
                    twoFactorModal={modalState.twoFactor}
                    userId={formIdPass.userId}
                    dispatch={dispatch}
                />
            )}
            {modalState.joinModal.isOpen && (
                <SignupModal
                    onCancel={() => dispatch({ type: 'CLOSE_MODAL', payload: 'joinModal' })}
                    joinModal={modalState.joinModal}
                    dispatch={dispatch}
                />
            )}
        </div>
    );
};

export default FrmLogin;
