import {
  createStore,
  applyMiddleware,
  Middleware
} from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import logger from 'redux-logger'
import { routerMiddleware as createConnectedMiddleware } from 'connected-react-router'
import { createMemoryHistory } from 'history'
import {
  forwardToRenderer,
  triggerAlias,
  forwardToMain,
  getInitialStateRenderer
} from 'electron-redux'
import createNodeLogger from 'redux-cli-logger'
import { persistStore, persistReducer } from 'redux-persist'
import createElectronStorage from 'redux-persist-electron-storage'
import { createEpicMiddleware } from 'redux-observable'

import rootEpic from './rootEpic'
import rootReducer from './rootReducer'
import { isDevelopment, isRenderer } from '../env'
import { RootAction, RootState } from 'AppReduxTypes'

const epicMiddleware = createEpicMiddleware<
  RootAction,
  RootAction,
  RootState
>()

export const history = createMemoryHistory()
const connectRouterMiddleware = createConnectedMiddleware(
  history
)

// configure middlewares
const devMiddlewares = [
  isRenderer
    ? logger
    : createNodeLogger({
        prevColor: 'red',
        actionColor: 'white',
        nextColor: 'green'
      })
]

const middlewares = [
  epicMiddleware,
  connectRouterMiddleware,
  ...(isDevelopment ? devMiddlewares : [])
]

const generateMiddlewares = (): Middleware[] =>
  isRenderer
    ? [forwardToMain, ...middlewares]
    : [triggerAlias, ...middlewares, forwardToRenderer]

const enhancer = composeWithDevTools(
  applyMiddleware(...generateMiddlewares())
)

const initialState = isRenderer
  ? getInitialStateRenderer()
  : {}

const persistConfig = {
  key: 'root',
  storage: createElectronStorage(),
  blacklist: ['router']
}

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer(history)
)

const store = createStore(
  persistedReducer,
  initialState,
  enhancer
)

epicMiddleware.run(rootEpic)

export const persistor = persistStore(store)
export default store
