### [TICK-12] [Le technicien peut voir les tickets qui lui sont affectés]

- **Objectif :** Vérifier que le technicien peut voir les tickets qui lui sont affectés.
- **Préparation :** Compte non connecté, départ du test sur la page login avec le compte responsable support
- **Données utilisées :**
    - Compte responsable support :
        
    - Compte technicien :
       
    - Ticket :
        - Titre : test visibilité des tickets affectés au technicien
        - Catégorie : Réseaux
        - Priorité : Urgent
        - Description : Test si un technicien a accès aux tickets qui lui sont affectés.
    - Affectation :
        - Technicien affecté : Quentin
        - Nouvelle priorité : Moyenne
- **Actions :**
  1. Se connecter avec le compte responsable support
  2. Créer un nouveau ticket
  3. Affecter le ticket au technicien Quentin
  4. Se déconnecter
  5. Se connecter avec le compte technicien Quentin
  6. Aller sur la page des tickets
  7. Ouvrir le ticket et vérifier qu'il lui est bien affecté
- **Résultat attendu :** Le ticket affecté par le responsable support apparaît dans la liste des tickets du technicien Quentin. Sa fiche affiche « Quentin » comme technicien.
- **Résultat obtenu :** Le ticket affecté par le responsable support apparaît dans la liste des tickets du technicien Quentin. Sa fiche affiche « Quentin » comme technicien.
- **Statut :** exécuté

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.
