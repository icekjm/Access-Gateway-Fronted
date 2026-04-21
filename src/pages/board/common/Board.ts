export type BoardPost = {
    postNo: number;
    fnNm: string;
    applyStatus: string;
    applyStatusNm: string;
    title: string;
    writer: string;
    regDt: string;
};

export type BoardListRes = {
    postList: BoardPost[];
    totalCount: number;
    totalPages: number;
};

export type BoardSearchReq = {
    searchType: 'title' | 'content' | 'writer';
    searchValue: string;
    page: number;
    pageSize: number;
};

export type SearchType = 'title' | 'content' | 'writer';

export const SEARCH_TYPE_LABEL: Record<SearchType, string> = {
    title: '제목',
    content: '내용',
    writer: '작성자',
};

export type BoardWriteReq = {
    userId: string;
    fnNo: number | null;
    title: string;
    content: string;
};

export type BoardWriteRes = {
    postNo: number;
    createdAt: string;
};
