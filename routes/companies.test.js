// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies
    VALUES ('springboard', 'Springboard', 'Online learning.') 
    RETURNING code, name, description`
  );

  testCompany = result.rows[0];

  const invoiceResults = await db.query(
    `INSERT INTO invoices (amt, comp_code)
      VALUES (99, 'springboard')
      RETURNING *`
  );
  invoiceResults.rows[0].add_date =
    invoiceResults.rows[0].add_date.toISOString();

  const insertIndustry = await db.query(
    `INSERT INTO industries (code, industry )
      VALUES ('tech', 'Technology')
      RETURNING *`
  );
  const insertCompanyIndustries = await db.query(
    `INSERT INTO companies_industries (comp_code, code )
      VALUES
          ('springboard', 'tech')`
  );

  const industryResults = await db.query(
    `SELECT industry
      FROM companies_industries AS ci
      JOIN industries AS i ON ci.code = i.code
      WHERE comp_code = 'springboard'`
  );

  testCompanyInvoices = invoiceResults.rows;
  testCompanyIndustries = industryResults.rows;
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
  await db.query(`DELETE FROM industries`);
  await db.query(`DELETE FROM companies_industries`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list of all companies", async () => {
    const res = await request(app).get("/companies");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Get details of a company by code", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    testCompany.invoices = testCompanyInvoices;
    testCompany.industries = testCompanyIndustries;

    expect(res.statusCode).toBe(200);

    expect(res.body).toEqual({ company: testCompany });
  });

  test("Attempt to get details of a company that does not exist", async () => {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("Add a company", async () => {
    const res = await request(app).post(`/companies`).send({
      name: "IBM",
      description: "Big blue.",
    });

    expect(res.statusCode).toBe(201);
  });

  test("Add a company that already exists, 400 error", async () => {
    const res = await request(app).post(`/companies`).send({
      name: "Springboard",
      description: "Big blue.",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /companies/:code", () => {
  test("Update a company", async () => {
    const res = await request(app).put(`/companies/${testCompany.code}`).send({
      name: "Springboard Collaborative",
      description: "Bootcamp courses",
    });
    testCompany.name = "Springboard Collaborative";
    testCompany.description = "Bootcamp courses";

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
  });

  test("Attempt to update a company that does not exist", async () => {
    const res = await request(app).put(`/companies/0`).send({
      name: "Springboard Collaborative",
      description: "Bootcamp courses",
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Delete a company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "Deleted" });
  });

  test("Attempt to delete a company that does not exist", async () => {
    const res = await request(app).delete(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});
