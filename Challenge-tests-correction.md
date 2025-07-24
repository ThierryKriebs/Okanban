# Challenge tests - Correction

## Échauffement : tests unitaires

### Exercice 1 : `toTitleCase(str)`

<details><summary>Fichier <code>unit-test/toTitleCase.js</code></summary>

```js
/**
 * Retourne une chaîne de caractères dont la première lettre de 
 * chaque mot est en majuscule et les autres lettres en minuscules.
 * @param {string} str 
 * @returns string
 */
export function toTitleCase(str) {
  return (!str || !str.length) ? '' : str.toLowerCase().split(' ').map((s) => s.length ? s[0].toUpperCase() + s.substring(1) : s).join(' ');
}
```

</details>

<details><summary>Fichier <code>unit-test/toTitleCase.unit.test.js</code></summary>

```js
import { describe, it } from "node:test";
import assert from "node:assert";
import { toTitleCase } from "./toTitleCase.js";

describe('toTitleCase()', () => {
  it('Mot en minuscules', () => {
    const result = toTitleCase("oclock");
    assert.equal(result, "Oclock");
  });
  it('Mot avec majuscules, chiffres et caractère spécial', () => {
    const result = toTitleCase("oCL0ck!");
    assert.equal(result, "Ocl0ck!");
  });
  it('Chaîne vide', () => {
    const result = toTitleCase("");
    assert.equal(result, "");
  });
  it('Deux mots', () => {
    const result = toTitleCase("Hello world");
    assert.equal(result, "Hello World");
  });
  it('Deux mots en majuscules', () => {
    const result = toTitleCase("BONJOUR MONDE");
    assert.equal(result, "Bonjour Monde");
  });
  it('Longue chaîne de caractères', () => {
    const result = toTitleCase("Mais qu'est-ce qu'il se passe ici ?");
    assert.equal(result, "Mais Qu'est-ce Qu'il Se Passe Ici ?");
  });
});
```

</details>

### Bonus tests unitaires : `computeStrength(level)`

<details><summary>Fichier <code>unit-tests/game.js</code></summary>

```js
/**
 * Retourne le nombre de points selon le niveau.
 * @param {number} level 
 * @returns number
 */
export function computeStrength(level) {
  // nombre de points
  let points = 0;

  // sur les niveaux supérieurs à 200
  // par exemple level = 205
  if (level > 200) {
    // le personnage gagne 1 point tous les 5 niveaux
    // on calcul le nombre de niveaux au dessus de 200
    //  - level - 200
    //  - on divise le résultat par 5 (1 point tous les 5 niveaux)
    //  - on récupère la partie entière
    // par exemple (205 - 200) = 5, 5 / 5 = 1
    points += Math.trunc((level - 200) / 5);
    // on met à jour le niveau pour poursuivre le calcul
    // par exemple 205 - 200 = 5, level = 205 - 5 = 200
    level -= (level - 200);
  }

  if (level > 100) {
    points += Math.trunc((level - 100) / 3);
    level -= (level - 100);
  }

  if (level > 50) {
    points += Math.trunc((level - 50) / 2);
    level -= (level - 50);
  }

  // ici il reste au maximum level = 50
  points += level;

  return points;
}
```

</details>

<details><summary>Fichier <code>unit-tests/game.unit.test.js</code></summary>

```js
import { describe, it } from "node:test";
import assert from "node:assert";
import { computeStrength } from "./game.js";

describe('computeStrength(level)', () => {
  it('Niveau 1', () => {
    const result = computeStrength(1);
    assert.equal(result, 1);
  });
  it('Niveau 50', () => {
    const result = computeStrength(50);
    assert.equal(result, 50);
  });
  it('Niveau 51', () => {
    const result = computeStrength(51);
    assert.equal(result, 50);
  });
  it('Niveau 52', () => {
    const result = computeStrength(52);
    assert.equal(result, 51);
  });
  it('Niveau 100', () => {
    const result = computeStrength(100);
    assert.equal(result, 75);
  });
  it('Niveau 101', () => {
    const result = computeStrength(101);
    assert.equal(result, 75);
  });
  it('Niveau 200', () => {
    const result = computeStrength(200);
    assert.equal(result, 108);
  });
  it('Niveau 205', () => {
    const result = computeStrength(205);
    assert.equal(result, 109);
  });
  it('Niveau 500', () => {
    const result = computeStrength(500);
    assert.equal(result, 168);
  });
});
```

</details>

## O'kanban : tests d'intégration

### Mise en place de l'environnement

> **:warning: se placer dans le répertoire `api`**

Mettre en place l'environnement pour les tests :

- une base de données de tests  
  <details>

  ```
  $ sudo -i -u postgres
  [sudo] Mot de passe de teacher : 
  postgres@teacher:~$ psql
  psql (14.12 (Ubuntu 14.12-0ubuntu0.22.04.1))
  Type "help" for help.
  
  postgres=# CREATE ROLE okanban-test WITH LOGIN PASSWORD 'okanban-test';
  CREATE ROLE
  postgres=# CREATE DATABASE okanban-test OWNER 'okanban-test';
  CREATE DATABASE
  postgres=# 
  ```

  </details>

