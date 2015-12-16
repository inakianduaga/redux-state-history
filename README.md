Redux State History
===================

> Redux store enhancers for tracking and visualizing state changes & debugging remote sessions.

Inspired by the [redux devtools](https://github.com/gaearon/redux-devtools) and [redux slider monitor](https://github.com/calesce/redux-slider-monitor), this package
provides **state** recording abilities (i.e. "time travel") on production environments, and recording/playback locally.

## Features:

- Record state history efficiently either locally or on production.
- Only state diffs are stored for each state change (untested for large state/long running applications).
- On production, use recording store enhancer only. Locally, use additional debug slider component to navigate/interact with the history.
- Import/export histories, playback them back locally, including realtime speed.
- Time-travel is "pure", that is, state history changes **without refiring the actual actions** that produced said change (so still works for impure/async actions).

## State history tracker:

A store enhancer provides the history tracking on each state change, recording the state change, the timestamp of the change, and the action type that produced said change.
This is independent of the debug slider and can be used in production, requiring minimum dependencies (~16kb gzipped).

- The actual state history is stored in the redux store under `.stateHistory` key.

### Installation:

The state history tracker is installed as a store enhancer, in the same way other redux store enhancers like `applyMiddleware`, or the `redux devtools` are added

```ts
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers/index';
import DevTools from '../containers/DevTools.tsx';
import thunk from 'redux-thunk';
let createHistory = require('history/lib/createHashHistory');
let createLogger = require('redux-logger');
let { syncReduxAndRouter } = require('redux-simple-router');
import trackHistory from './Middleware';

const finalCreateStore = compose(
  debugStateHistory,
  applyMiddleware(thunk),
  applyMiddleware(createLogger()),
  trackHistory()                              // STATE HISTORY STORE ENHANCER
  DevTools.instrument()
)(createStore);

export const history = createHistory();

export default function configureStore() {
  const store = finalCreateStore(rootReducer);
  syncReduxAndRouter(history, store);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
```

## Dev slider tool

This component provides state history interactivity, plus allows importing and exporting state sessions.

### Installation:

**Store enhancer**:

The debug component needs a store enhancer to work (it uses it to replace the current state by whichever state is selected from the history, so needs root-level access).
To install it, you follow the same logic as the state history tracker above

```ts
// ... some code
const finalCreateStore = compose(
  debugStateHistory,                          // DEBUG SLIDER STORE ENHANCER
  applyMiddleware(thunk),
  applyMiddleware(createLogger()),
  trackHistory()                              // STATE HISTORY STORE ENHANCER
  DevTools.instrument()
)(createStore);
// ... more code
```

**Component**

You can include the `StateHistoryDevTool` component anywhere in your application as long as you provide the `store.stateHistory` properties. For example, in your
root component, you can do

```tsx
import * as React from 'react';
import { Provider } from 'react-redux';
import StateHistoryDevTool from './Component.tsx';
import Routes from '../routes.tsx';
import { Router } from 'react-router';
import { history } from '../store/configureStore.dev';

type IRootProps = {
  store: any
}

export default class Root extends React.Component<IRootProps, any> {
  public render() {
    const { store } = this.props;
    return (
        <Provider store={store}>
          <div>
            <Router history={ history }>
              { Routes }
            </Router>
            <StateHistoryDevTool { ...store.stateHistory } />
          </div>
        </Provider>
    );
  }
};
```

#### Note: Combine Reducers:

If you use combineReducers to set up your root reducer, you need to add a dummy "identity" reducer under the `stateHistory` key, otherwise the combinedReducers function will complain
about that key not being predefined and drop it from the state.

```ts
const rootReducer = combineReducers({
  key: someReducer,
  key2: anotherReducer,
  ...
  stateHistory: (state = {}, action) => state, // dummy reducer to prevent combineReducers checks from throwing error
});
```

