### [TICK-11] [Le responsable support peut affecter un ticket à un technicien]

- **Objectif :** Vérifier que le responsable support peut affecter correctement un ticket à un technicien.
- **Préparation :** Compte non connecté, départ du test sur la page login avec le compte responsable support
- **Données utilisées :**
    - Compte responsable support :
        
    - Nouveau ticket :
        - Titre : Test assignation ticket
        - Catégorie : Réseaux
        - Priorité : Moyenne
        - Description détaillée : Réalisation du test d'assignation d'un ticket à un technicien.
    - Affectation :
        - Technicien affecté : Yaelle
        - Nouvelle priorité : Faible
- **Actions :**
  1. Se connecter avec le compte responsable support
  2. Créer un nouveau ticket de test
  3. Aller sur la page Tableau de bord
  4. Sélectionner le ticket créé (non assigné)
  5. Sélectionner un technicien dans « Technicien affecté »
  6. Sélectionner une priorité
  7. Cliquer sur « Affecter »
  8. Vérifier dans la section Informations que le technicien et la priorité correspondent
- **Résultat attendu :** Le ticket est affecté au technicien Yaelle. La section Informations affiche « Yaelle » comme technicien et « Faible » comme priorité.
- **Résultat obtenu :** Le ticket est bien affecté au technicien Yaelle. La section Informations affiche le technicien et la priorité sélectionnés.
- **Statut :** Réussi

Statuts du test :

- **Réussi** : le résultat obtenu correspond au résultat attendu.