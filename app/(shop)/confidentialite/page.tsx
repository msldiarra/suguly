export default function PrivacyPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 py-16 sm:py-24">
      <h1 className="font-head text-3xl sm:text-4xl font-semibold mb-4 text-text">Politique de Confidentialité</h1>
      <p className="text-xs text-text-light mb-12 italic">Dernière mise à jour : 22 Avril 2026</p>
      
      <div className="space-y-10 text-text-light leading-relaxed text-sm sm:text-base">
        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">Collecte des informations</h2>
          <p>
            Nous recueillons des informations lorsque vous vous inscrivez sur notre site, passez une commande 
            ou participez à un concours. Les informations recueillies incluent votre nom, votre numéro de 
            téléphone et votre adresse de livraison.
          </p>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">Utilisation des informations</h2>
          <p>
            Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Personnaliser votre expérience et répondre à vos besoins individuels</li>
            <li>Améliorer notre service client et vos besoins de prise en charge</li>
            <li>Vous contacter par téléphone ou WhatsApp concernant votre commande</li>
            <li>Traiter vos transactions</li>
          </ul>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">Confidentialité du commerce électronique</h2>
          <p>
            Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations 
            personnelles ne seront pas vendues, échangées, transférées, ou données à une autre société pour 
            n'importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre 
            à une demande et / ou une transaction, comme pour expédier une commande.
          </p>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">Consentement</h2>
          <p>
            En utilisant notre site, vous consentez à notre politique de confidentialité.
          </p>
        </section>
      </div>
    </div>
  )
}
