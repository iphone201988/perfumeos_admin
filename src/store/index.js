
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { apis } from "../api";

const rootReducer = combineReducers({
  [apis.reducerPath]: apis.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apis.middleware),
});

export default store;