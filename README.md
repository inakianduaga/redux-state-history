Redux State History
===================

[![Build Status][travis-image]][travis-url]

> Redux store enhancers / component for tracking and visualizing state changes & debugging remote sessions.

Inspired by the [redux devtools](https://github.com/gaearon/redux-devtools) and [redux slider monitor](https://github.com/calesce/redux-slider-monitor), this package
provides **state** recording/playback (i.e. "time travel") abilities for [redux](https://github.com/rackt/redux) applications.

## [DEMO](http://inakianduaga.github.io/redux-state-history-example/)

## Features:

- **Record state history efficiently** locally / on production:  Only state diffs are stored for each state change (performance untested for large state/long running applications).
- **Decoupled recording/debugging code**: On production include only recording store enhancer for small footprint. Locally, use additional debug slider component to navigate/interact with the history.
- **Import/Export histories**:  Play them back locally, including realtime speed.
- **Time-travel is "pure"**: That is, state history changes *without refiring the actual actions* that produced said change (so still works for impure/async actions).

## State history tracker:

A store enhancer provides the history tracking on each state change, recording the state change, the timestamp of the change, and the action type that produced said change.
This is independent of the debug slider and can be used in production, requiring minimum dependencies (~16kb gzipped).

- The actual state history is stored in the redux store under `.stateHistory` key.

### Installation:

The state history tracker is installed as a store enhancer, in the same way other redux store enhancers like `applyMiddleware`, or the `redux devtools` are added. For example

```ts
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers/index';
import DevTools from '../containers/DevTools.tsx';
import thunk from 'redux-thunk';
let createHistory = require('history/lib/createHashHistory');
let createLogger = require('redux-logger');
let { syncReduxAndRouter } = require('redux-simple-router');
import trackHistory from 'redux-state-history/lib/stateHistory'; // THIS INCLUDES ONLY STATE HISTORY TRACKING FOR PROUCTION

const finalCreateStore = compose(
  applyMiddleware(thunk),
  applyMiddleware(createLogger()),
  trackHistory(),                              // STATE HISTORY STORE ENHANCER (DO NOT INCLUDE ON PRODUCTION)
  DevTools.instrument(),
)(createStore);

export const history = createHistory();

export default function configureStore() {
  const store = finalCreateStore(rootReducer);
  syncReduxAndRouter(history, store);

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

// ... imports
import { Devtool as debugStateHistory, trackHistory } from 'redux-state-history'; // THIS BUNDLE INCLUDES EVERYTHING, USE ONLY ON DEV

// ...
const finalCreateStore = compose(
  debugStateHistory,                          // STATE HISTORY DEV TOOLS STORE ENHANCER
  applyMiddleware(thunk),
  applyMiddleware(createLogger()),
  trackHistory()                              // STATE HISTORY STORE ENHANCER
  DevTools.instrument()
)(createStore);
// ...
```

**Component**

You can include the `StateHistoryDevTool` component anywhere in your application as long as you provide the `store.stateHistory` properties. For example, in your
root component, you can do

```tsx
import * as React from 'react';
import { Provider } from 'react-redux';
import  from './Component.tsx';
import Routes from '../routes.tsx';
import { Router } from 'react-router';
import { history } from '../store/configureStore.dev';
import { Component as StateHistoryDevTool } from 'redux-state-history'; // IMPORTS STATE HISTORY DEBUG COMPONENT

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
            <StateHistoryDevTool { ...store.stateHistory } /> {/* Place anywhere you like */}
          </div>
        </Provider>
    );
  }
};
```

#### Supress build warnings:

Due to a [jsondiffpatch library issue](https://github.com/benjamine/jsondiffpatch/issues/76),  the following has to be added to the webpack config to prevent warnings during build

```js
  module: {
      exprContextCritical: false, // To disable jsondiff warning
  }
```

#### Note: On Combine Reducers:

If you use redux's `combineReducers` to set up your root reducer, you need to add a dummy "identity" reducer under the `stateHistory` key, otherwise the combinedReducers function [will complain](https://github.com/rackt/redux/pull/879)
about that key not being predefined and drop it from the state.

```ts
const rootReducer = combineReducers({
  key: someReducer,
  key2: anotherReducer,
  ...
  stateHistory: (state = {}, action) => state, // dummy identity reducer to prevent combineReducers checks from throwing error
});
```

[travis-url]: https://travis-ci.org/inakianduaga/redux-state-history
[travis-image]: https://travis-ci.org/inakianduaga/redux-state-history.svg?branch=master
