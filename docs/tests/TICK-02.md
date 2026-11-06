### [TICK-02] [Création d'un ticket avec des données invalides]

- **Objectif :** Vérifier que le formulaire de création de ticket empêche l'envoi lorsque le titre ou la description ne respectent pas le nombre de caractères autorisé.
- **Préparation :** Compte non connecté, départ du test sur la page login
- **Données utilisées :**
    - Compte Administrateur 
    - Catégorie : Réseaux
    - Priorité : Urgent
    - Titre (5 à 120 caractères autorisés) :
        - Moins de 5 caractères : « Mot »
        - Plus de 120 caractères (125) : « Mot de passe expiré, compte verrouillé après plusieurs essais, plus aucun accès au poste, à la messagerie ni au réseau local. »
    - Description (5 à 2000 caractères autorisés) :
        - Moins de 5 caractères : « Dep »
        - Plus de 2000 caractères (2018) : texte décrivant le blocage du compte, disponible dans le test Cypress TICK-02
- **Actions :**
  1. Se connecter
  2. Se rendre sur la page de création de ticket
  3. Remplir le formulaire avec un titre ou une description invalide
  4. Soumettre le formulaire
  5. Vérifier que le ticket n'est pas envoyé
- **Résultat attendu :**
    - Titre ou description trop court : le formulaire ne s'envoie pas, un message d'erreur s'affiche sur le champ et la fenêtre de confirmation ne s'ouvre pas.
    - Titre ou description trop long : la saisie est automatiquement coupée à 120 caractères pour le titre et à 2000 pour la description.
- **Résultat obtenu :** Les titres et descriptions trop longs sont bien coupés au nombre maximum de caractères. Lorsqu'il n'y a pas assez de caractères, le formulaire ne s'envoie pas.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.