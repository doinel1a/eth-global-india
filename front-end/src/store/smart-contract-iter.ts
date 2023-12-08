import { create } from 'zustand';

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
  auditingOutput: string;
}

interface IState {
  generateSC: IGenerateSCState;
  compileSC: ICompileSCState;
  fixAndCompileSC: IFixAndCompileSCState;
  auditSC: IAuditSCState;
}

interface IActions {
  setGenerateSC: (state: IGenerateSCState) => void;
  setAuditSC: (state: IAuditSCState) => void;
  setFixAndCompileSC: (state: IFixAndCompileSCState) => void;
  setCompileSC: (state: ICompileSCState) => void;
}

const useSCIterStore = create<IState & IActions>((set) => ({
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
    auditingOutput: ''
  },
  setGenerateSC: (state: IGenerateSCState) =>
    set((previousState) => ({ generateSC: { ...previousState.generateSC, ...state } })),
  setCompileSC: (state: ICompileSCState) =>
    set((previousState) => ({ compileSC: { ...previousState.compileSC, ...state } })),
  setFixAndCompileSC: (state: IFixAndCompileSCState) =>
    set((previousState) => ({ fixAndCompileSC: { ...previousState.fixAndCompileSC, ...state } })),
  setAuditSC: (state: IAuditSCState) =>
    set((previousState) => ({ auditSC: { ...previousState.auditSC, ...state } }))
}));

export default useSCIterStore;
