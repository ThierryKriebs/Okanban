
import { sequelize } from '../models/index.js';
import { populateTests } from '../migrations/populateTests.js';

beforeEach(async () => {
    console.log("coucou: " + process.env.PG_URL);
    await sequelize.sync({ force: true });
    await populateTests();
});

afterAll(async () => {
    await sequelize.close();
});