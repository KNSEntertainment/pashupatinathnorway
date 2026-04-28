import MembersClient from './MembersClient';

export const metadata = {
  title: 'Members | Pashupatinath Norway Temple',
  description: 'Meet the members of Pashupatinath Norway Temple. Browse our executive members, active members, and general members. Connect with our community.',
  keywords: ['members', 'executive', 'community', 'Pashupatinath Norway Temple', 'team', 'leadership'],
  openGraph: {
    title: 'Members | Pashupatinath Norway Temple',
    description: 'Meet the members of Pashupatinath Norway Temple and connect with our community.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Members | Pashupatinath Norway Temple',
    description: 'Browse our community of members and leaders.',
  },
};

export default function Members() {
  return <MembersClient />;
} 
