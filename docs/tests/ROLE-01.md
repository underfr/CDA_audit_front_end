### [ROLE-01] [Un collaborateur ne peut pas consulter le ticket d'un autre collaborateur]

- **Objectif :** Vérifier qu'un collaborateur ne peut pas voir le ticket d'un autre collaborateur, ni dans sa liste de tickets ni en ouvrant directement l'URL du ticket
- **Préparation :** [Deux comptes collaborateurs existants, page de départ /login, aucune session ouverte]
- **Données utilisées :**
    - Compte collaborateur B (auteur du ticket) :
        
    - Compte collaborateur A (tente d'accéder au ticket) :
        
    - Ticket :
        - Titre : test confidentialité ticket entre collaborateurs
        - Catégorie : Réseaux
        - Priorité : Urgent
        - Description : Test si un collaborateur peut consulter le ticket d'un autre collaborateur.

- **Actions :**
  1. Se connecter avec le compte du collaborateur B
  2. Créer un nouveau ticket
  3. Ouvrir le ticket et noter son URL
  4. Se déconnecter
  5. Se connecter avec le compte du collaborateur A
  6. Aller sur la page des tickets et vérifier que le ticket n'apparaît pas dans la liste
  7. Ouvrir directement l'URL du ticket notée à l'étape 3

- **Résultat attendu :** Le ticket du collaborateur B n'apparaît pas dans la liste du collaborateur A. L'accès par l'URL directe est refusé (redirection ou message d'erreur) et le contenu du ticket ne s'affiche pas.
- **Résultat obtenu :** Le ticket créé par le collaborateur B n'apparaît pas dans la liste des tickets du collaborateur A. L'accès par l'URL directe du ticket est refusé et son contenu ne s'affiche pas. Le résultat obtenu correspond au résultat attendu.
- **Statut :** exécuté

Choisissez ensuite l'un des statuts suivants :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
