### [DASH-01] [Accès à la page sans être connecté]

- **Objectif :** Vérifier que la page Dashboard est bien protégée par le middleware d'authentification.
- **Préparation :** Compte non connecté, départ du test sur la page Dashboard
- **Données utilisées :** Aucune
- **Actions :**
  1. Se rendre sur la page Dashboard sans être connecté
- **Résultat attendu :** L'utilisateur est redirigé vers la page login.
- **Résultat obtenu :** L'utilisateur est bien redirigé vers la page login : la page Dashboard est protégée lorsque l'utilisateur n'est pas connecté.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.