- un fichier `.env.test` dédié
- installer Jest : `npm i --save-dev jest`
- configurer le fichier `package.json` pour avoir une commande `test:spec` permettant de lancer les tests d'intégration  
  <details>

  ```
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "db:create": "node src/migrations/createTables.js",
    "db:seed": "node src/migrations/populateTables.js",
    "db:reset": "npm run db:create && npm run db:seed",
    "test:spec": "DOTENV_CONFIG_PATH=.env.test NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --testPathPattern=spec.test --setupFilesAfterEnv=./src/config/setup-jest.js"
  },
  ```

  </details>
- mettre en place la configuration de Jest (`src/config/setup-jest.js`)  
  <details>

  ```js
  import sequelize from '../models';
  
  beforeEach(async () => {
      await sequelize.sync({ force: true });
  });
  
  afterAll(async () => {
      await sequelize.close();
  });
  ```

  </details>

### Tests

#### `listController`

Installer [node-mock-http](https://github.com/eugef/node-mocks-http) : `npm install node-mocks-http --save-dev`

Utilisation dans `src/controller/listController.spec.test.js`

<details>

```js
import { getAllLists } from "./listController";
import httpMocks from "node-mocks-http";

describe('listController tests', () => {
  test('Get all lists', async() => {
    // pour la requête, pas de donnée
    const req = {};
    // une fausse réponse qui fonctionne
    const res = httpMocks.createResponse();

    // on lance le contrôleur
    await getAllLists(req, res);
    
    // on peut vérifier le code de retour HTTP
    expect(res.statusCode).toEqual(200);

    // on peut récupérer la liste des listes au format JSON
    const lists = res._getJSONData();
    
    // et observer le résultat avant d'aller plus loin
    console.log(lists, lists.length);
  });
});
```

</details>

Créer le fichier `src/migrations/populateTests.js` pour créer les données de tests

<details>

```js
import { Card, List, Tag } from "../models/index.js";

// jeux de données pour les tests
export const populateTests = async() => {
  console.log("🚧 Ajout de listes de test...");
  const shoppingList  = await List.create({ title: "Liste des courses", position: 1 });
  const studentsList  = await List.create({ title: "Liste des apprennants", position: 3 });
  const birthdaysList = await List.create({ title: "Liste des anniversaires", position: 2 });

  console.log("🚧 Ajout de cartes de test...");
  const coffeeCard    = await Card.create({ content: "Café", color: "#5c3715", list_id: shoppingList.id });
  await Card.create({ content: "Thé", color: "#0d3d0f", list_id: shoppingList.id });
  const reblochonCard = await Card.create({ content: "Reblochon savoyard", list_id: shoppingList.id});

  const momBirthday   = await Card.create({ content: "Maman le 01/01/1970", position: 1, list_id: birthdaysList.id });
  await Card.create({ content: "Mamie le 01/01/1940", position: 2, list_id: birthdaysList.id });

  await Card.create({ content: "John Doe", position: 1, list_id: studentsList.id });

  console.log("🚧 Ajout de tags de test...");
  const urgentTag = await Tag.create({ name: "Urgent", color: "#FF0000"});
  const ecoTag    = await Tag.create({ name: "Eco-responsable", color: "#00FF00"});

  console.log("🚧 Ajout de tags sur nos cartes...");
  await coffeeCard.addTag(urgentTag);
  await coffeeCard.addTag(ecoTag);
  await momBirthday.addTag(urgentTag);
  await reblochonCard.addTag(urgentTag);


  console.log("✅ Migration OK !");
};
```

</details>

Modifier le fichier `src/config/setup-js` pour appeler la fonction `populateTests()`

<details>

```js
import { sequelize } from '../models/index.js';
import { populateTests } from '../migrations/populateTests.js';

beforeEach(async () => {
    await sequelize.sync({ force: true });
    await populateTests();
});

afterAll(async () => {
    await sequelize.close();
});
```

</details>

Écrire les tests pour le contrôleur, normalement on doit tester tous les cas... C'est long, mais c'est le job 😮‍💨 On peut regrouper les cas de tests des fonctions dans des sous `describe()`.

<details>

```js

import { getAllLists, createList, getOneList, updateList, deleteList } from "./listController";
import httpMocks from "node-mocks-http";

describe('listController tests', () => {
  describe('getAllLists()', () => {
    test('Get all lists', async() => {
      // pour la requête, pas de donnée
      const req = {};
      // une fausse réponse qui fonctionne
      const res = httpMocks.createResponse();

      await getAllLists(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(200);

      // on peut récupérer la liste des listes au format JSON
      const lists = res._getJSONData();
      
      // on doit avoir 3 listes
      expect(lists.length).toEqual(3);
    });
  });

  describe('createList()', () => {
    test('Create a new list', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        body: {
          title: 'Ma nouvelle liste',
          position: 1
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await createList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(201);

      // on peut récupérer la nouvelle liste au format JSON
      const createdList = res._getJSONData();

      //console.log(createdList);
      
      // on peut tester le titre et la position
      expect(createdList.title).toEqual('Ma nouvelle liste');
      expect(createdList.position).toEqual(1);
    });

    test('Create a new list without title', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        body: {
          position: 1
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await createList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(400);

      // on peut récupérer la réponse au format JSON
      const data = res._getJSONData();
      
      // on peut tester le message d'erreur
      expect(data.error).toEqual('Property \'title\' should be a non empty string.');
    });

    test('Create a new list with non numeric position', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        body: {
          title: 'Une nouvelle carte',
          position: "une"
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await createList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(400);

      // on peut récupérer la réponse au format JSON
      const data = res._getJSONData();
      
      // on peut tester le message d'erreur
      expect(data.error).toEqual('Property \'position\' should be a positive integer when provided.');
    });
  });

  describe('getOneList()', () => {
    test('Get one list', async() => {
      // on a besoin d'un paramètre d'URL : l'id
      const req = httpMocks.createRequest({
        params: {
          id: 1
        }
      });
      const res = httpMocks.createResponse();

      await getOneList(req, res);

      // est-ce que la réponse est OK ?
      expect(res.statusCode).toEqual(200);
      
      // on peut récupérer la nouvelle liste au format JSON
      const list = res._getJSONData();

      // on peut tester les infos par rapport au jeu de données
      expect(list.title).toEqual('Liste des courses');
    });

    test('Get one list with string parameter', async() => {
      // on a besoin d'un paramètre d'URL : l'id
      // on passe un id sous forme de chaîne de caractère
      const req = httpMocks.createRequest({
        params: {
          id: "mauvaisId"
        }
      });
      const res = httpMocks.createResponse();

      await getOneList(req, res);

      // est-ce que la réponse est 404 ?
      expect(res.statusCode).toEqual(404);

      // on peut récupérer la réponse au format JSON
      const data = res._getJSONData();

      // on peut tester les infos par rapport au jeu de données
      expect(data.error).toEqual('List not found. Please verify the provided ID.');
    });

    test('Get one list not exists', async() => {
      // on a besoin d'un paramètre d'URL : l'id
      // on passe un id qui n'existe pas
      const req = httpMocks.createRequest({
        params: {
          id: 1025
        }
      });
      const res = httpMocks.createResponse();

      await getOneList(req, res);

      // est-ce que la réponse est 404 ?
      expect(res.statusCode).toEqual(404);

      // on peut récupérer la réponse au format JSON
      const data = res._getJSONData();

      // on peut tester les infos par rapport au jeu de données
      expect(data.error).toEqual('List not found. Please verify the provided ID.');
    });
  });

  describe('updateList()', () => {
    test('Update list #1', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 1
        },
        body: {
          title: 'Mon nouveau titre',
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await updateList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(200);

      // on peut récupérer la nouvelle liste au format JSON
      const updatedList = res._getJSONData();
      
      // on peut tester le titre et la position
      expect(updatedList.title).toEqual('Mon nouveau titre');
      expect(updatedList.position).toEqual(1);
    });

    test('Update list #1 without data', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 1
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await updateList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(400);
    });

    test('Update list with non numeric id', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 'abc'
        },
        body: {
          title: 'Mon nouveau titre',
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await updateList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(404);
    });

    test('Update list #1500', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 1500
        },
        body: {
          title: 'Mon nouveau titre',
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await updateList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('deleteList()', () => {
    test('Delete list #1', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 1
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await deleteList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(204);
    });

    test('Delete list #1500', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 1500
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await deleteList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(404);
    });

    test('Delete list with non numeric id', async() => {
      // pour la requête, nouvelle donnée
      const req = httpMocks.createRequest({
        params: {
          id: 'abc'
        }
      });
      // une fausse réponse
      const res = httpMocks.createResponse();

      await deleteList(req, res);
      
      // on peut vérifier le code de retour HTTP
      expect(res.statusCode).toEqual(404);
    });
  });
});

```

</details>

### Bonus - `body-sanitizer`

Fichier `src/middlewares/body-sanitizer.unit.test.js`

<details>

```js
import { bodySanitizerMiddleware } from "./body-sanitizer";
import httpMocks from "node-mocks-http";
import { jest } from "@jest/globals";

describe('bodySanitizerMiddleware()', () => {
  test('Sanitize body', () => {
    const req = httpMocks.createRequest({
      body: {
        title: '<span class="test-class">hello world</span>',
        description: '<p id="test-id">Hello!</p>'
      }
    });

    bodySanitizerMiddleware(req, {}, jest.fn());

    expect(req.body.title).toEqual('<span>hello world</span>');
    expect(req.body.description).toEqual('<p>Hello!</p>');
  })
});
```

</details>