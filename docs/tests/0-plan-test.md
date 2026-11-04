## Les priorités

**Quels cas sont les plus importants à vérifier en premier et pourquoi ?**

AUTH-01 / AUTH-02 / AUTH-03 / DASH-01 / TICK-01 / TICK-02 /  TICK-06 / TICK-08 / TICK-11 / TICK-12 / ROLE-01

Ces cas sont classés P0 car leur échec rendrait l'application inutilisable ou exposerait des données. Ils répondent à au moins un de ces trois critères :

- **Sécurité et confidentialité** (AUTH-02, AUTH-03, DASH-01, TICK-08, TICK-05) : un visiteur non connecté ne doit accéder à aucune page protégée, et un utilisateur ne doit jamais pouvoir lire ou modifier le ticket d'un autre. Une faille exposerait des données personnelles et professionnelles, avec un risque de non-conformité au RGPD.
- **Parcours principal** (AUTH-01, TICK-01, TICK-11, TICK-12, COMM-01) : se connecter, créer un ticket, l'assigner à un technicien, le retrouver dans sa liste et échanger par commentaire. C'est la raison d'être de l'application : si une seule étape échoue, le support ne peut plus traiter les demandes et l'utilisateur n'a aucun moyen de contourner le problème.
- **Intégrité des données** (TICK-02) : refuser les données invalides évite d'enregistrer des tickets incomplets ou incohérents, difficiles à corriger une fois en base.

Les autres cas (KPI, filtres, liens, accessibilité, affichage) dégradent l'expérience sans empêcher le traitement d'un ticket. Ils sont classés de P1 à P3 et vérifiés dans un second temps.

