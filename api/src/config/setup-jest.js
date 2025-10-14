import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // Charge .env.test

import { sequelize } from '../models/index.js';

// Crée une instance dédiée aux tests
export const testSequelize = new Sequelize(process.env.PG_URL, {
    define: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    logging: false,
  });


import { populateTests } from '../migrations/populateTests.js';

beforeEach(async () => {
    // await sequelize.sync({ force: true });
    // await populateTests();
    await testSequelize.sync({ force: true });
    await populateTests({ sequelize: testSequelize }); // Passe l'instance de test
});

afterAll(async () => {
    // await sequelize.close();
    await testSequelize.close();
});