// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeEach(async () => {
  const results = await db.query(
    `INSERT INTO industries VALUES ('tech', 'Technology') RETURNING *`
  );
  testIndustry = results.rows[0];

  const companyResults = await db.query(
    `INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.') RETURNING *;`
  );

  const companyIndustry = await db.query(`INSERT 
  INTO companies_industries VALUES ('apple', 'tech') RETURNING *`);
});

afterEach(async () => {
  await db.query(`DELETE FROM industries`);
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM companies_industries`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /industries", () => {
  test("Get a list of all industries", async () => {
    const res = await request(app).get("/industries");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ industries: [testIndustry] });
  });
});

describe("GET /industries/:code", () => {
  test("Get company codes of an industry by industry code", async () => {
    const res = await request(app).get(`/industries/${testIndustry.code}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [
        {
          comp_code: "apple",
          industry: "Technology",
        },
      ],
    });
  });

  test("Attempt to get details of an invoice that does not exist", async () => {
    const res = await request(app).get(`/industries/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /industries", () => {
  test("Add an industry", async () => {
    const res = await request(app).post(`/industries`).send({
      code: "edu",
      industry: "Education",
    });

    expect(res.statusCode).toBe(201);
  });
});

describe("DELETE /industries/:code", () => {
  test("Delete an industry", async () => {
    const res = await request(app).delete(`/industries/${testIndustry.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "Deleted" });
  });

  test("Attempt to delete an industry that does not exist", async () => {
    const res = await request(app).delete(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  });
});
