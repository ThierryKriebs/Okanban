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