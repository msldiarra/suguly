import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Suguly — E-commerce Bamako',
    short_name: 'Suguly',
    description: 'Achetez électronique, mode, beauté et plus à Bamako. Livraison rapide, paiement Orange Money.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1A1A1A',
    icons: [
      {
        src: '/ico.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/ico.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/ico.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
