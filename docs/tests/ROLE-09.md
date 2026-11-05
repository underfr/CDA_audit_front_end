### [ROLE-09] [Tous sauf Admin : modifier son propre rôle ou celui d'un autre compte]

- **Objectif :** Vérifier qu'un compte non administrateur ne peut modifier ni son propre rôle ni celui d'un autre compte, dans l'interface comme dans la base de données.
- **Préparation :** Un compte collaborateur, un compte technicien et un compte responsable support existants, page de départ /login, aucune session ouverte
- **Données utilisées :**
    - Compte collaborateur : underfr31@icloud.com (autre compte visé : le technicien)
    - Compte technicien : q.civel@yahoo.fr (autre compte visé : le responsable)
    - Compte responsable : loicklaurent28@gmail.com (autre compte visé : le collaborateur)
    - Valeur écrite : le rôle actuel du compte visé, jamais « admin », pour qu'aucune donnée ne change

- **Actions (pour chacun des 3 comptes) :**
  1. Se connecter et vérifier le rôle affiché dans l'en-tête
  2. Ouvrir directement /admin/users et vérifier le retour sur /dashboard, sans menu « Utilisateurs » ni liste de rôles
  3. Récupérer le jeton Firebase du compte, comme le ferait un utilisateur malveillant
  4. Tenter d'écrire son propre rôle directement dans la base (`users/<uid>/role`)
  5. Tenter d'écrire le rôle d'un autre compte directement dans la base
- **Résultat attendu :** Modification refusée (pas d'escalade de privilèges) : aucun moyen de modifier un rôle dans l'interface, et réponse 401 ou 403 de la base.
- **Résultat obtenu :** L'interface est bien protégée (3 tests réussis). La base accepte en revanche toutes les écritures avec une réponse 200 (6 tests échoués), pour les 3 comptes et les 2 cas. Résultat identique sur 2 passages dans Firefox, en headless.
- **Statut :** Échoué

#### Diagnostic

- **Commande en échec :** l'écriture `PUT users/<uid>/role.json` (`tenterEcriture` dans `cypress/e2e/ROLE-09.cy.js`)
- **Erreur :** `écriture refusée : expected 200 to be one of [ 401, 403 ]`
- **Cause probable :** Le contrôle du rôle se fait seulement dans l'application (`definePageMeta` et `app/middleware/auth.global.ts`). Les règles de sécurité de la base ne sont pas dans le dépôt et n'ont pas pu être lues, mais elles semblent autoriser ces écritures.
- **Impact :** Si les règles acceptent aussi un rôle différent, n'importe quel compte connecté peut se donner le rôle `admin` ou changer le rôle d'un autre compte, sans passer par l'interface.
- **Limite du test :** Pour ne rien modifier, le test réécrit le rôle actuel. Il prouve que l'écriture n'est pas refusée d'office, mais pas qu'un rôle différent serait accepté : une règle qui n'autorise que la même valeur donnerait aussi une réponse 200. Il reste à vérifier les règles dans la console Firebase (onglet Règles de Realtime Database, avec son simulateur).
- **Captures d'écran :** `cypress/screenshots/ROLE-09.cy.js/` (6 fichiers)

#### Correctifs possibles

Aucun correctif n'est appliqué à ce jour. Ces règles n'ont pas été testées.

1. **Réserver les écritures sur `users` à l'administrateur (recommandé).** Dans l'application, seules les pages d'administration écrivent dans `users`. Dans les règles de Realtime Database :

   ```json
   "users": {
     ".read": "auth != null",
     ".indexOn": ["role"],
     "$uid": {
       ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
     }
   }
   ```

   Attention : une règle `.write` accordée sur un parent ne peut pas être retirée sur un enfant. Aucune règle au-dessus de `users` ne doit donc autoriser l'écriture. Les rôles et les autres champs (`active`, suppression d'un compte) sont ainsi protégés ensemble.
2. **Protéger seulement le champ `role` avec `.validate` (non recommandé ici).** Si un utilisateur doit pouvoir modifier son profil, ajouter sur `role` une règle `.validate` qui refuse tout changement de valeur hors administrateur. Avec ce correctif, réécrire la même valeur reste accepté : ce test continuerait d'échouer sans que ce soit une faille, et il faudrait l'adapter.

Statuts du test   :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
- **Échoué** : le résultat obtenu ne correspond pas au résultat attendu.
