# OKanban
OKanban est un projet pédagogique visant à concevoir une API et une SPA permettant de réaliser un kanban inspiré de l’application Web Trello. L'application offre donc la possibilité de créer des listes (Par exemple: à faire, en cours, réalisé…), puis de créer des cards an sein de ces listes. Les cards symbolisent une tâche.

L'application a été réalisée de manière autonome durant plusieurs session. A chaque fin de session, une correction était fournie avant de passer à la session suivante. L'application tourne dans des Docker. J'ai également créé une Github action afin de pouvoir redéployer automatiquement l'API ainsi que la SPA sur mon VPS, à chaque modification et push sur Github.

Ce dépôt est une copie d'un dépôt privé, partagé avec l'école. Les secrets et variables Github n'ont pas été dupliqués.


## Visuels de l'interface:
Les captures sont issues de la version hébergée par mon VPS, mais elle est strictement identique à la version locale.
![Présentation](./public/images/captures/1_Accueil.png)

![Interface de création d'une card](./public/images/captures/3_InterfaceCreateCard.png)


## Technologies utilisées:
- L'API a été développée avec l'environnement Node et le Framework Express
- L'API utilise notamment la bibliothèque Jest pour réaliser quelques tests unitaires et fonctionnels
- La SPA a été développée entièrement en Javascript Vanilla
- La SPA utilise notamment la bibliothèque Sortable pour la gestion du drag and drop et des tris dans les lists
- L'application utilise une base de données Postgres en version 16 pour la gestion des lists et des cards
- Le tout tourne dans 3 conteneurs docker afin de faciliter les déploiements et la compatibilité entre les différents environnements. En cas de déploiement sur un VPS, un quatrième conteneur NGINX joue le rôle de proxy. 


## Installation:
Cette application peut être soit déployée en local, soit sur un serveur VPS.

### Installation en local:
- Installer et lancer Docker desktop
- Cloner le projet en local: `git clone ...`
- Créer un fichier .env dans /client à partir du fichier .env.example
- Enlever le commentaire de la ligne suivante: `VITE_API_BASE_URL=http://localhost:3100/api `
- Vérifier que la ligne suivante est bien commentée: `VITE_API_BASE_URL=https://vps-fb2758c8.vps.ovh.net/:3100/api`
- Dans le fichier /client/Dockerfile.cli, vérifier que les 2 lignes suivantes sont commentées: `ARG VITE_API_BASE_URL` et `ENV VITE_API_BASE_URL=$VITE_API_BASE_URL`
- Créer un fichier .env dans /api à partir du fichier .env.example
- Pour plus de sécurité, changer le nom d'utilisateur, le mot de passe voire même le nom de la base de données dans la variable d'environnement PG_URL. Exemple:
`PG_URL=postgres://okanban_unAutreUtilisateur:okanban_unAutreMotDePasse@okanban-database:5432/okanban_uneAutreBaseDeDonnees`
- Pour plus de sécurité, changer la politique des CORS en mettant un accès plus restrictif
- Créer un fichier .env à la racine du projet à partir du fichier .env.example
- Modifier les variables d'environnement `PG_USER`, `PG_PASSWORD`, `PG_DB` en fonction des modifications apportées à la variable d'environnement `PG_URL` du fichier .env du répertoire /api
- Enfin: Ouvrir un terminal et lancer la commande suivante: `docker compose -f docker-compose_local.yml up`


### Installation sur un serveur VPS:


#### Principe de fonctionnement:
Dans ce scénario, j'ai créé un containeur supplémentaire NGINX dont le but est de faire du reverseProxy. Voir schéma ci-dessous:
![Présentation](./public/images/captures/2_ArchitectureProxy.png)
- Le navigateur contacte le Proxy pour récupérer et exécuter la version minifiée du front
- Le navigateur (à travers le front) envoie des requêtes au proxy pour joindre l’API, puis récupère et affiche les résultats
- L’API et Postgres échangent à travers un réseau docker de type bridge
- L'installation est réalisée à l'aide d'une Github actions (voir fichier commenté: **.github/workflows/2025-10-14_https_et_tests_cicd_gh_actions.yml**)


#### Déroulement:
- Suite à un push sur Github, la Github actions va réaliser les tests automatisés dans un runner Ubuntu. S’ils réussissent, elle va poursuivre l’exécution, sinon elle va s’arrêter
- La Github actions va builder les images des dockerfiles et les pousser sur Docker Hub (nécessite d'avoir un compte sur Docker Hub)
- Grâce aux secrets Github, préalablement renseignés, elle va ensuite créer les différents fichiers .env dont les containers ont besoin (utilisateur et mot de passe de la base de données, URL de l’API, token d’identification du VPS…)
- Elle va ensuite se connecter en SCP au VPS pour pousser les fichiers env, le fichier docker-compose ainsi que le fichier de configuration de NGINX (nginx.conf)
- Elle va enfin se connecter en SSH au VPS, afin de:
    - Pousser sur le VPS, les images nécessaires se trouvant sur Docker Hub 
    - Arrêter le docker compose actuel et lancer un nouveau docker compose
 
  
#### Etapes d'installation:
Ces étapes servent à récupérer ce projet et tester la Github action sur son propre VPS:
- Cloner le projet sur son ordinateur **local**!: `git clone ...`
- Supprimer la remote actuelle: `git remote remove origin`
- Créer un nouveau repo sur son Github (par exemple : new-okanban-test)
- Récupérer l'url ssh de ce repo, exemple: `git@github.com/SonUsernameGH/new-okanban-test.git`
- Sur son ordinateur personnel, dans le repo précédemment cloné, ajouter une nouvelle remote:
`git remote add origin git@github.com/SonUsernameGH/new-okanban-test.git`
- Dans le fichier /client/Dockerfile.cli, vérifiez que les 2 lignes suivantes ne sont **pas** commentées: `ARG VITE_API_BASE_URL` et `ENV VITE_API_BASE_URL=$VITE_API_BASE_URL`
- Faire un push du projet afin qu'il apparaisse sur github: `git push --all`
- Se créer un compte utilisateur sur Docker Hub: **https://hub.docker.com/**
- Installer Docker sur le serveur VPS distant
- Sur son ordinateur personnel, générer une clé SSH privée et une clé publique, pour la communication sécurisée entre Github et le serveur VPS. Exemple pour mon VPS OVH: `ssh-keygen -t ed25519 -C "githubactions-ovh@okanban"`
- Ajouter la clé privée aux secrets de Github
- Ajouter la clé publique sur le VPS sous: **~/.ssh/authorized_keys** par exemple à l'aide d'une commande echo et d'une redirection. Exemple: `echo “ssh-ed25519 AAAC…” >> ~/.ssh/authorized_keys`
- Sur le serveur VPS, créer l'arborescence pour héberger les fichiers de l'application:
**~/sites/okanban_cicd/api**, **~/sites/okanban_cicd/client**
- Créer les différents autres variables et secrets github dont la githubaction a besoin (Si l'hébergeur n'est pas OVH, les variables et secrets nommés "..._OVH" peuvent bien sûr être renommés sous Github et dans la githubaction.):
    - secrets.DOCKER_USERNAME
    - secrets.DOCKER_PASSWORD
    - secrets.PG_URL
    - secrets.PG_USER
    - secrets.PG_PASSWORD
    - secrets.PG_DB
    - secrets.ALLOWED_DOMAINS
    - vars.VITE_API_BASE_URL_OVH
    - secrets.SSH_HOST_OVH
    - secrets.SSH_USER_OVH
    - secrets.SSH_PRIVATE_KEY_OVH_PEM
- Activer HTTPS sur le serveur distant:
    - Installer Cerbot: `sudo apt update`, `sudo apt install certbot python3-certbot-nginx`
    - Lancer la commande suivante (génération des certificats + enregistrement d'un script chargé du renouvellement automatique:) `sudo certbot certonly --standalone -d NomDuServeurVPS.vps.ovh.net --non-interactive --agree-tos -m monadresseemail@gmail.com` (A adapter en fonction du nom de son serveur VPS)
    - Optionnel, pour lancer un renouvellement manuel: `sudo certbot renew`

Une fois toutes ces actions réalisées, un simple push sur Github (par exemple suite à l'ajout d'un commentaire dans le code, ou un saut de ligne), va lancer la Github action qui va à son tour push le code sur le VPS et démarrer le serveur.