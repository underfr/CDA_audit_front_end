### [DASH-01] [Accès aux données et à la page sans être connecté]

- **Objectif :** Vérifier que le Dashboard est protégé à deux niveaux : côté navigateur par le middleware d'authentification, et côté serveur par les règles de sécurité de la Realtime Database.
- **Préparation :** Compte non connecté (session Firebase supprimée avant le chargement de la page)
- **Données utilisées :**
    - Page testée : /dashboard
    - Requête serveur : GET `<URL de la Realtime Database>/tickets.json`, envoyée sans jeton d'authentification
- **Actions :**
  1. Se rendre sur la page Dashboard sans être connecté
  2. Vérifier la redirection vers la page login et l'affichage du formulaire de connexion
  3. Envoyer directement à la Realtime Database une requête de lecture des tickets, sans être connecté et sans passer par l'application
  4. Vérifier le code de réponse du serveur
- **Résultat attendu :**
    - Côté navigateur : l'utilisateur est redirigé vers la page login.
    - Côté serveur : la Realtime Database refuse la lecture des tickets avec une erreur 401 (accès refusé).
- **Résultat obtenu :**
    - Côté navigateur : l'utilisateur est bien redirigé vers la page login et le formulaire de connexion s'affiche.
    - Côté serveur : la Realtime Database renvoie bien une erreur 401. Les tickets ne sont pas lisibles sans être connecté, même en contournant l'application.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.