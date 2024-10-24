import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userInfo: {
        username: null,
        email: null,
        id: null,
        isAdmin: false
    }
}
const userSlice = createSlice({
    name: 'user1',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.userInfo = action.payload;
        },
        clearUser: (state, action) => {
            state.userInfo = {
                username: null,
                email: null,
                id: null,
                isAdmin: false
            }
        }
    }
})

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;   