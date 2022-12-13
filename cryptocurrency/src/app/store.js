import { configureStore } from "@reduxjs/toolkit";

import { cryptoApi } from "../serveces/cryptoAPI";
import { cryptoNewsApi } from "../serveces/cryptoNewsApi";

export default configureStore({
    reducer:{
        [cryptoApi.reducerPath]: cryptoApi.reducer,
        [cryptoNewsApi.reducerPath]: cryptoNewsApi.reducer,
    },
})