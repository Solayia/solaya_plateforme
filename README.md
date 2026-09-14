# Solaya Collection

Site statique V1, landing propriétaires, catalogue vide, modèle logement et guide Toulouse. Aucun paiement ni envoi serveur en production. Le formulaire prépare un mail relisible avant envoi, sans stockage.

## Ajouter un bien
Compléter dist/properties.json avec des objets : id, published (false jusqu’à validation), name, city, description, guests, bedrooms, bathrooms, amenities (liste), photos (chemins locaux ou HTTPS), bookingUrl (URL HTTPS du moteur validé). Publier seulement après accord propriétaire, exactitude des photos/descriptions, contrat et branchement du moteur testé. Les données sont publiques : aucun accès, code serrure, téléphone personnel ou document d’identité dans ce JSON.

Le moteur externe reste l’autorité pour les prix, le stock, le règlement et les confirmations. Pas de reconstitution de disponibilité à partir de données périmées. Sans bookingUrl, aucun bouton de paiement. Le catalogue ne publie aucun bien fictif. L’image principale illustre une ambiance, pas un logement disponible.

## Avant diffusion commerciale publique
Compléter les mentions légales avec les informations exactes de Solayia et de l’hébergeur, arrêter le tarif HT/TTC, le périmètre, les contrats et le contact de service. Déployer sur le domaine choisi, configurer e-mail et mesure d’audience seulement si décidés. La présente version Sites reste privée.

## Réservation : recette à faire sur comptes autorisés
Deux propriétaires distincts ; paiement attribué au bon compte ; dates bloquées sur les canaux ; annulation et remboursement cohérents ; échec de paiement ; nouvelle réception du même événement ; conflit de dates ; modification d’un séjour ; rapprochement commission/loyer/ménage/taxe. Ne pas afficher un succès de réservation à partir du seul retour navigateur.
