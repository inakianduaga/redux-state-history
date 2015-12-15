import { Action as StandardAction, ITrackHistoryStateInner } from './ITypes';

export const SELECT_HISTORY = 'SELECT_HISTORY';
export const UPLOAD_HISTORY = 'UPLOAD_HISTORY';

export interface ISelectHistory extends StandardAction {
  payload: number;
}

export interface IUploadHistory extends StandardAction {
  payload: ITrackHistoryStateInner;
}

export function selectHistory(number: number): ISelectHistory {
  return {
    type: SELECT_HISTORY,
    payload: number,
    meta: 'SKIP_HISTORY_TRACKING',
  };
};

export function uploadHistory(history: ITrackHistoryStateInner): IUploadHistory {
  return {
    type: UPLOAD_HISTORY,
    payload: history,
    meta: 'SKIP_HISTORY_TRACKING',
  };
};


