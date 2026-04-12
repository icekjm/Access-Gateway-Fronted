import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { EachFile, FileListRequest, FileListResponse, TabType } from '../../pages/dashboard/Logging';
import styles from '../../pages/dashboard/Logging.module.css';
import { axiosDbFile } from '../../utils/axiosFileLoad';
import { api } from '../../utils/axiosInstance';

interface pathProps {
    reqPath: TabType;
}

const CloudFileList: React.FC<pathProps> = ({ reqPath }) => {
    const [dbPathList, setDbPathList] = useState<FileListResponse<EachFile> | undefined>();
    //페이지 로드되면서 파일리스트 클라우드 서버로부터 받아오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                //로컬스토리지에서 토큰 받아오기
                const token = localStorage.getItem('accessToken');
                console.log('대시보드에서 토큰 확인중...', token);

                if (!token) {
                    toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
                    return;
                }

                const payload: FileListRequest<TabType> = {
                    fileReqType: reqPath,
                };

                // const response = await axiosDbFile.post<FileListResponse<EachFile>>('/dbfile', payload, {
                //     headers: {
                //         Authorization: `Bearer ${token}`,
                //     },
                // });

                const response = await api.post<FileListResponse<EachFile>>('/dbfile', payload);

                if (response.data) {
                    // console.log(response.data.dbList);
                    setDbPathList(response.data);
                    toast.success('DB파일목록이 로드되었습니다');
                } else {
                    toast.error('DB파일을 불러오는데 실패하였습니다');
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
        };
        fetchData();
    }, []);

    return (
        <>
            {typeof dbPathList === 'undefined' ||
            (dbPathList && typeof dbPathList.dbList === 'undefined') ||
            dbPathList.dbList.length === 0 ? (
                <div className={styles.fileInfo}>
                    <div className={styles.fileListItem}>해당파일이 존재하지 않습니다</div>
                    <div className={styles.fileSize}> </div>
                </div>
            ) : (
                dbPathList.dbList.map((file) => {
                    return (
                        <div className={styles.fileInfo} key={file.fileName}>
                            <div className={styles.fileListItem}>📁 {file.fileName}</div>
                            <div className={styles.fileSize}> {file.fileSize} KB</div>
                        </div>
                    );
                })
            )}
        </>
    );
};

export default CloudFileList;
