export default function AboutPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 py-16 sm:py-24">
      <h1 className="font-head text-3xl sm:text-4xl font-semibold mb-8 text-text">À propos de Suguly</h1>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-text-light leading-relaxed">
        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Notre Vision</h2>
          <p>
            Suguly est le nouveau standard du shopping en ligne au Mali. Notre ambition est simple : offrir aux habitants 
            de Bamako une plateforme e-commerce fiable, locale et orientée service. Nous croyons que la confiance 
            est le premier combat du digital, c'est pourquoi nous en faisons notre priorité absolue.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Pourquoi Suguly ?</h2>
          <div className="grid sm:grid-cols-2 gap-6 not-prose">
            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8]">
              <h3 className="font-head font-bold text-text mb-2">Disponibilité confirmée</h3>
              <p className="text-sm text-text-light">Nous vérifions systématiquement la disponibilité de vos produits avant la livraison pour vous éviter toute déception.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8]">
              <h3 className="font-head font-bold text-text mb-2">Produits vérifiés</h3>
              <p className="text-sm text-text-light">Chaque article est inspecté avant expédition pour garantir qu'il correspond exactement à votre commande et à nos standards de qualité.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8]">
              <h3 className="font-head font-bold text-text mb-2">Livraison professionnelle</h3>
              <p className="text-sm text-text-light">Notre service de livraison est rapide, soigné et respectueux. Nous prenons soin de votre commande jusqu'à votre porte.</p>
            </div>
            <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#F7F7F8]">
              <h3 className="font-head font-bold text-text mb-2">Service client réactif</h3>
              <p className="text-sm text-text-light">Besoin d'aide ? Notre équipe est disponible sur WhatsApp pour répondre à toutes vos questions en temps réel.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">La simplicité avant tout</h2>
          <p>
            Pas besoin d'être un expert en technologie pour acheter sur Suguly. Choisissez vos produits, 
            commandez en quelques clics et payez simplement via Orange Money ou à la livraison. 
            Le e-commerce au Mali n'a jamais été aussi simple.
          </p>
        </section>

        <div className="pt-8 border-t border-[#E5E5E5]">
          <p className="text-sm font-medium text-text italic">Suguly — Achetez en ligne au Mali, simplement.</p>
        </div>
      </div>
    </div>
  )
}
