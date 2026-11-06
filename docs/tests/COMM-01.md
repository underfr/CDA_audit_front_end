### [COMM-01] [Création d'un commentaire avec des données valides]

- **Objectif :** Vérifier que le formulaire de création de commentaire est fonctionnel.
- **Préparation :** Compte non connecté, départ du test sur la page login, un ticket existant
- **Données utilisées :**
    - Compte Administrateur : 
    - Titre du ticket : Mot de passe expiré, compte verrouillé
    - Contenu du commentaire : « Je suis un commentaire »
- **Actions :**
  1. Se connecter
  2. Se rendre sur la page des tickets
  3. Sélectionner un ticket
  4. Cliquer sur « Ajouter un commentaire »
  5. Saisir le contenu du commentaire dans le formulaire
  6. Soumettre le formulaire
  7. Vérifier la présence du message de confirmation
- **Résultat attendu :** Le message « Votre commentaire à bien été créer. » s'affiche et le commentaire apparaît sur le ticket.
- **Résultat obtenu :** Le message de confirmation s'affiche et le commentaire a bien été créé.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.