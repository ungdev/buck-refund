'use client';

import { useAppSelector } from '@/lib/hooks';
import { usePathname, useRouter } from 'next/navigation';

interface RouteConditionState {
  loggedIn: boolean;
  administrate: boolean;
}

type RouteRedirectionRules = {
  [key: string]: Array<{ condition: (state: RouteConditionState) => boolean; redirectTo: string }>;
};

const redirectionRules: RouteRedirectionRules = {
  '/login': [
    { condition: (state) => state.loggedIn && !state.administrate, redirectTo: '/' },
    { condition: (state) => state.loggedIn && state.administrate, redirectTo: '/admin' },
  ],
  '/admin': [
    { condition: (state) => !state.loggedIn, redirectTo: '/login' },
    { condition: (state) => state.loggedIn && !state.administrate, redirectTo: '/' },
  ],
  '/': [
    { condition: (state) => !state.loggedIn, redirectTo: '/login' },
    { condition: (state) => state.loggedIn && state.administrate, redirectTo: '/admin' },
  ],
  '/magic': [{ condition: (state) => state.loggedIn, redirectTo: '/' }],
};

export default function Redirecter() {
  const pathname = usePathname();
  const router = useRouter();
  const state = {
    loggedIn: useAppSelector((state) => state.session.logged),
    administrate: useAppSelector((state) => state.user?.operation === 'administrate'),
  };
  const rules = redirectionRules[pathname];
  if (!rules) {
    return false;
  }
  for (const condition of rules) {
    if (condition.condition(state)) {
      router.push(condition.redirectTo);
    }
  }
  return false;
}
