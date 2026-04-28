import AuthFormClient from './AuthFormClient';

export const metadata = {
  title: 'Login | Pashupatinath Norway Temple',
  description: 'Sign in to your Pashupatinath Norway Temple account to access member dashboard, profiles, and exclusive content.',
  keywords: ['login', 'sign in', 'Pashupatinath Norway Temple', 'member account', 'dashboard'],
  openGraph: {
    title: 'Login | Pashupatinath Norway Temple',
    description: 'Sign in to your Pashupatinath Norway Temple account to access member dashboard and exclusive content.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Login | Pashupatinath Norway Temple',
    description: 'Sign in to your Pashupatinath Norway Temple account',
  },
};

export default function AuthForm() {
  return <AuthFormClient />;
}
