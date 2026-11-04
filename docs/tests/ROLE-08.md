### [ROLE-08] [Un collaborateur, un technicien ou un responsable ne peut pas accéder aux pages d'administration par l'URL directe]

- **Objectif :** Vérifier que les pages d'administration (comptes, rôles, catégories, paramètres) restent réservées à l'administrateur, même en saisissant directement leur URL.
- **Préparation :** Un compte collaborateur, un compte technicien et un compte responsable support existants, page de départ /login, aucune session ouverte
- **Données utilisées :**
    - Compte collaborateur : underfr31@icloud.com
    - Compte technicien : q.civel@yahoo.fr
    - Compte responsable : loicklaurent28@gmail.com
    - Pages testées :
        - /admin/users (comptes et rôles)
        - /admin/categories (catégories)

- **Actions (pour chacun des 3 comptes) :**
  1. Se connecter et attendre l'affichage complet du tableau de bord
  2. Vérifier que le rôle affiché dans l'en-tête correspond au compte testé
  3. Ouvrir directement l'URL /admin/users
  4. Vérifier le retour sur /dashboard et l'absence de la page « Utilisateurs »
  5. Ouvrir directement l'URL /admin/categories
  6. Vérifier le retour sur /dashboard et l'absence de la page « Catégories »
- **Résultat attendu :** L'accès est refusé pour les 3 rôles : l'utilisateur revient sur le tableau de bord et le contenu des pages d'administration ne s'affiche pas.
- **Résultat obtenu :** Les 3 comptes sont redirigés vers /dashboard sur les 2 pages, et le contenu d'administration ne s'affiche pas. Le test passe (3 réussis sur 3, deux passages dans Firefox et un dans Electron, en headless).
- **Statut :** Réussi

#### Remarques

- **Paramètres :** Il n'existe pas de page de paramètres dans l'application (seuls `app/pages/admin/users.vue` et `app/pages/admin/categories.vue` existent). Cette partie du cas de test n'a donc pas été vérifiée. Les rôles se gèrent depuis /admin/users.
- **Portée :** Ce test vérifie la protection des pages dans l'interface (`definePageMeta({ roles: ['admin'] })` et `app/middleware/auth.global.ts`). Il ne vérifie pas les règles de sécurité de la base de données.
- **Compte de test :** Le compte jean.jacque@mail.com a le rôle administrateur, il ne peut donc pas servir de collaborateur dans ce test.
- **Attente après la connexion :** Sans attendre l'affichage complet du tableau de bord, `cy.visit` coupe le chargement de la page et le premier test échoue avec `error loading dynamically imported module` dans Firefox.

Statuts du test   :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
- **Échoué** : le résultat obtenu ne correspond pas au résultat attendu.
