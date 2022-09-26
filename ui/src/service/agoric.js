import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { Far } from '@endo/marshal';
import { makeCapTP, E } from '@endo/captp';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';

import dappConstants from '../conf/defaults.js';
import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from '../utils/fetch-websocket.js';
import { processOffers, processPurses } from './purses/process.js';

const {
  INSTANCE_BOARD_ID,
  INVITE_BRAND_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Nft: NFT_ISSUER_BOARD_ID },
  brandBoardIds: { Money: MONEY_BRAND_BOARD_ID, Nft: NFT_BRAND_BOARD_ID },
} = dappConstants;

const initialState = {
  status: {
    walletConnected: false,
    dappApproved: false,
    showApproveDappModal: false,
  },
  purses: {
    money: [],
    nft: [],
  },
  offers: [],
  agoric: {
    zoe: undefined,
    board: undefined,
    zoeInvitationDepositFacetId: undefined,
    invitationIssuer: undefined,
    walletP: undefined,
  },
  contracts: {
    nft: {
      instance: undefined,
      publicFacet: undefined,
    },
  },
  isLoading: true,
};

const Context = createContext(undefined);
const DispatchContext = createContext(undefined);

const Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DAPP_APPROVED':
      return {
        ...state,
        status: { ...state.status, dappApproved: action.payload },
      };

    case 'SET_SHOW_APPROVE_DAPP_MODAL':
      return {
        ...state,
        status: { ...state.status, showApproveDappModal: action.payload },
      };

    case 'SET_WALLET_CONNECTED':
      return {
        ...state,
        status: { ...state.status, walletConnected: action.payload },
      };

    case 'SET_MONEY_PURSES':
      return { ...state, purses: { ...state.purses, money: action.payload } };

    case 'SET_NFT_PURSES':
      return {
        ...state,
        purses: { ...state.purses, nft: action.payload },
      };

    case 'SET_OFFERS':
      return { ...state, offers: action.payload };

    case 'SET_AGORIC':
      return { ...state, agoric: { ...state.agoric, ...action.payload } };

    case 'SET_NFT_CONTRACT':
      return {
        ...state,
        contracts: { ...state.contracts, nft: action.payload },
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'RESET':
      return initialState;

    default:
      throw new Error('Only defined action types can be handled;');
  }
};

export const AgoricStateProvider = (props) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  const walletPRef = useRef(undefined);

  useEffect(() => {
    // Receive callbacks from the wallet connection.
    const otherSide = Far('otherSide', {
      needDappApproval(_dappOrigin, _suggestedDappPetname) {
        dispatch({ type: 'SET_DAPP_APPROVED', payload: false });
        dispatch({ type: 'SET_SHOW_APPROVE_DAPP_MODAL', payload: true });
      },
      dappApproved(_dappOrigin) {
        dispatch({ type: 'SET_DAPP_APPROVED', payload: true });
        dispatch({ type: 'SET_SHOW_APPROVE_DAPP_MODAL', payload: false });
      },
    });

    let walletAbort;
    let walletDispatch;

    const onConnect = async () => {
      // Set up wallet through socket
      console.info('Connecting to wallet...');

      const socket = getActiveSocket();

      const {
        abort: ctpAbort,
        dispatch: ctpDispatch,
        getBootstrap,
      } = makeCapTP('CB', (obj) => socket.send(JSON.stringify(obj)), otherSide);

      walletAbort = ctpAbort;
      walletDispatch = ctpDispatch;
      const walletP = getBootstrap();
      walletPRef.current = walletP;
      dispatch({ type: 'SET_WALLET_CONNECTED', payload: true });

      // Initialize agoric service based on constants
      const zoeInvitationDepositFacetId = await E(walletP).getDepositFacetId(
        INVITE_BRAND_BOARD_ID,
      );
      const zoe = E(walletP).getZoe();
      const board = E(walletP).getBoard();
      const instanceNft = await E(board).getValue(INSTANCE_BOARD_ID);
      const nftPublicFacet = await E(zoe).getPublicFacet(instanceNft);
      console.log(nftPublicFacet);
      const invitationIssuer = E(zoe).getInvitationIssuer(nftPublicFacet);

      dispatch({
        type: 'SET_AGORIC',
        payload: {
          zoe,
          board,
          zoeInvitationDepositFacetId,
          invitationIssuer,
          walletP,
        },
      });
      dispatch({
        type: 'SET_NFT_CONTRACT',
        payload: { instance: instanceNft, publicFacet: nftPublicFacet },
      });

      async function watchPurses() {
        const pn = E(walletP).getPursesNotifier();
        for await (const purses of iterateNotifier(pn)) {
          console.info('🧐 CHECKING PURSES');
          processPurses(purses, dispatch, {
            money: MONEY_BRAND_BOARD_ID,
            nft: NFT_BRAND_BOARD_ID,
          });
        }
      }

      watchPurses().catch((err) => {
        console.error('got watchPurses err', err);
      });

      async function watchOffers() {
        const on = E(walletP).getOffersNotifier();
        for await (const offers of iterateNotifier(on)) {
          console.info('📡 CHECKING OFFERS');
          const last3 = offers.slice(-3);
          console.info(last3);
          processOffers(offers, dispatch);
        }
      }
      watchOffers().catch((err) => {
        console.error('got watchOffers err', err);
      });

      // Suggest installation and brands to wallet
      await Promise.all([
        E(walletP).suggestInstallation('Installation NFT', INSTANCE_BOARD_ID),
        E(walletP).suggestInstallation('Installation', INSTALLATION_BOARD_ID),
        E(walletP).suggestIssuer('COSMOVERSE22', NFT_ISSUER_BOARD_ID),
      ]);
      dispatch({ type: 'SET_DAPP_APPROVED', payload: true });
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const onDisconnect = () => {
      dispatch({ type: 'SET_WALLET_CONNECTED', payload: true });
      walletAbort && walletAbort();
    };

    const onMessage = (data) => {
      const obj = JSON.parse(data);
      walletDispatch && walletDispatch(obj);
    };

    activateWebSocket({
      onConnect,
      onDisconnect,
      onMessage,
    });
    return deactivateWebSocket;
  }, []);

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {props.children}
      </DispatchContext.Provider>
    </Context.Provider>
  );
};

export const useAgoricState = () => {
  const state = useContext(Context);
  if (state === undefined) {
    throw new Error(
      'useAgoricState can only be called inside a ServiceProvider.',
    );
  }
  return state;
};

export const useAgoricStateDispatch = () => {
  const dispatch = useContext(DispatchContext);
  if (dispatch === undefined) {
    throw new Error(
      'useAgoricDispatch can only be called inside a ServiceProvider.',
    );
  }
  return dispatch;
};

export const useAgoricContext = () => [
  useAgoricState(),
  useAgoricStateDispatch(),
];
