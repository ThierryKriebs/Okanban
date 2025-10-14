
import { sequelize } from '../models/index.js';
import { populateTests } from '../migrations/populateTests.js';

beforeEach(async () => {
    const temp = process.env.PG_URL
    console.log("coucou: " + temp);
    await sequelize.sync({ force: true });
    await populateTests();
});

afterAll(async () => {
    await sequelize.close();
});