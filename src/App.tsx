import Intro from './pages/Intro';
import ChooseFn from './pages/frm/ChooseFn';
import FrmFnIntro from './pages/frm/FrmFnIntro';
import FrmLogin from './pages/frm/FrmLogin';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoggingDashboard from './pages/dashboard/LoggingDashboard';
import ApprovalBoard from './pages/board/ApprovalBoard';
import ApprovalBoardWrite from './pages/board/ApprovalBoardWrite';

import './assets/styles/commonJM.css';
import './assets/styles/stylesheetJM.css';

//App에서 모든 페이지를 관리

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Intro />} />
                <Route path="/frm/FrmLogin" element={<FrmLogin />} />
                <Route path="/frm/ChooseFn" element={<ChooseFn />} />
                <Route path="/frm/FrmFnIntro" element={<FrmFnIntro />} />
                <Route path="/dashboard/LoggingDashboard" element={<LoggingDashboard />} />
                <Route path="/board/ApprovalBoard" element={<ApprovalBoard />} />
                <Route path="/board/ApprovalBoardWrite" element={<ApprovalBoardWrite />} />
            </Routes>

            {/* ToastContainer를 추가 */}
            <ToastContainer
                position="bottom-center" // 토스트 위치 (옵션)
                autoClose={1000} // 자동 닫힘 시간 (옵션)
                hideProgressBar={true} // 진행 바 숨김 여부 (옵션)
                newestOnTop={false} // 새로운 알림을 위에 표시 (옵션)
                closeOnClick // 클릭 시 닫힘 여부
                rtl={false} // 오른쪽에서 왼쪽으로 텍스트 표시
                pauseOnFocusLoss // 포커스 잃으면 일시 정지
                draggable // 드래그 가능 여부
                pauseOnHover // 마우스 오버 시 일시 정지
            />
        </Router>
    );
};

export default App;
