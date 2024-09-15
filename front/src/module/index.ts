import { combineReducers } from '@reduxjs/toolkit';
import user from './user';
import session from './session';
import pageSettings from './pageSettings';

export default combineReducers({ user, session, pageSettings });
