### [ AUTH-02] [Connexion avec les données invalides]

- **Objectif :** Vérifier si le formulaire de connexion bloque si des informations ne sont pas correcte ou manquante.
- **Préparation :** Compte nom connecté, dépard du test page login
- **Données utilisées :** 
Identifiant : jean.jacque.com
mot de passe : Jean@31!
 
Identifiant : jean.jacque@mail.com
mot de passe : unAutreMotDePasse
- **Actions :**
  1. Se rendre sur la page login
  2. Saisir de mauvaise informations ou des informations manquantes de connexion 
  3. Soumettre le formulaire
- **Résultat attendu :** Un message d'erreur doit être affiché "Veuillez renseigner ce champ." ou un message d'erreur doit contenir "@".
- **Résultat obtenu :** Les messages d'ereurs sont bien affiché et la connexion ne sais pas effectué 
- **Statut :**  exécuté

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.


