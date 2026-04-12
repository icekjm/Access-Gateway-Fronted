import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import styles from './Intro.module.css';

const Intro: React.FC = () => {
    const navigate = useNavigate();
    const imagePath: string = process.env.REACT_APP_IMG_PROJECT + 'sub/login_intro_img.png';
    let fnNo: string = Cookies.get('fnNo') || '';

    console.log(fnNo);
    //fnNo 테스트를 위한 임시설정 세팅
    // let fnNo: string = '';
    
    // useEffect(() => {
    //     if (fnNo === '1') {
    //         const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
    //             navigate('/frm/FrmLogin');
    //         }, 5000);
    //         return () => {
    //             clearTimeout(timeoutId);
    //         };
    //     } else if (fnNo === '2') {
    //         const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
    //             navigate('/board/ApprovalBoard');
    //         }, 5000);
    //         return () => {
    //             clearTimeout(timeoutId);
    //         };
    //     } else {
    //         const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
    //             navigate('/frm/ChooseFn');
    //         }, 5000);

    //         return () => {
    //             clearTimeout(timeoutId);
    //         };
    //     }
    // }, [fnNo]);
    
    const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
        //JWT 토큰 있으면 바로 로그인하지 않고 바로 대시보드로 이동
        const token = localStorage.getItem('accessToken');

        if (token) {
            navigate('/dashboard/LoggingDashboard');
        } else {
            if (fnNo === '1') {
                navigate('/frm/FrmLogin');
            } else if(fnNo === '2') {
                navigate('/board/ApprovalBoard');
            } else {
                navigate('/frm/ChooseFn');
            }
        }
    };

    return (
        <div className={styles.introWrap}>
            <img src={imagePath} className={styles.bgImage} alt="" />
            <div className={styles.content}>
                <h1 className={styles.title}>
                    모든 <em>서비스</em>를 한 곳에서
                </h1>
                <p className={styles.description}>
                    다양한 기능을 간편하고 빠르게 살펴볼 수 있습니다
                </p>
                <button className={styles.getStartedBtn} onClick={handleClick}>
                    Get Started <span className={styles.arrow}>→</span>
                </button>
            </div>
        </div>
    );
};

export default Intro;
