export type IJsonDiff = {
  diff: (left, right) => any
  patch: (target: any, delta: any) => any,
};

export interface ITrackHistoryState {
  stateHistory: ITrackHistoryStateInner;
};

export interface ITrackHistoryStateInner {
  history: any[];
  timestamps: number[];
  actions: string[];
  current: number;
};

/**
 * Redux standard action
 * @link https://github.com/kolodny/redux-standard-action
 */
export interface Action {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: string;
};

export type IStoreEnhancer = (createStore: IReduxCreateStore) => IReduxCreateStore;
export type IReduxCreateStore = (reducer: Redux.Reducer, initialState?: any) => Redux.Store;
export type ITrackHistoryStoreEnhancer = (hydratingState?: ITrackHistoryState) => IStoreEnhancer;
