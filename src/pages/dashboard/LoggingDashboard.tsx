import React, { useState, useReducer, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CloudFileList from '../../components/dbFileList/CloudFileList';
import { axiosLogout } from '../../utils/axiosInstance';
import { ConnectionStatus, TabType } from './Logging';
import { fileListReducer, FileListState, initialFileListState } from './Logging.modalReducer';
import styles from './Logging.module.css';

//더미데이터용
// export const dummyLogs: string[] = Array.from(
//     { length: 50 },
//     (_, i) => `[2025-08-05 09:00:${String(i).padStart(2, '0')}] INFO: Dummy log line ${i + 1}`
// );

const tabItems: TabType[] = ['DB', 'DNC', 'STANDBY', 'SUCCESS', 'FAIL', 'ERROR', 'EXCEPTION'];

//웹소켓 관련 설정
const MAX_LOGS = 500;

//탭메뉴와 파일리스트(useReducer로 관리)를 맵핑하는 로직
const tabToFileKeyMap: Record<TabType, keyof FileListState> = {
    DB: 'dbFile',
    DNC: 'dncFile',
    STANDBY: 'standbyFile',
    SUCCESS: 'successFile',
    FAIL: 'failFile',
    ERROR: 'errorFile',
    EXCEPTION: 'exFile',
};

const LoggingDashboard: React.FC = () => {
    const navigate = useNavigate();

    //클라우드서버 로그 콘솔창 설정(웹소켓관련)
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>('reconnecting');
    const [logs, setLogs] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const retryCount = useRef<number>(0);
    const MAX_RETRIES = 3;

    //탭메뉴별 파일리스트 리듀서로 관리
    const [fileListState, dispatch] = useReducer(fileListReducer, initialFileListState);
    const [activeTab, setActiveTab] = useState<TabType>('DB');

    // 페이지 첫 진입시 보이는 파일목록은 db파일로 설정
    useEffect(() => {
        dispatch({ type: 'EXCLUSIVE_OPEN_FILE', payload: tabToFileKeyMap[activeTab] });
    }, [activeTab]);

    //클릭한 탭메뉴에 따라 보여줄 탭 컴포넌트를 설정함
    const renderTabMenuComponent = () => {
        switch (activeTab) {
            case 'DB':
                return fileListState.dbFile.isOpen && <CloudFileList reqPath={activeTab} />;
            case 'DNC':
                return fileListState.dncFile.isOpen && <CloudFileList reqPath={activeTab} />;
            case 'STANDBY':
                return fileListState.standbyFile.isOpen && <CloudFileList reqPath={activeTab} />;
            case 'SUCCESS':
                return fileListState.successFile.isOpen && <CloudFileList reqPath={activeTab} />;
            case 'FAIL':
                return fileListState.failFile.isOpen && <CloudFileList reqPath={activeTab} />;
            case 'ERROR':
                return fileListState.errorFile.isOpen && <CloudFileList reqPath={activeTab} />;
            case 'EXCEPTION':
                return fileListState.exFile.isOpen && <CloudFileList reqPath={activeTab} />;
        }
    };

    //웹소켓 관련 로그 콘솔창 설정
    useEffect(() => {
        connectWebSocket();

        return () => {
            socketRef.current?.close();
        };
    }, []);

    const connectWebSocket = () => {
        const baseWsUrl = process.env.REACT_APP_WS_URL as string;

        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('[WebSocket] accessToken 없음');
            setStatus('error');
            //로그인화면으로 이동
            navigate('/frm/FrmLogin');
            return;
        }

        //토큰 붙여서 웹소켓통신요청
        const wsUrl = `${baseWsUrl}?token=${encodeURIComponent(token)}`;

        let socket: WebSocket;

        try {
            socket = new WebSocket(wsUrl);
        } catch (error) {
            console.error('[WebSocket] 연결 생성 실패:', error);
            setStatus('error');
            retryConnection();
            return;
        }

        socketRef.current = socket;

        socket.onopen = () => {
            console.log('[WebSocket] Connected:', wsUrl);
            setStatus('connected');
            retryCount.current = 0;
        };

        socket.onmessage = (event: MessageEvent) => {
            setLogs((prevLogs) => {
                const timestamp = new Date().toLocaleTimeString();
                const newLogs = [...prevLogs, `[${timestamp}] ${event.data}`];
                if (newLogs.length > MAX_LOGS) {
                    newLogs.shift();
                }
                return newLogs;
            });
            scrollToBottom();
        };

        socket.onerror = (error: Event) => {
            console.error('[WebSocket] Error:', error);
            setStatus('error');
        };

        socket.onclose = (event: CloseEvent) => {
            console.warn('[WebSocket] Closed:', event.code, event.reason);

            //정상종료코드 : 1000
            if (event.code === 1000) {
                console.log('정상 종료이므로 재연결하지 않음');
                setStatus('closed');
            } else {
                console.log('비정상 종료 → 재연결 시도');
                setStatus('reconnecting');
                retryConnection();
            }
        };
    };

    //웹소켓 재연결함수
    const retryConnection = () => {
        if (retryCount.current < MAX_RETRIES) {
            retryCount.current += 1;
            console.log(`[WebSocket] 재연결 시도 (${retryCount.current} / ${MAX_RETRIES})`);
            setTimeout(connectWebSocket, 3000);
        } else {
            console.error('[WebSocket] 최대 재연결 횟수 초과');
            setStatus('error');
        }
    };

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    // 로그콘솔창 스크롤바 아래로 자동설정
    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    //로그아웃버튼 클릭!
    const handleLogout = async (): Promise<void> => {
        try {
            await axiosLogout.post('/logout');
        } catch (e) {
            // 서버 실패해도 무시
        } finally {
            //클라이언트단에서 토큰삭제
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('preAuthToken'); // 추가

            //로그인화면으로 이동
            navigate('/frm/FrmLogin');
        }
    };

    return (
        <div className={styles.dashboardLayout}>
            {/* 헤더 */}
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>클라우드서버 모니터링 시스템</h1>
                <div className={styles.userControls}>
                    <div className={styles.userInfo}>
                        {/* 유저 아이콘 + 관리자 이름 */}
                        <span className={styles.userIcon}>👤</span>
                        <span className={styles.userName}>관리자</span>
                    </div>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <span className={styles.logoutIcon}>🚪</span>
                        <span>로그아웃</span>
                    </button>
                </div>
            </header>

            {/* 메인 */}
            <main className={styles.mainContent}>
                {/* 탭 영역 */}
                <div className={styles.tabNavContainer}>
                    <nav className={styles.tabNav}>
                        <ul className={styles.tabList}>
                            {tabItems.map((label) => (
                                <li key={label}>
                                    <button
                                        className={`${styles.tabButton} ${activeTab === label ? styles.activeTab : ''}`}
                                        onClick={() => {
                                            setActiveTab(label);
                                        }}
                                    >
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* 파일 목록 카드 */}
                <div className={styles.contentArea}>
                    <h2 className={styles.contentTitle}>파일 목록</h2>
                    <p className={styles.contentDescription}>상태별 파일 목록이 여기에 표시됩니다.</p>
                    <div className={styles.card}>
                        {/* 파일 목록 placeholder */}
                        <div className={styles.fileList}>
                            {/* {activeTab === 'DB' && fileListState.dbFile.isOpen && <CloudFileList />} */}
                            {renderTabMenuComponent()}
                        </div>
                    </div>
                </div>

                {/* 로그 표시 카드 */}
                <div className={styles.fixedLogSection}>
                    <div className={styles.header}>
                        <h2 className={styles.contentTitle}>Cloud Server Log</h2>
                        <span
                            className={`${styles.status} ${
                                status === 'connected'
                                    ? styles.connected
                                    : status === 'error'
                                      ? styles.error
                                      : styles.reconnecting
                            }`}
                        >
                            {status.toUpperCase()}
                        </span>
                    </div>
                    <p className={styles.contentDescription}>클라우드 서버의 로그가 여기에 표시됩니다.</p>
                    <div ref={containerRef} className={`${styles.card} ${styles.logContainer}`}>
                        <pre className={styles.logContent}>
                            {logs.map((log, idx) => (
                                <div key={idx} className={styles.logLine}>
                                    {log}
                                </div>
                            ))}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoggingDashboard;
