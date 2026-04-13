import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChosenFnInfo, SelectedFn } from './common/Frm';
import styles from './FrmFnIntro.module.css';


const FrmFnIntro = () => {
    const navigate = useNavigate();

    //ChooseFn페이지에서 전송된 데이터 받아오기
    const locationUse = useLocation();
    const transferData = (locationUse.state as { transferData: ChosenFnInfo<SelectedFn> })
        .transferData as ChosenFnInfo<SelectedFn>;

    //이미지경로 가져오기
    const imagePath: string = process.env.REACT_APP_IMG_PROJECT + 'common/';

    const clickToNextPage = (e: React.MouseEvent<HTMLHeadingElement>): void => {
        
        if(transferData.ChosenFnInfo.fnNo === 1) {
            navigate('/frm/FrmLogin');
        } else if(transferData.ChosenFnInfo.fnNo === 2) {
            navigate('/board/ApprovalBoard');
        }
        
    };

    useEffect(() => {
        
        if(transferData.ChosenFnInfo.fnNo === 1) {
            const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
                navigate('/frm/FrmLogin');
            }, 5000);

            return () => {
                clearTimeout(timeoutId);
            };
        } else if (transferData.ChosenFnInfo.fnNo === 2) {
            const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
                navigate('/board/ApprovalBoard');
            }, 5000);

            return () => {
                clearTimeout(timeoutId);
            }
        }
        

    }, []);

        
    return (
        <div className={styles.pageWrap}>
            {/* 상단 로고 */}
            <div className={styles.logoWrap}>
                <img src={`${imagePath}${transferData.ChosenFnInfo.logoNm}`} className={styles.logoImg} alt="" />
            </div>

            {/* 중앙 기능 이미지 */}
            <div className={styles.fnCard}>
                <div className={styles.fnImgWrap} onClick={clickToNextPage}>
                    <img src={`${imagePath}${transferData.ChosenFnInfo.fnImgNm}`} className={styles.fnImg} alt="" />
                </div>
                <p className={styles.hint}>클릭하거나 잠시 기다리면 이동합니다</p>
            </div>

            {/* 자동 이동 프로그레스 바 */}
            <div className={styles.progressWrap}>
                <span className={styles.progressLabel}>5초 후 자동 이동</span>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} />
                </div>
            </div>
        </div>
    );
};

export default FrmFnIntro;
