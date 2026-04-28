import AuthFormClient from './AuthFormClient';

export const metadata = {
  title: 'Login | PNSB-Norway',
  description: 'Sign in to your PNSB-Norway account to access member dashboard, profiles, and exclusive content.',
  keywords: ['login', 'sign in', 'PNSB-Norway', 'member account', 'dashboard'],
  openGraph: {
    title: 'Login | PNSB-Norway',
    description: 'Sign in to your PNSB-Norway account to access member dashboard and exclusive content.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Login | PNSB-Norway',
    description: 'Sign in to your PNSB-Norway account',
  },
};

export default function AuthForm() {
  return <AuthFormClient />;
}
