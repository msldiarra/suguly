import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto py-20 px-4 text-center">
      <p className="font-head text-6xl font-black text-primary mb-4">404</p>
      <h1 className="font-head text-2xl font-extrabold mb-2">Page introuvable</h1>
      <p className="text-text-light text-sm mb-6">La page que vous cherchez n&apos;existe pas.</p>
      <Link href="/" className="inline-block px-7 py-3 bg-primary text-white rounded-xl font-extrabold text-sm">
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
