import { ITrackHistoryState, IJsonDiff, IStoreEnhancer, IReduxCreateStore } from './ITypes';
import * as Actions from './Actions';
let jsonDiffPatch: IJsonDiff = require('jsondiffpatch');
let extend = require('extend');
import { compose } from 'redux';

let initialState: ITrackHistoryState = {
  stateHistory: {
    history: [],
    timestamps: [],
    actions: [],
    current: -1,
  }
};

function mergeDiff(target, diff: any[]) {
  jsonDiffPatch.patch(target, diff);
  return target;
}

function rebuildState(history: any[], position: number) {
  return history
    .slice(0, position + 1)
    .map(hydratingState => extend(true, {}, hydratingState))
    .reduce((hydratingState, diff) => mergeDiff(hydratingState, diff), {});
}

export function selectHistory(state: ITrackHistoryState = initialState, action: Actions.ISelectHistory): ITrackHistoryState {
  switch (action.type) {
    case Actions.SELECT_HISTORY:

      // Do nothing if the payload is 0 or less
      if (action.payload <= 0) {
        return state;
      }

      // We need to rebuild the regular state and append the updated history control
      let newState = rebuildState(state.stateHistory.history, action.payload);
      return extend(true, {}, newState, { stateHistory: state.stateHistory }, { stateHistory: { current: action.payload } });

    default:
      return state;
  }
};

function uploadHistory(state: ITrackHistoryState = initialState, action: Actions.IUploadHistory): ITrackHistoryState {
  switch (action.type) {
    case Actions.UPLOAD_HISTORY:
      const newState = rebuildState(action.payload.history, action.payload.history.length);
      return Object.assign({}, newState, {
        stateHistory: action.payload
      });
    default:
      return state;
  }
}

const reducerReducer = (reducers: Redux.Reducer[], state, action) =>
  reducers.reduce((previousState, reducer) => reducer(previousState, action), state);

/**
 * Add history module reducers to the root reducer
 */
export function addExtraReducers(reducer: (state, action) => any) {
  return (state, action) => reducerReducer([uploadHistory, selectHistory, reducer], state, action);
}

/**
 * Store enhancer that adds state history (stored within the state)
 */
const debugStateHistory: IStoreEnhancer = (createStore: IReduxCreateStore) =>         // Take an IReduxCreateStore
    (reducer: Redux.Reducer, state) => createStore(addExtraReducers(reducer), state);    // Return an IReduxCreateStore

export default debugStateHistory;



