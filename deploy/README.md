# Solaya — préproduction VPS

Cette branche porte le projet Sites vers Next.js autonome et Node.js 24.
L'original Sites et ses cinq commits restent dans l'historique de `main`.

## Accès et périmètre

- Docker Compose : `compose.preprod.yml`.
- Serveur HTTP lié uniquement à `127.0.0.1:3100` sur le VPS.
- Tunnel SSH : `ssh -N -L 127.0.0.1:3100:127.0.0.1:3100 root@ADRESSE_VPS`.
- Ouvrir `http://localhost:3100` dans une fenêtre privée.
- Authentification HTTP Basic dédiée à la préproduction, utilisateur `kevin`, mot de passe aléatoire de 256 bits. Seule son empreinte SHA-256 est configurée dans `.env` sur le VPS. Le transport extérieur est chiffré par SSH.
- Aucun en-tête d'identité ChatGPT fourni par le client n'est accepté.
- Tous les chemins, API et fichiers statiques passent par l'authentification.
- La production publique n'est pas activée : elle demandera une authentification avec comptes et sessions adaptée, un domaine, HTTPS et une base distincte. Ne pas exposer ce service HTTP publiquement.

## Données

Volume Docker `solaya-preprod_preprod-data`, fichier `/data/solaya.sqlite`.
Les migrations SQL sont appliquées transactionnellement et une seule fois à la première utilisation de la base.
Les mises à jour CRM et leur historique restent atomiques, avec vérification de version.
Cette base démarre vide ; les données vivantes de Sites n'ont pas été importées.
Les deux guides de démonstration sont intégrés. Le document Google Docs reste un lien externe.

## Déploiement

Installer le projet dans `/opt/solaya-preprod` et créer `.env` (droits 600) :

```
PREPROD_PASSWORD_SHA256=<empreinte SHA-256 du mot de passe aléatoire>
```

```
docker compose -f compose.preprod.yml build
docker compose -f compose.preprod.yml up -d
docker compose -f compose.preprod.yml ps
```

Ne jamais utiliser `down -v` pour une mise à jour : cela supprime la base.
Les secrets et la base ne vont pas dans GitHub ni dans l'image Docker.

## Sauvegarde avant une mise à jour

Arrêter le service pour obtenir une copie cohérente du volume, puis le redémarrer :

```
mkdir -p backups
chmod 700 backups
docker compose -f compose.preprod.yml stop web
docker run --rm -v solaya-preprod_preprod-data:/data:ro -v "$PWD/backups:/backup" node:24-bookworm-slim sh -c 'tar czf /backup/preprod-data.tgz -C /data .'
docker compose -f compose.preprod.yml start web
```

Conserver des copies datées hors du VPS avant toute utilisation avec de vraies données.
Pour restaurer, arrêter le service, sauvegarder d'abord son état actuel, puis restaurer l'archive dans ce même volume et remettre les droits UID/GID 1000.

## Validation

`node --test tests/vps.test.mjs` : migrations répétables, persistance, rollback, contrôle de concurrence et authentification fermée par défaut.
`node tests/vps-http.mjs` : tests de la vraie application via un tunnel, avec les identifiants transmis par variables d'environnement ; suppression limitée au prospect de test créé pendant cette exécution.
