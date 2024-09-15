import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector } from '@/lib/hooks';
import { AppThunk } from '@/lib/store';
import { API } from '@/api/api';
import { SetIbanRequestDto } from '@/api/user/setIban';

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

export const registerIban =
  (api: API, iban: string): AppThunk =>
  (dispatch) =>
    api
      .put<SetIbanRequestDto>('/user/iban', {
        data: iban,
      })
      .on('success', async () => {
        dispatch(setIbanRegistered());
      })
      .on(401, (body) => console.error('Wrong credentials', body))
      .on(400, (body) => console.error('Bad request', body));

export default userSlice.reducer;
