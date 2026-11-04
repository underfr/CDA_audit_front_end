### [ TICK-07] [Les tickets résolus ne s'affichent plus dans « Tickets en cours »]

- **Objectif :** Vérifier qu'un ticket passé au statut « Résolu » disparaît de la section « Tickets en cours » du tableau de bord.
- **Préparation :** Un compte responsable support (Loïck) et un compte technicien (Quentin), départ du test page login
- **Données utilisées :**
    - titre du ticket : "Écran noir au démarrage " + horodatage (titre unique à chaque passage)
    - Catégorie : Réseaux
    - Priorité : Moyenne
    - description : "Mon écran reste noir quand j’allume le poste."
    - technicien affecté : Quentin

- **Actions :**
  1. Se connecter avec le compte responsable, créer le ticket et attendre la redirection vers la liste des tickets
  2. Revenir au tableau de bord et vérifier que le ticket apparaît dans « Tickets en cours » du tableau de bord
  3. Affecter le ticket au technicien Quentin, puis se déconnecter
  4. Se connecter avec le compte technicien, ouvrir le ticket, cliquer sur « Prendre en charge » puis « Marquer comme résolu »
  5. Se déconnecter, se reconnecter avec le compte responsable
  6. Vérifier que le ticket n'apparaît plus dans « Tickets en cours »
- **Résultat attendu :** Le ticket résolu n'est plus affiché dans la section « Tickets en cours ».
- **Résultat obtenu :** Le test s'arrête à la fin de l'action 3 : le clic sur « Déconnexion » depuis la page du ticket provoque une erreur non gérée dans l'application. Les actions 4 à 6 ne sont pas exécutées.
- **Statut :** Échoué

#### Diagnostic

- **Commande en échec :** `cy.contains('button', 'Déconnexion').click()` (`cypress/e2e/TICK-07.cy.js:44`)
- **Erreur :** `TypeError: can't access property "id", user is null` (Firefox) ou `Cannot read properties of null (reading 'id')` (Electron), levée par `getTransitions` (`app/utils/ticketTransition.ts:12`)
- **Cause :**
  1. À la déconnexion, le middleware remet le profil à `null` (`app/middleware/auth.global.ts:11`).
  2. La page du ticket est encore affichée, donc la propriété calculée `transitions` se recalcule (`app/pages/tickets/[id].vue:9`).
  3. Elle transmet `profile.value!` à `getTransitions` : le `!` masque le cas `null` à TypeScript, et la lecture de `user.id` plante.
- **Impact :** Un utilisateur réel rencontre la même erreur en se déconnectant depuis la page d'un ticket.
- **Portée :** Le bug concerne la déconnexion, pas le comportement visé par TICK-07. Avant la mise à jour depuis `dev`, le test est passé en entier (Firefox, headless) avec le correctif 1 appliqué temporairement, puis retiré : le ticket résolu disparaissait bien de la section, alors nommée « Mes tickets en cours ». Ce passage complet n'a pas été refait depuis, donc les actions 4 à 6 restent à vérifier sur la version actuelle.
- **Prérequis du test :** Le compte de Loïck doit avoir le rôle `manager`, sinon le menu d'affectation ne s'affiche pas et le test échoue dès l'action 3 sur `select[id="ticket-assignee"]`.
- **Mise à jour du test :** Après la mise à jour depuis `dev`, le panneau du responsable s'appelle « Tickets en cours » (`app/pages/dashboard.vue:28`) et le test attend la redirection vers `/tickets` avant de revenir au tableau de bord. Sans cela, il échouait dès l'action 2.
- **Capture d'écran :** `cypress/screenshots/TICK-07.cy.js/Abstract Support -- Un ticket résolu ne s’affiche plus dans « Tickets en cours » (failed).png`
- **Remarque :** Les erreurs répétées `__props.props is undefined` (`matched`) et `state.value is undefined` (`left`), vues dans Firefox, sont sans lien avec ce bug. Ces lectures se trouvent dans le code de Nuxt DevTools, désactivé pendant les tests via `__NUXT_DEVTOOLS_DISABLE__` dans `cypress/support/e2e.js`. Leur disparition reste à confirmer dans `cypress open`.

#### Correctifs possibles

Aucun correctif n'est appliqué dans le code à ce jour.

1. **Vérifier le profil dans la page du ticket (recommandé, testé).** C'est le changement le plus petit, sur une seule ligne de `app/pages/tickets/[id].vue` :

   ```ts
   const transitions = computed(() => ticket.value && profile.value ? getTransitions(ticket.value, profile.value) : [])
   ```

2. **Accepter un profil `null` dans `getTransitions` (non testé).** La fonction reçoit `user: UserProfile | null` et renvoie `[]` si `user` est `null`. Cela protège tous les appels futurs, mais le `!` de la page doit aussi être retiré.
3. **Remettre le profil à `null` après avoir quitté la page (non testé).** Cela traite le problème à la source et protège les autres pages qui lisent le profil, mais c'est le changement le plus risqué, car il touche au middleware d'authentification et à la navigation.

**À éviter :** ignorer l'erreur côté Cypress avec `uncaught:exception`. Le test passerait, mais le bug resterait présent pour les utilisateurs.

Statuts du test   :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
- **Échoué** : le résultat obtenu ne correspond pas au résultat attendu.
