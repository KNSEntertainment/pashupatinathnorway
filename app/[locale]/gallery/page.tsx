import UnifiedGalleryClient from './UnifiedGalleryClient';

export const metadata = {
  title: 'Gallery | Pashupatinath Norway Temple',
  description: 'Explore photos and videos from Pashupatinath Norway Temple events, activities, and community gatherings. Browse our collection of memories and moments.',
  keywords: ['gallery', 'photos', 'videos', 'Pashupatinath Norway Temple', 'events', 'activities', 'community'],
  openGraph: {
    title: 'Gallery | Pashupatinath Norway Temple',
    description: 'Explore photos and videos from Pashupatinath Norway Temple events and community activities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | Pashupatinath Norway Temple',
    description: 'Browse our collection of photos and videos from Pashupatinath Norway Temple events.',
  },
};

export default function UnifiedGallery() {
  return <UnifiedGalleryClient />;
}
