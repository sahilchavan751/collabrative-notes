import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/signup'],
      disallow: ['/dashboard', '/notes/', '/profile', '/settings'],
    },
    sitemap: 'https://realno.vercel.app/sitemap.xml',
  }
}
