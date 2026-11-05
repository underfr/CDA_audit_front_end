# Tests E2E (Cypress)

- **Résultat :** ✅ 33 réussis, 0 échoués, 0 ignorés
- **Date :** 2026-11-05 10:36 UTC
- **Branche :** feature/docker
- **Commit :** d3e334974761a0996b40f3e81341fd777ff639f9
- **Run :** https://github.com/underfr/CDA_audit_front_end/actions/runs/42011774010

| Fichier | Test | Résultat | Durée |
|---|---|---|---|
| AUTH-01.cy.js | Connexion avec les données valides | ✅ | 2.3 s |
| AUTH-02.cy.js | Connexion avec identifiant invalides | ✅ | 0.8 s |
| AUTH-02.cy.js | Connexion avec mot de passe invalide | ✅ | 0.6 s |
| AUTH-02.cy.js | Connexion sans identifiant | ✅ | 0.3 s |
| AUTH-02.cy.js | Connexion sans mot de passe | ✅ | 0.4 s |
| AUTH-02.cy.js | Connexion sans aucun champs | ✅ | 0.2 s |
| AUTH-03.cy.js | Déconnexion | ✅ | 2.7 s |
| COMM-01.cy.js | Création d'un commentaire avec des données valides | ✅ | 3.5 s |
| DASH-01.cy.js | Redirige vers /login si on accède au dashboard sans être connecté | ✅ | 0.5 s |
| ROLE-01.cy.js | Un collaborateur ne peut pas consulter le ticket d'un autre collaborateur | ✅ | 5.1 s |
| ROLE-08.cy.js | Un collaborateur ne peut pas ouvrir les pages d'administration par l'URL directe | ✅ | 3.2 s |
| ROLE-08.cy.js | Un technicien ne peut pas ouvrir les pages d'administration par l'URL directe | ✅ | 2.5 s |
| ROLE-08.cy.js | Un responsable ne peut pas ouvrir les pages d'administration par l'URL directe | ✅ | 2.5 s |
| ROLE-09.cy.js | Un collaborateur › ne voit aucun moyen de modifier un rôle dans l’interface | ✅ | 3.1 s |
| ROLE-09.cy.js | Un collaborateur › ne peut pas modifier son propre rôle dans la base | ✅ | 0.7 s |
| ROLE-09.cy.js | Un collaborateur › ne peut pas modifier le rôle d’un autre compte dans la base | ✅ | 0.6 s |
| ROLE-09.cy.js | Un technicien › ne voit aucun moyen de modifier un rôle dans l’interface | ✅ | 2.3 s |
| ROLE-09.cy.js | Un technicien › ne peut pas modifier son propre rôle dans la base | ✅ | 0.6 s |
| ROLE-09.cy.js | Un technicien › ne peut pas modifier le rôle d’un autre compte dans la base | ✅ | 0.6 s |
| ROLE-09.cy.js | Un responsable › ne voit aucun moyen de modifier un rôle dans l’interface | ✅ | 1.7 s |
| ROLE-09.cy.js | Un responsable › ne peut pas modifier son propre rôle dans la base | ✅ | 0.7 s |
| ROLE-09.cy.js | Un responsable › ne peut pas modifier le rôle d’un autre compte dans la base | ✅ | 0.6 s |
| TICK-01.cy.js | Créer un ticket avec des données valides | ✅ | 2.9 s |
| TICK-02.cy.js | Créer un ticket avec un titre invalide moins de 5 caractères | ✅ | 2.3 s |
| TICK-02.cy.js | Créer un ticket avec un titre invalide plus de 120 caractères | ✅ | 1.5 s |
| TICK-02.cy.js | Créer un ticket avec une description invalide moins de 5 caractères | ✅ | 1.9 s |
| TICK-02.cy.js | Créer un ticket avec une description invalide plus de 2000 caractères | ✅ | 2.6 s |
| TICK-04.cy.js | Le ticket créé est toujours là après rechargement de la page | ✅ | 5.6 s |
| TICK-05.cy.js | Persistance des données apres rechargement du formulaire de création d'un ticket | ✅ | 3.2 s |
| TICK-07.cy.js | Un ticket résolu ne s’affiche plus dans « Tickets en cours » | ✅ | 7.1 s |
| TICK-08.cy.js | Redirige vers /login si on accède à la page de création d'un ticket sans être connecté | ✅ | 0.5 s |
| TICK-11.cy.js | Le responsable support peux assigner un ticket à un technicien | ✅ | 3.4 s |
| TICK-12.cy.js | Le technicien peux voir les tickets qui lui sont assigné | ✅ | 6.3 s |
