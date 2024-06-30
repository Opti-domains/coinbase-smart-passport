import React, { ReactNode, useContext, useReducer } from "react";

interface SmartPassportContextType {
  siweStatus: string;
  ens: string;
  cbid: string;
  gitcoinPassport: string;
  coinbaseVerification: string;
  coinbaseCountry: string;
}

const initialState: SmartPassportContextType = {
  siweStatus: 'loading',
  ens: '',
  cbid: '',
  gitcoinPassport: '',
  coinbaseVerification: '',
  coinbaseCountry: '',
};

type ActionType = 
  | { type: 'SET_SIWE_STATUS'; payload: string }
  | { type: 'SET_ENS'; payload: string }
  | { type: 'SET_CBID'; payload: string }
  | { type: 'SET_GITCOIN_PASSPORT'; payload: string }
  | { type: 'SET_COINBASE_VERIFICATION'; payload: string }
  | { type: 'SET_COINBASE_COUNTRY'; payload: string };

function reducer(state: SmartPassportContextType, action: ActionType): SmartPassportContextType {
  switch (action.type) {
    case 'SET_SIWE_STATUS':
      return { ...state, siweStatus: action.payload };
    case 'SET_ENS':
      return { ...state, ens: action.payload };
    case 'SET_CBID':
      return { ...state, cbid: action.payload };
    case 'SET_GITCOIN_PASSPORT':
      return { ...state, gitcoinPassport: action.payload };
    case 'SET_COINBASE_VERIFICATION':
      return { ...state, coinbaseVerification: action.payload };
    case 'SET_COINBASE_COUNTRY':
      return { ...state, coinbaseCountry: action.payload };
    default:
      return state;
  }
}

const SmartPassportContext = React.createContext<[
  SmartPassportContextType,
  React.Dispatch<ActionType>
]>([
  initialState,
  () => null,
]);

export const SmartPassportProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <SmartPassportContext.Provider value={[ state, dispatch ]}>
      {children}
    </SmartPassportContext.Provider>
  );
};

export function useSmartPassport(): [SmartPassportContextType, React.Dispatch<ActionType>] {
  return useContext(SmartPassportContext)
}
