import EReducerState from '@/constants/reducer-state';

const auditSCInitialState = {
  isLoading: false,
  isError: false,
  auditingOutput: ''
};

type TState = typeof auditSCInitialState;

interface IAction {
  state: EReducerState;
  payload: string;
}

function auditSCReducer(state: TState, action: IAction) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        auditingOutput: ''
      };
    }
    case EReducerState.success: {
      return {
        ...state,
        isLoading: false,
        auditingOutput: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        auditingOutput: ''
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        auditingOutput: ''
      };
    }
    default: {
      return state;
    }
  }
}

export type { TState, IAction };
export { auditSCInitialState, auditSCReducer };
