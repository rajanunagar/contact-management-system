import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "./features/user/userSlice";
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage,
}
const allReducers = combineReducers({
    user: userSlice,
})
const persistedReducer = persistReducer(persistConfig, allReducers);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),

});

export const persistor = persistStore(store);   