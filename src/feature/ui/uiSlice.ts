import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface UiState {
  isLoading: boolean
  toast: { title: string; body?: string } | null
}

const initialState: UiState = { isLoading: false, toast: null }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    showToast(state, action: PayloadAction<UiState['toast']>) {
      state.toast = action.payload
    },
    clearToast(state) {
      state.toast = null
    },
  },
})

export const { setLoading, showToast, clearToast } = uiSlice.actions
export default uiSlice.reducer
