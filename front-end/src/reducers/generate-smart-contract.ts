import EReducerState from '@/constants/reducer-state';

const generateSCInitialState = {
  isLoading: false,
  isError: false,
  smartContract: ''
};

type TState = typeof generateSCInitialState;

interface IAction {
  state: EReducerState;
  payload: string;
}

function generateSCReducer(state: TState, action: IAction) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        smartContract: ''
      };
    }
    case EReducerState.success: {
      return {
        ...state,
        isLoading: false,
        smartContract: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        smartContract: ''
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        smartContract: ''
      };
    }
    default: {
      return state;
    }
  }
}

export type { TState, IAction };
export { generateSCInitialState, generateSCReducer };
