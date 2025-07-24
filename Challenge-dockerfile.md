# Un Dockerfile pour O'kanban

L'objectif est de créer les conteneurs de notre projet.

Notre projet a trois parties :

- une base de données
- un serveur d'API REST
- un client

On va isoler chaque partie dans son propre conteneur ! Donc, oui, le titre du challenge est un peu trompeur...

N'hésitez pas à jouer avec Docker, lire la documentation, fouiller les tutoriels, copier les exemples du cours, tenter des commandes... il n'y a aucun risque ! N'est-ce pas en testant qu'on devient... forgeron ?

## Conteneur serveur d'API REST

### Création du Dockerfile

Dans le répertoire `api`, créer un fichier `Dockerfile.api`.

Ce fichier doit contenir les instructions suivantes :

1. Partir d'une image Node.js version 20 (`FROM`)
2. Définir le répertoire de travail à l'intérieur du conteneur comme étant le dossier `/usr/src/app` (un classique pour les conteneurs Node) (`WORKDIR`)
3. Copier package.json et package-lock.json dans le conteneur (`COPY`)
4. Lancer la (fameuse) commande qui installe les dépendances du projet (`RUN`)
5. Copier tous les autres fichiers / dossiers
7. Exposer le port sur lequel écoutera l'application Node (donc le conteneur) (`EXPOSE`)
8. Définir la commande de lancement du conteneur : lancer le process Node (`CMD`)

> Note : mais quel port doit être exposé ??? 🤔  
> indice : regardez dans votre fichier `api/.env`.

<details><summary>fichier <code>Dockerfile.api</code></summary>

```bash
# On part d'une image existante
FROM node:20

# Repertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie de package.json et package-lock.json dans le conteneur
COPY ./package.json ./package-lock.json ./

# On lance NPM pour l'installation des dépendances
RUN npm i

# Copie du code dans le conteneur
COPY . .

# On expose le port 3000
EXPOSE 3000

# On lance l'application
CMD [ "npm", "start" ]
```

</details>

### Création de l'image

Créer une image à partir de ce `Dockerfile` (une histoire de commande `docker build`).

Vérifier la bonne création de celle ci à l'aide du CLI de Docker.

<details><summary>Un coup de main ?</summary>

Dans le répertoire du Dockerfile, lancer la commande :

```bash
docker build -f Dockerfile.api -t okanban-api .
```

Pour rappel :

- `docker` : c'est la commande principale, qui lance l'application **docker**
- `build` : on indique à **docker** de construire une image
- `-f Dockerfile.api` : on passe le nom du fichier Dockerfile
- `-t okanban-api` : le nom que l'on donne à notre image
- `.` : chemin où trouver le Dockerfile (`.` = "ici")

Vérifier que l'image existe :

```bash
docker images
```

On doit avoir une ligne de la forme :

```
okanban-api        latest    c2d9110adac0   1 minutes ago   1.16GB
```
</details>

## Création d'un conteneur

Créer un conteneur à partir de l'image créée précédemment, en liant un port de l'hôte avec le port exposé du conteneur.

C'est une histoire de `run` avec des ports et un nom...

<details><summary>C'est quoi les options ???</summary>

Aller, la commande c'est celle-ci :

```bash
docker run -d -p 3000:3000 --name okanban-api okanban-api
```

- `run` : pour lancer un conteneur à partir d'une image
- `-d` : faire tourner le conteneur en tâche de fond
- `p` : définir les ports exposés (hôte:contenur)
- `--name okanban-api okanban-api` : nom-conteneur nom-image

</details>

Maintenant que le conteneur est lancé, on peut lancer le client pour voir comment ça tourne :

- ouvrir un autre terminal
- aller dans le répertoire `client`
- `npm run dev`

Hum... un message d'erreur ?  
Un petit `F12` pour observer l'onglet réseau. Une erreur `500` sur la requête vers `lists` ?

### Inspecter les logs !

Regardons les logs ! (revenir dans le bon terminal)

```bash
docker logs okanban-api
```

Apparemment (sauf autre erreur liée au Dockerfile), notre conteneur n'est pas capable de trouver la base de données.

C'est une sécurité de Docker :

