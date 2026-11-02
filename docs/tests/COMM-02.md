### [ COMM-02] [Création d'un commentire avec des données invalides]

- **Objectif :** Vérifier si le formulaire de création envoi un message d'erreur si les données ne sont pas valide. 
- **Préparation :** Compte connecté, dépard du test page ticket
- **Données utilisées :** 
    Identifiant 
    Mot de passe

    Contenu du commentaire : "<script>Je suis un commentaire valide <\script>"

- **Actions :**
  1. Se connecter
  2. Se rendre sur la page ticket
  3. Selectionner un ticket 
  4. CLiquer sur ajouter un commentaire
  5. Saisir des données érroné dans le formulaire
  6. Soumettre le formulaire
  7. Vérifier la présence du message "Votre commentaire n'a pas pu être envoyé."
- **Résultat attendu :** Un message d'erreur "Votre commentaire n'a pas pu être envoyé."
- **Résultat obtenu :** [À compléter après le test]
- **Statut :** non exécuté

Statuts du test   :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
- **Échoué** : le résultat obtenu ne correspond pas au résultat attendu.
- **Bloqué** : un problème empêche d’effectuer la vérification.
- **Non exécuté** : le test n’a pas été lancé.

