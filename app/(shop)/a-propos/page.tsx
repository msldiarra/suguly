export default function AboutPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 py-16 sm:py-24">
      <h1 className="font-head text-3xl sm:text-4xl font-semibold mb-8 text-text">À propos de Suguly</h1>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-text-light leading-relaxed">
        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Notre Vision</h2>
          <p>
            Suguly est né d'une ambition simple : offrir aux habitants de Bamako une expérience d'achat en ligne
            à la fois fluide, fiable et élégante. Nous croyons que la qualité ne doit pas seulement se trouver
            dans les produits, mais aussi dans la manière dont ils sont présentés et livrés.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">L'Excellence Locale</h2>
          <p>
            En tant qu'acteur local, nous comprenons les besoins spécifiques du marché malien. C'est pourquoi
            nous avons intégré des solutions de paiement familières comme Orange Money et un service de
            livraison qui connaît chaque quartier de notre capitale.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Notre Engagement</h2>
          <p>
            Chaque produit sur Suguly est sélectionné avec soin. Nous travaillons en étroite collaboration
            avec nos partenaires pour garantir l'authenticité et la qualité de chaque article qui quitte
            notre entrepôt pour rejoindre votre foyer.
          </p>
        </section>

        <div className="pt-8 border-t border-[#E5E5E5]">
          <p className="text-sm font-medium text-text">Suguly.</p>
        </div>
      </div>
    </div>
  )
}
