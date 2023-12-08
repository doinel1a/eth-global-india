import EReducerState from '@/constants/reducer-state';
import IChainData from '@/interfaces/chain-data';

const chainsDataInitialState = {
  isLoading: false,
  isError: false,
  chainsData: [] as IChainData[]
};

type TState = typeof chainsDataInitialState;

interface IAction {
  state: EReducerState;
  payload: IChainData[];
}

function chainsDataReducer(state: TState, action: IAction) {
  switch (action.state) {
    case EReducerState.start: {
      return {
        isLoading: true,
        isError: false,
        chainsData: [] as IChainData[]
      };
    }
    case EReducerState.success: {
      return {
        ...state,
        isLoading: false,
        chainsData: action.payload
      };
    }
    case EReducerState.error: {
      return {
        isLoading: false,
        isError: true,
        chainsData: [] as IChainData[]
      };
    }
    default: {
      return state;
    }
  }
}

export type { TState, IAction };
export { chainsDataInitialState, chainsDataReducer };
