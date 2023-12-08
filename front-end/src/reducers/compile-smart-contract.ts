import EReducerState from '@/constants/reducer-state';

const compileSCInitialState = {
  isLoading: false,
  isError: false,
  compilationOutput: ''
};

type TState = typeof compileSCInitialState;

interface IAction {
  state: EReducerState;
  payload: string;
}

function compileSCReducer(state: TState, action: IAction) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        compilationOutput: ''
      };
    }
    case EReducerState.success: {
      return {
        ...state,
        isLoading: false,
        compilationOutput: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        compilationOutput: ''
      };
    }
    case EReducerState.reset: {
      return {
        isLoading: false,
        isError: false,
        compilationOutput: ''
      };
    }
    default: {
      return state;
    }
  }
}

export type { TState, IAction };
export { compileSCInitialState, compileSCReducer };
