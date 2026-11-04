### [ TICK-02] [Création d'un ticket avec des données invalides]

- **Objectif :** Vérifier si le formulaire de création de ticket affiche une erreur si les informations ne sont pas correctes . 
- **Préparation :** Compte connecté, dépard du test page new-ticket
- **Données utilisées :** 
titre : 
  moins de 5 caractères :
      - titre du ticket : "Mot"
  plus de 120 caractères :
      - titre du ticket : Mot de passe expiré, compte verrouillé après plusieurs essais, plus aucun accès au poste, à la messagerie ni au réseau local.
description :
  moins de 5 caractères :
    - description : Dep
  plus de 2000 caractères :
    - Depuis ce matin, impossible de me connecter à mon poste de travail. Au démarrage, un message m'indique que mon mot de passe a expiré et qu'il doit être changé. J'ai essayé de le modifier à plusieurs reprises en respectant les règles de sécurité habituelles : au moins douze caractères, une majuscule, un chiffre et un caractère spécial. À chaque tentative, le système refuse le nouveau mot de passe sans donner de raison précise. Après la quatrième tentative, un nouveau message est apparu pour m'indiquer que mon compte était verrouillé. Depuis, je ne peux plus ouvrir de session, ni sur mon poste fixe, ni sur l'ordinateur portable fourni pour le télétravail. J'ai également essayé depuis mon téléphone professionnel : la messagerie refuse de se synchroniser et affiche une erreur d'authentification. Je n'ai donc plus accès à mes courriels, à mon agenda ni aux réunions prévues aujourd'hui. Les dossiers partagés du réseau sont eux aussi inaccessibles, tout comme l'intranet et les applications métier que j'utilise quotidiennement, notamment l'outil de facturation et le logiciel de gestion des clients. J'ai redémarré le poste deux fois et vérifié le câble réseau, qui est bien branché. Mes collègues du même bureau n'ont aucun problème et peuvent se connecter normalement, ce qui me fait penser que le souci vient uniquement de mon compte. Je n'ai reçu aucun courriel me prévenant de l'expiration prochaine du mot de passe, alors que c'était le cas les fois précédentes. Je dois envoyer plusieurs devis à des clients avant midi et préparer une présentation pour une réunion importante cet après-midi, ce blocage m'empêche donc complètement de travailler. Pourriez-vous déverrouiller mon compte et réinitialiser mon mot de passe en urgence ? Je reste joignable sur mon téléphone portable toute la journée, au bureau numéro deux cent quatorze, au deuxième étage du bâtiment B. Merci beaucoup pour votre aide rapide, et n'hésitez pas à me contacter si vous avez besoin d'informations complémentaires. Bonne journée.

- **Actions :**
  1. Se connecter
  2. Se rendre sur la page de création de ticket
  3. Saisir les informations du formulaire de création de ticket valide
  4. Soumettre le formulaire
  5. Vérifier le message de confirmation
- **Résultat attendu :** Un message de succès doit être affiché "Le ticket "n°ticket + nom du ticket " à bien été créer".  
- **Résultat obtenu :** les titres et description trop long sont bien coupé au nombre de caractères maximum et si il n'y a pas assez de caratères le formulaire ne s'envoi pas.

- **Statut :** exécuté

Statuts du test   :

- **Réussi** : le résultat obtenu correspond au résultat attendu.

