import { setModal } from './common/Frm';

export type ModalState = {
    twoFactor: setModal;
    joinModal: setModal;
    goingBackModal: setModal;
};

export type ModalAction =
    | { type: 'EXCLUSIVE_OPEN_MODAL'; payload: keyof ModalState }
    | { type: 'ANIMATE_CLOSE_MODAL'; payload: keyof ModalState }
    | { type: 'CLOSE_MODAL'; payload: keyof ModalState };

export const initialModalState: ModalState = {
    twoFactor: { isOpen: false, cssAddShow: false },
    joinModal: { isOpen: false, cssAddShow: false },
    goingBackModal: { isOpen: false, cssAddShow: false },
};

export function modalReducer(state: ModalState, action: ModalAction): ModalState {
    switch (action.type) {
        case 'EXCLUSIVE_OPEN_MODAL':
            //모든 모달을 닫고 지정한 모달만 오픈
            const cleared = Object.keys(state).reduce((acc, key) => {
                acc[key as keyof ModalState] = { isOpen: false, cssAddShow: false };
                return acc;
            }, {} as ModalState);

            return {
                ...cleared,
                [action.payload]: { isOpen: true, cssAddShow: true },
            };

        case 'ANIMATE_CLOSE_MODAL':
            return {
                ...state,
                [action.payload]: {
                    ...state[action.payload],
                    cssAddShow: false,
                },
            };

        case 'CLOSE_MODAL':
            return {
                ...state,
                [action.payload]: {
                    isOpen: false,
                    cssAddShow: false,
                },
            };

        default:
            return state;
    }
}
