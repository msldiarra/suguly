export default function TermsPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 py-16 sm:py-24">
      <h1 className="font-head text-3xl sm:text-4xl font-semibold mb-4 text-text">Conditions Générales de Vente</h1>
      <p className="text-xs text-text-light mb-12 italic">Dernière mise à jour : 22 Avril 2026</p>
      
      <div className="space-y-10 text-text-light leading-relaxed text-sm sm:text-base">
        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
            Suguly et toute personne effectuant un achat sur le site.
          </p>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">2. Produits</h2>
          <p>
            Les produits proposés sont ceux qui figurent sur le site Suguly, dans la limite des stocks disponibles. 
            Chaque produit est accompagné d'un descriptif. Les photographies sont les plus fidèles possibles mais 
            n'engagent pas le Vendeur.
          </p>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">3. Prix</h2>
          <p>
            Les prix figurant sur le site sont des prix en Francs CFA (XOF). Suguly se réserve le droit de modifier 
            ses prix à tout moment, étant toutefois entendu que le prix figurant sur le site le jour de la commande 
            sera le seul applicable à l'acheteur.
          </p>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">4. Paiement</h2>
          <p>
            Le règlement de vos achats s'effectue par Orange Money ou en espèces à la livraison. Le paiement par 
            Orange Money est sécurisé et s'effectue via l'interface dédiée.
          </p>
        </section>

        <section>
          <h2 className="font-head text-lg font-semibold text-text mb-3">5. Responsabilité</h2>
          <p>
            Le vendeur, dans le processus de vente à distance, n'est tenu que par une obligation de moyens. Sa 
            responsabilité ne pourra être engagée pour un dommage résultant de l'utilisation du réseau Internet 
            tel que perte de données, intrusion, virus, rupture du service, ou autres problèmes involontaires.
          </p>
        </section>
      </div>
    </div>
  )
}
