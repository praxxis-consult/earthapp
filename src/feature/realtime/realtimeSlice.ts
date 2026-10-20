import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface RealtimeState {
  /** True while the socket is connected: pages then stop polling and wait for events. */
  live: boolean
}

const initialState: RealtimeState = { live: false }

const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    setLive(state, action: PayloadAction<boolean>) {
      state.live = action.payload
    },
  },
})

export const { setLive } = realtimeSlice.actions
export default realtimeSlice.reducer

export const selectLive = (state: { realtime: RealtimeState }) => state.realtime.live
