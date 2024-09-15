import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '@/lib/store';
import { LoginRequestDto, LoginResponseDto } from '@/api/login/login';
import { StatusCodes } from 'http-status-codes';
import { IsLoggedInResponseDto } from '@/api/login/isLoggedIn';
import { setUser } from '@/module/user';
import { API, setAuthorizationToken } from '@/api/api';

interface SessionSlice {
  logged: boolean;
  token: string | null;
}

const USER_TOKEN = 'buckless/refund/user/token';

export const sessionSlice = createSlice({
  name: 'session',
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      setAuthorizationToken(action.payload ?? '');
      state.token = action.payload;
      state.logged = !!action.payload;
    },
  },
  initialState: { logged: false, token: null } as SessionSlice,
});

const { setToken: _setToken } = sessionSlice.actions;

export const login =
  (api: API, login: string, password: string, cb: (error?: number) => void): AppThunk =>
  (dispatch) =>
    api
      .post<LoginRequestDto, LoginResponseDto>('auth/login', {
        login,
        password,
      })
      .on('success', async (body) => {
        dispatch(setToken(body.access_token));
        dispatch(setUser(body));
        cb();
      })
      .on(StatusCodes.UNAUTHORIZED, (body) => {
        console.error('Wrong credentials', body);
        cb(body.errorCode ?? StatusCodes.UNAUTHORIZED);
      })
      .on('error', () => {
        cb(StatusCodes.INTERNAL_SERVER_ERROR);
      });

export const logout = (): AppThunk => (dispatch) => dispatch(setToken(null));

export const isLoggedIn = (state: RootState) => state.session.logged;

export const autoLogin =
  (api: API): AppThunk =>
  async (dispatch) => {
    const token = localStorage.getItem(USER_TOKEN);
    if (!token) {
      return;
    }
    setAuthorizationToken(token);
    api.get<IsLoggedInResponseDto>('auth/login').on('success', async (body) => {
      if (body.valid) {
        dispatch(setToken(token));
        dispatch(setUser(body));
      }
    });
  };

export function setToken(token: string | null): AppThunk {
  return async (dispatch) => {
    localStorage.setItem(USER_TOKEN, token ?? '');
    dispatch(_setToken(token));
    if (token === null) {
      setUser(null);
      return;
    }
  };
}

export default sessionSlice.reducer;
