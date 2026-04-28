import UnifiedGalleryClient from './UnifiedGalleryClient';

export const metadata = {
  title: 'Gallery | PNSB-Norway',
  description: 'Explore photos and videos from PNSB-Norway events, activities, and community gatherings. Browse our collection of memories and moments.',
  keywords: ['gallery', 'photos', 'videos', 'PNSB-Norway', 'events', 'activities', 'community'],
  openGraph: {
    title: 'Gallery | PNSB-Norway',
    description: 'Explore photos and videos from PNSB-Norway events and community activities.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | PNSB-Norway',
    description: 'Browse our collection of photos and videos from PNSB-Norway events.',
  },
};

export default function UnifiedGallery() {
  return <UnifiedGalleryClient />;
}
