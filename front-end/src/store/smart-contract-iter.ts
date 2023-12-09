import { create } from 'zustand';

import IAuditResponse from '@/interfaces/audit-response';

interface ICommonState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface IGenerateSCState extends ICommonState {
  smartContract: string;
}

interface ICompileSCState extends ICommonState {
  compilationOutput: string;
}

interface IFixAndCompileSCState extends ICommonState {
  fixedSmartContract: string;
  compilationOutput: string;
}

interface IAuditSCState extends ICommonState {
  auditingOutput: IAuditResponse[] | string;
}

interface IState {
  generateSC: IGenerateSCState;
  compileSC: ICompileSCState;
  fixAndCompileSC: IFixAndCompileSCState;
  auditSC: IAuditSCState;
}

interface IActions {
  setGenerateSC: (state: IGenerateSCState) => void;
  setCompileSC: (state: ICompileSCState) => void;
  setFixAndCompileSC: (state: IFixAndCompileSCState) => void;
  setAuditSC: (state: IAuditSCState) => void;
  reset: () => void;
}

const initialState: IState = {
  generateSC: {
    isLoading: false,
    isSuccess: false,
    isError: false,
    smartContract: ''
  },
  compileSC: {
    isLoading: false,
    isSuccess: false,
    isError: false,
    compilationOutput: ''
  },
  fixAndCompileSC: {
    isLoading: false,
    isSuccess: false,
    isError: false,
    fixedSmartContract: '',
    compilationOutput: ''
  },
  auditSC: {
    isLoading: false,
    isSuccess: false,
    isError: false,
    auditingOutput: [] as IAuditResponse[]
  }
};

const useSCIterStore = create<IState & IActions>((set) => ({
  ...initialState,
  setGenerateSC: (state: IGenerateSCState) =>
    set((previousState) => ({ generateSC: { ...previousState.generateSC, ...state } })),
  setCompileSC: (state: ICompileSCState) =>
    set((previousState) => ({ compileSC: { ...previousState.compileSC, ...state } })),
  setFixAndCompileSC: (state: IFixAndCompileSCState) =>
    set((previousState) => ({ fixAndCompileSC: { ...previousState.fixAndCompileSC, ...state } })),
  setAuditSC: (state: IAuditSCState) =>
    set((previousState) => ({ auditSC: { ...previousState.auditSC, ...state } })),
  reset: () => {
    set(initialState);
  }
}));

export default useSCIterStore;
