### [TICK-01] [Création d'un ticket avec des données valides]

- **Objectif :** Vérifier que le formulaire de création de ticket est fonctionnel.
- **Préparation :** Compte non connecté, départ du test sur la page login
- **Données utilisées :**
    - Compte Administrateur 
    - Titre du ticket : « Mot de passe expiré, compte verrouillé »
    - Catégorie : Réseaux
    - Priorité : Urgent
    - Image : captureVPN.png
    - Description : « Depuis ce matin, impossible de me connecter à mon poste et à ma messagerie. »
- **Actions :**
  1. Se connecter
  2. Se rendre sur la page de création de ticket
  3. Remplir le formulaire avec des informations valides
  4. Soumettre le formulaire
  5. Confirmer l'envoi dans la fenêtre de confirmation
  6. Vérifier que le ticket est bien affiché sur la page des tickets
- **Résultat attendu :** Un message de succès s'affiche (« Le ticket [n° du ticket + titre] a bien été créé. ») et le ticket apparaît sur la page des tickets.
- **Résultat obtenu :** Le message de succès s'affiche, le ticket est bien créé et il apparaît sur la page des tickets.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.