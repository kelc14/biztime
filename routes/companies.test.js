// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies
    VALUES ('sb', 'Springboard', 'Online learning.') 
    RETURNING *;`
  );

  testCompany = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
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
      code: "ibm",
      name: "IBM",
      description: "Big blue.",
    });

    expect(res.statusCode).toBe(201);
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