- un conteneur ne peut pas accéder au système hôte ;
- un conteneur ne peut pas accéder à un autre conteneur, sauf s'ils sont placé sur un même "réseau Docker".

On arrête le conteneur :

```bash
docker stop okanban-api
```

et on le supprime :

```bash
docker container rm okanban-api
```

## Conteneur de base de données

Dans le répertoire `api`, créer un fichier `Dockerfile.database` et y placer le contenu suivant (lire le code quand même, des fois qu'il y ait des boulettes...):

```bash
# On part d'une image existante
FROM postgres:16

# Repertoire de travail dans le conteneur
WORKDIR /etc/postgresql

# Définition des variables d'environnement
ENV POSTGRES_USER=okanban
ENV POSTGRES_DB=okanban
# On utilise une variable qui sera passée à la création
# de l'image pour le mot de passe : pas besoin de prendre
# le risque d'exposer des infos sensibles sur GitHub par exemple
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Ajout des scripts d'initialisation
# @see: https://hub.docker.com/_/postgres
COPY ./data/create_tables.sql /docker-entrypoint-initdb.d/create_table.sql

# Documenter le port 5432 du conteneur 
EXPOSE 5432
```

On constuit et on vérifie :

```bash
# Build l'image
docker build -f Dockerfile.database -t okanban-database .

# Vérifier que l'image existe
docker images

# Lancer un conteneur
# On passe le mot de passe de la BDD avec l'option -e
docker run -d -p 5433:5432 --name okanban-database -e POSTGRES_PASSWORD=okanban okanban-database

# Vérifier les logs
docker logs okanban-database

# Vérifier l'accès à la BDD via psql
psql -h localhost -p 5433 -U okanban -d okanban
```

Maintenant que le conteneur de base de données est créé et lancé, voyons comment y connecter notre back.

Commençons par arrêter notre conteneur :

```bash
docker stop okanban-database
```

et supprimons le conteneur :

```bash
docker container rm okanban-database
```

## Création d'un réseau de conteneurs

On crée un réseau de conteneurs, dans lequel on placera nos deux conteneurs :

```bash
# Création d'un network
docker network create okanban-network

# Vérification 
docker network ls
```

## Lancer un conteneur pour la base de données

On va relancer le conteneur de base de données, mais en lui indiquant de passer par le réseau `okanban-network` :

```bash
# Lancer un conteneur sur le bon réseau
docker run -d --name okanban-database -e POSTGRES_PASSWORD=okanban --network=okanban-network okanban-database

# Vérification
docker ps
```

## Lancer un conteneur pour l'API REST

Modifier le `.env` pour changer l'URL de la base de données :

- `PG_URL=postgres://okanban:okanban@okanban-database:5432/okanban` 
  - on note ici qu'il faut **remplacer l'hôte par le nom du conteneur sur le réseau** !

```bash
# Re-build l'image à partir du Dockerfile
docker build -f Dockerfile.api -t okanban-api .

# Lancer un conteneur sur le bon réseau
docker run -d -p 3000:3000 --name okanban-api --network=okanban-network okanban-api

# Vérification
docker ps
```

Plus qu'à tester dans son navigateur favori !

## Bonus

Créer un conteneur pour le front... Bon courage 💪

Bon, un ou deux petits trucs quand même :

- il faut construire le projet en mode production
- pour lancer le mode `preview` et indiquer à Vite de partager le réseau, il faut passer une option `-- --host`

<details><summary>Solution</summary>

**Fichier `client/Dockerfile.cli`**

```bash
# On part d'une image existante
FROM node:20

# Repertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Copie de package.json et package-lock.json dans le conteneur
COPY ./package.json ./package-lock.json ./

# On lance NPM pour l'installation des dépendances
RUN npm i

# Copie du code dans le conteneur
COPY . .

# On lance la construction de l'application
RUN npm run build

# On expose le port 4173
EXPOSE 4173

# On lance l'application
CMD [ "npm", "run", "preview", "--", "--host" ]
```

Commandes :

```bash
# construction de l'image
docker build -f Dockerfile.cli -t okanban-cli .

# lancement du conteneur, on le partage sur le port 8080 (par exemple)
docker run -d -p 8080:4173 --name okanban-cli --network=okanban-network okanban-cli
```

Et lancer le navigateur sur http://localhost:8080/.

</details>
