export type fileOpen = {
    isOpen: boolean;
};

export type FileListState = {
    dbFile: fileOpen;
    dncFile: fileOpen;
    standbyFile: fileOpen;
    successFile: fileOpen;
    failFile: fileOpen;
    errorFile: fileOpen;
    exFile: fileOpen;
};

export type FileListAction = { type: 'EXCLUSIVE_OPEN_FILE'; payload: keyof FileListState };

export const initialFileListState: FileListState = {
    dbFile: { isOpen: false },
    dncFile: { isOpen: false },
    standbyFile: { isOpen: false },
    successFile: { isOpen: false },
    failFile: { isOpen: false },
    errorFile: { isOpen: false },
    exFile: { isOpen: false },
};

export function fileListReducer(state: FileListState, action: FileListAction): FileListState {
    switch (action.type) {
        case 'EXCLUSIVE_OPEN_FILE':
            const cleared = Object.keys(state).reduce((acc, key) => {
                acc[key as keyof FileListState] = { isOpen: false };
                return acc;
            }, {} as FileListState);

            return {
                ...cleared,
                [action.payload]: { isOpen: true },
            };

        default:
            return state;
    }
}
