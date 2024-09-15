import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector } from '@/lib/hooks';
import { AppThunk } from '@/lib/store';

export interface UserSlice {
  firstName: string;
  currentBalance: number;
  paymentMethodRegistered: boolean;
}

export const userSlice = createSlice({
  name: 'user',
  reducers: {
    setUser: (state, action: PayloadAction<UserSlice | null>) => action.payload,
  },
  initialState: null as UserSlice | null,
});

const { setUser: _setUser } = userSlice.actions;

export function setUser(user: UserSlice | null): AppThunk {
  return async (dispatch) => {
    dispatch(_setUser(user));
  };
}

export function setIbanRegistered(): AppThunk {
  return async (dispatch, getState) => {
    const user = getState().user;
    if (!user) return;
    dispatch(_setUser({ ...user, paymentMethodRegistered: true }));
  };
}

export const useConnectedUser = () => useAppSelector((state) => state.user);

export default userSlice.reducer;
