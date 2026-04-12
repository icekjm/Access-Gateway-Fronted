
export type FnInfo<T> = {
    FnInfo: T[];
};

export type ChosenFnInfo<T> = {
    ChosenFnInfo: T;
}

export type FnList = {
    fnNo: string;
    fnNm: string;
};


export type FnInfoReq = {
    fnNo: string;
    fnNm: string
}

//
export type LoginFnInfo<T> = {
    LoginFnInfo: T;
}

export type SelectedFn = {
    fnNo : number;
    fnNm : string;
    serviceYn: string;
    fnImgNm: string;
    logoNm: string;
}

//입력값, 페이지이동, 전달데이터 형태
export type TransferData<T> = {
    inputValue: string;
    movePage: boolean;
    transferData: T;
};

////로그인화면
export type DbInfo<T> = {
    DbInfo: T;
};

//로그인폼
export type FormIdPass = {
    userId: string;
    pwd: string;
    loginOff: boolean;
    // checkedUserId: boolean;
    // checkedAutoLogin: boolean;
};

export type BringGaInfo<T> = DbInfo<T> & {
    autoLogin: string;
    saveUserId: string;
};


export type setModal = {
    isOpen: boolean;
    cssAddShow: boolean;
};

export type loginReq = {
    userId: string;
    password: string;
};

export type loginRes = {
    mfaRequired: boolean;
    preAuthToken: string;
    tokenType: string;
}