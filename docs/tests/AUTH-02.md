### [AUTH-02] [Connexion avec des données invalides]

- **Objectif :** Vérifier que le formulaire de connexion bloque la connexion si des informations sont incorrectes ou manquantes.
- **Préparation :** Compte non connecté, départ du test sur la page login
- **Données utilisées :**
    - Compte Administrateur invalide : 
    - Compte Administrateur valide : 
    - Champs manquants :
        - Identifiant vide, mot de passe vide, puis les deux vides
- **Actions :**
  1. Se rendre sur la page login
  2. Saisir des informations de connexion incorrectes ou incomplètes
  3. Soumettre le formulaire
- **Résultat attendu :** La connexion est refusée et un message d'erreur s'affiche selon le cas :
    - Identifiant sans « @ » : un message indiquant que l'adresse doit contenir « @ »
    - Champ vide : « Veuillez renseigner ce champ. »
    - Mot de passe incorrect : « Adresse e-mail ou mot de passe incorrect. »
- **Résultat obtenu :** Les messages d'erreur attendus s'affichent dans chaque cas et la connexion n'est pas effectuée.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.