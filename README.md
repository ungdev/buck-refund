# Plateforme de remboursement BuckUTT

Ce projet a pour but de proposer aux étudiants un remboursement de leur solde [buckutt](https://github.com/buckless/buckutt). Ce remboursement sera effectué par virement bancaire à l'iban de leur choix.

## Configuration

Pour configurer le service, il suffit de d'assigner les variables d'environnement suivantes :

- DATABASE_URL: l'url de la base de données mariadb/mysql (de type `mysql://user:pw@host:3306/db`)
- JWT_SECRET: Un secret pour les Json Web Tokens
- JWT_EXPIRES_IN: La durée de validité des Json Web Tokens (aka. d'une session)
- CRYPTO_PUBLIC_KEY: La clé publique générée pour le service (clé RSA de longueur 4096, sans passphrase, formats spki et pkcs8). _La clé privée ne doit en aucun cas être mise sur ce serveur ! C'est au trésorier de la posséder et de l'utiliser sur le front quand il déchiffre un export._
- BALANCE_MIN_VALUE: Le montant minimal à avoir sur buckutt pour être éligible au remboursement
- LOCKER_SERVICE_KEY: Un secret pour le service locker
- FRONT_URL: L'URL du front
- MAGIC_LINK_VALIDITY: La durée de validité en ms, du lien de connexion envoyé par email
- SMTP_HOST: L'hôte SMTP à utiliser
- SMTP_PORT: Le port SMTP à utiliser
- SMTP_USER: L'utilisateur SMTP à utiliser
- SMTP_PASS: Le mot de passe de l'utilisateur SMTP
- SMTP_FROM: Le nom à afficher en tant qu'expéditeur dans le mail

## Démarrage du service

Une fois que le service a été configuré, il faut démarrer la base de données et générer sa structure (par exemple, en utilisant `pnpm db:push`).

Ensuite on peut démarrer l'api `pnpm start:prod` et le front `pnpm start`
