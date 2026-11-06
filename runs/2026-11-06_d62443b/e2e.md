# Tests E2E (Cypress)

- **Résultat :** ✅ 34 réussis, 0 échoués, 0 ignorés
- **Date :** 2026-11-06 09:30 UTC
- **Branche :** main
- **Commit :** d62443b44113c03e638d6eac5718e285a64cdb33
- **Run :** https://github.com/underfr/CDA_audit_front_end/actions/runs/42195322093

| Fichier | Test | Résultat | Durée |
|---|---|---|---|
| AUTH-01.cy.js | Connexion avec les données valides | ✅ | 1.8 s |
| AUTH-02.cy.js | Connexion avec identifiant invalides | ✅ | 0.7 s |
| AUTH-02.cy.js | Connexion avec mot de passe invalide | ✅ | 0.5 s |
| AUTH-02.cy.js | Connexion sans identifiant | ✅ | 0.4 s |
| AUTH-02.cy.js | Connexion sans mot de passe | ✅ | 0.7 s |
| AUTH-02.cy.js | Connexion sans aucun champs | ✅ | 0.5 s |
| AUTH-03.cy.js | Déconnexion | ✅ | 1.4 s |
| COMM-01.cy.js | Création d'un commentaire avec des données valides | ✅ | 2.8 s |
| DASH-01.cy.js | Redirige vers /login si on accède au dashboard sans être connecté | ✅ | 0.3 s |
| DASH-01.cy.js | Refuse la lecture des tickets côté serveur sans être connecté | ✅ | 0.4 s |
| ROLE-01.cy.js | Un collaborateur ne peut pas consulter le ticket d'un autre collaborateur | ✅ | 4.3 s |
| ROLE-08.cy.js | Un collaborateur ne peut pas ouvrir les pages d'administration par l'URL directe | ✅ | 2.5 s |
| ROLE-08.cy.js | Un technicien ne peut pas ouvrir les pages d'administration par l'URL directe | ✅ | 2.1 s |
| ROLE-08.cy.js | Un responsable ne peut pas ouvrir les pages d'administration par l'URL directe | ✅ | 2.1 s |
| ROLE-09.cy.js | Un collaborateur › ne voit aucun moyen de modifier un rôle dans l’interface | ✅ | 1.9 s |
| ROLE-09.cy.js | Un collaborateur › ne peut pas modifier son propre rôle dans la base | ✅ | 1.3 s |
| ROLE-09.cy.js | Un collaborateur › ne peut pas modifier le rôle d’un autre compte dans la base | ✅ | 0.5 s |
| ROLE-09.cy.js | Un technicien › ne voit aucun moyen de modifier un rôle dans l’interface | ✅ | 1.4 s |
| ROLE-09.cy.js | Un technicien › ne peut pas modifier son propre rôle dans la base | ✅ | 0.6 s |
| ROLE-09.cy.js | Un technicien › ne peut pas modifier le rôle d’un autre compte dans la base | ✅ | 0.4 s |
| ROLE-09.cy.js | Un responsable › ne voit aucun moyen de modifier un rôle dans l’interface | ✅ | 1.4 s |
| ROLE-09.cy.js | Un responsable › ne peut pas modifier son propre rôle dans la base | ✅ | 0.6 s |
| ROLE-09.cy.js | Un responsable › ne peut pas modifier le rôle d’un autre compte dans la base | ✅ | 0.5 s |
| TICK-01.cy.js | Créer un ticket avec des données valides | ✅ | 2.4 s |
| TICK-02.cy.js | Créer un ticket avec un titre invalide moins de 5 caractères | ✅ | 1.9 s |
| TICK-02.cy.js | Créer un ticket avec un titre invalide plus de 120 caractères | ✅ | 1.2 s |
| TICK-02.cy.js | Créer un ticket avec une description invalide moins de 10 caractères | ✅ | 1.8 s |
| TICK-02.cy.js | Créer un ticket avec une description invalide plus de 2000 caractères | ✅ | 1.9 s |
| TICK-04.cy.js | Le ticket créé est toujours là après rechargement de la page | ✅ | 4.3 s |
| TICK-05.cy.js | Persistance des données apres rechargement du formulaire de création d'un ticket | ✅ | 2.4 s |
| TICK-07.cy.js | Un ticket résolu ne s’affiche plus dans « Tickets en cours » | ✅ | 6.0 s |
| TICK-08.cy.js | Redirige vers /login si on accède à la page de création d'un ticket sans être connecté | ✅ | 0.3 s |
| TICK-11.cy.js | Le responsable support peux assigner un ticket à un technicien | ✅ | 3.1 s |
| TICK-12.cy.js | Le technicien peux voir les tickets qui lui sont assigné | ✅ | 4.4 s |
