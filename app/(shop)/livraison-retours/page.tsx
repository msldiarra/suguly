export default function ShippingPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 py-16 sm:py-24">
      <h1 className="font-head text-3xl sm:text-4xl font-semibold mb-8 text-text">Livraison & Retours</h1>
      
      <div className="space-y-10 text-text-light leading-relaxed">
        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Délais de Livraison</h2>
          <p className="mb-4">
            Nous nous efforçons de livrer vos commandes dans les plus brefs délais à travers Bamako :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Livraison Standard :</strong> 24h à 48h ouvrées.</li>
            <li><strong>Livraison Express :</strong> Le jour même pour toute commande passée avant 11h.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Zones & Tarifs</h2>
          <p>
            Les frais de livraison sont calculés automatiquement lors de votre commande en fonction de votre 
            quartier. Nous couvrons l'ensemble du district de Bamako ainsi que les zones périphériques proches.
          </p>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Politique de Retour</h2>
          <p className="mb-4">
            Votre satisfaction est notre priorité. Si un article ne vous convient pas, vous disposez de 
            <strong> 48 heures </strong> après la réception pour demander un échange ou un retour, sous conditions :
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>L'article doit être dans son emballage d'origine, non utilisé et non lavé.</li>
            <li>Les articles d'hygiène et sous-vêtements ne sont ni repris ni échangés.</li>
            <li>Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-xl font-semibold text-text mb-4">Besoin d'aide ?</h2>
          <p>
            Pour toute question relative à votre commande, notre service client est à votre disposition 
            via WhatsApp du lundi au samedi, de 8h à 20h.
          </p>
        </section>
      </div>
    </div>
  )
}
