import React, { useState, useEffect, useLayoutEffect, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FnInfo, FnInfoReq, FnList, ChosenFnInfo, SelectedFn, TransferData } from './common/Frm';
import { toast } from 'react-toastify';
import { axiosJoinAccess } from '../../utils/axiosInstance';
import styles from './ChooseFn.module.css';

const ChooseFn: React.FC = () => {
    const imagePath: string = process.env.REACT_APP_IMG_PROJECT + 'common/checkerImg.png';

    const [moveData, setMoveData] = useState<TransferData<ChosenFnInfo<SelectedFn>>>({
        inputValue: '',
        movePage: false,
        transferData: {
            ChosenFnInfo: {
                fnNo: -1,
                fnNm: '',
                serviceYn: '',
                fnImgNm: '',
                logoNm: '',
            },
        },
    });

    const [fnList, setFnList] = useState<FnInfo<FnList> | undefined>();
    const [filteredList, setFilteredList] = useState<FnInfo<FnList> | undefined>();

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFilteredList({} as FnInfo<FnList>);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 드롭다운 display 제어
    useEffect(() => {
        if (!dropdownRef.current) return;
        const hasItems = filteredList && filteredList.FnInfo && filteredList.FnInfo.length > 0;
        dropdownRef.current.style.display = hasItems ? 'block' : 'none';
    }, [filteredList]);

    // 입력창 클릭 시 전체 목록 표시
    const handleFocus = (): void => {
        if (moveData.inputValue.trim() === '' && fnList) {
            setFilteredList(fnList);
        }
    };

    // 검색어 입력
    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const valueInput: string = e.target.value.toUpperCase();
        setMoveData((prev) => ({ ...prev, inputValue: valueInput }));
    };

    // FN 클릭
    const fnSelect = async (e: React.MouseEvent<HTMLDivElement>, fnNm: string, fnNo: string): Promise<void> => {
        setMoveData((prev) => ({
            ...prev,
            inputValue: fnNm.toUpperCase(),
            movePage: !prev.movePage,
        }));

        //const fnInfo: FnInfoReq = {} as FnInfoReq;
        //fnInfo.fnNo = fnNo;
        //fnInfo.fnNm = fnNm;

        try {
            const res = await axiosJoinAccess.get<ChosenFnInfo<SelectedFn>>(`/functions/${fnNo}`);
            setMoveData((prev) => ({ ...prev, transferData: res.data }));
        } catch (error) {
            toast.error('데이터를 불러오는 중 오류가 발생하였습니다');
        }
    };

    // 페이지 이동
    useEffect(() => {
        if (moveData.movePage) {
            navigate('/frm/FrmFnIntro', { state: { transferData: moveData.transferData } });
        }
    }, [moveData.transferData]);

    // 검색 필터
    useEffect(() => {
        if (moveData.inputValue.trim() !== '' && fnList && !moveData.movePage) {
            setFilteredList({
                FnInfo: fnList.FnInfo.filter((fn) =>
                    fn.fnNm && fn.fnNm.toUpperCase().includes(moveData.inputValue)
                ),
            });
        } else {
            setFilteredList({} as FnInfo<FnList>);
        }
    }, [moveData.inputValue]);

    // 기능 목록 조회
    useLayoutEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosJoinAccess.get<FnInfo<FnList>>('/functions');
                setFnList(res.data);
            } catch (error) {
                toast.error('데이터를 불러오는 중 오류가 발생하였습니다');
            }
        };
        fetchData();
    }, []);

    return (
        <div className={styles.pageWrap}>
            <img src={imagePath} className={styles.heroImage} alt="" />

            <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                    원하는 <span>기능</span>을 검색하세요
                </h2>

                <div className={styles.inputWrap} ref={containerRef}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="원하는 기능을 입력하세요."
                        value={moveData.inputValue}
                        onChange={handleChange}
                        onClick={handleFocus}
                    />

                    <div className={styles.dropdown} ref={dropdownRef}>
                        <ul>
                            {filteredList && filteredList.FnInfo &&
                                filteredList.FnInfo.map((fn) => (
                                    <li key={fn.fnNo}>
                                        <div
                                            className={styles.fnItem}
                                            onClick={(e) => fnSelect(e, fn.fnNm, fn.fnNo)}
                                        >
                                            <span className={styles.fnName}>
                                                <b>{fn.fnNm}</b>
                                            </span>
                                            <span className={styles.fnArrow}>›</span>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChooseFn;
