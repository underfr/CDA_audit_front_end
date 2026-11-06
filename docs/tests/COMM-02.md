### [COMM-02] [Création d'un commentaire avec des données invalides]

- **Objectif :** Vérifier que le formulaire de création de commentaire affiche un message d'erreur si les données ne sont pas valides.
- **Préparation :** Compte non connecté, départ du test sur la page login, un ticket existant
- **Données utilisées :**
    - Compte Administrateur : 
    - Contenu du commentaire : « <script>alert('test')</script> »
- **Actions :**
  1. Se connecter
  2. Se rendre sur la page des tickets
  3. Sélectionner un ticket
  4. Cliquer sur « Ajouter un commentaire »
  5. Saisir des données erronées dans le formulaire
  6. Soumettre le formulaire
  7. Vérifier la présence du message d'erreur
- **Résultat attendu :** Le message « Votre commentaire n'a pas pu être envoyé. » s'affiche et le commentaire n'est pas ajouté au ticket.
- **Résultat obtenu :** [À compléter après le test]
- **Statut :** Non exécuté

Statuts du test :

- **Réussi** : le résultat obtenu