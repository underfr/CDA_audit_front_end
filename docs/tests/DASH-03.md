### [DASH-03] [Les tickets en cours sont correctement affichés]

- **Objectif :** Vérifier que les tickets au statut « En cours » sont bien affichés sur la page Dashboard.
- **Préparation :** Compte non connecté, départ du test sur la page login
- **Données utilisées :**
    - Identifiant : jean.jacque@mail.com
    - Mot de passe : Jean@31!
    - Ticket :
        - Titre : Mot de passe expiré, compte verrouillé
        - Catégorie : Réseaux
        - Priorité : Urgent
        - Description : Depuis ce matin, impossible de me connecter à mon poste et à ma messagerie.
        - Statut : En cours
- **Actions :**
  1. Se rendre sur la page login
  2. Se connecter
  3. Se rendre sur la page Nouveau ticket
  4. Créer un nouveau ticket
  5. Se rendre sur la page Dashboard
  6. Vérifier que le ticket créé est bien affiché avec le statut « En cours »
- **Résultat attendu :** Le ticket créé apparaît dans la section des tickets en cours du Dashboard, avec le statut « En cours ».
- **Résultat obtenu :** [À compléter après le test]
- **Statut :** Non exécuté

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
- **Échoué** : le résultat obtenu ne correspond pas au résultat attendu.
- **Bloqué** : un problème empêche d'effectuer la vérification.
- **Non exécuté** : le test n'a pas été lancé.