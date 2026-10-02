import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isLoading: false,
    toast: null,
  },
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload
    },
    showToast(state, action) {
      state.toast = action.payload
    },
    clearToast(state) {
      state.toast = null
    },
  },
})

export const { setLoading, showToast, clearToast } = uiSlice.actions
export default uiSlice.reducer
