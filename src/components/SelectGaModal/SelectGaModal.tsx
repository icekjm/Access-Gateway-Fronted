import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setModal } from '../../pages/frm/common/Frm';
import { ModalAction } from '../../pages/frm/FrmLogin.modalReducer';
import styles from './SelectGaModal.module.css';

//버튼과 관련된 기본 Props
interface buttonProps {
    onConfirm(e?: React.MouseEvent<HTMLButtonElement>): void;
    onCancel(e?: React.MouseEvent<HTMLButtonElement>): void;
}

interface selectGaProps extends buttonProps {
    message: string;
    selectGaModal: setModal;
    dispatch: React.Dispatch<ModalAction>;
}

const SelectGaModal: React.FC<selectGaProps> = ({ onConfirm, onCancel, message, selectGaModal, dispatch }) => {
    const chgCssShow = (e: React.MouseEvent<HTMLButtonElement>) => {
        dispatch({ type: 'ANIMATE_CLOSE_MODAL', payload: 'goingBackModal' });

        setTimeout(() => {
            onCancel();
        }, 300);
    };

    return (
        <div className={`${styles['modal-overlay']} ${selectGaModal.cssAddShow ? styles['show'] : ''}`}>
            <div className={`${styles['modal-content']}`}>
                <p className={`${styles['modal-message']}`}>{message}</p>
                <div className={`${styles['modal-buttons']}`}>
                    <button className={`${styles['modal-confirm-btn']}`} onClick={onConfirm}>
                        확인
                    </button>
                    <button className={`${styles['modal-cancel-btn']}`} onClick={chgCssShow}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectGaModal;
