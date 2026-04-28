import MembersClient from './MembersClient';

export const metadata = {
  title: 'Members | PNSB-Norway',
  description: 'Meet the members of PNSB-Norway. Browse our executive members, active members, and general members. Connect with our community.',
  keywords: ['members', 'executive', 'community', 'PNSB-Norway', 'team', 'leadership'],
  openGraph: {
    title: 'Members | PNSB-Norway',
    description: 'Meet the members of PNSB-Norway and connect with our community.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Members | PNSB-Norway',
    description: 'Browse our community of members and leaders.',
  },
};

export default function Members() {
  return <MembersClient />;
} 
