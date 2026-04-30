import PublicationClient from './PublicationClient';

export const metadata = {
  title: 'Publications | Pashupatinath Norway Temple',
  description: 'Explore official publications, reports, and documents from Pashupatinath Norway Temple. Browse our collection of community announcements and organizational publications.',
  keywords: ['publications', 'reports', 'documents', 'Pashupatinath Norway Temple', 'announcements', 'community', 'official'],
  openGraph: {
    title: 'Publications | Pashupatinath Norway Temple',
    description: 'Explore official publications and documents from Pashupatinath Norway Temple.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Publications | Pashupatinath Norway Temple',
    description: 'Browse official publications and documents from Pashupatinath Norway Temple.',
  },
};

export default function Publicaiton() {
  return <PublicationClient />;
}
