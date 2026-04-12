export type TabType = 'DB' | 'DNC' | 'STANDBY' | 'SUCCESS' | 'FAIL' | 'ERROR' | 'EXCEPTION';

export type FileListResponse<T> = {
    dbList: T[];
    resultMessage: string;
};

export type EachFile = {
    fileName: string;
    fileSize: string;
};

export type FileListRequest<T> = {
    fileReqType: T;
};

export type ConnectionStatus = 'connected' | 'error' | 'reconnecting' | 'closed';
