/** Routes for companies of biztime. */

// npm packages
const express = require("express");

// local
const ExpressError = require("../expressError");

// use router
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT code, industry FROM industries`);

    return res.json({ industries: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query(
      `SELECT industry, comp_code 
      FROM industries AS i 
      JOIN companies_industries AS ci 
      ON i.code = ci.code 
      WHERE i.code = $1`,
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Companies with code ${code} not found`, 404);
    }
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    console.log(code, industry);
    const results = await db.query(
      "INSERT INTO industries VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    console.log(results.rows);
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const results = await db.query(
      "DELETE FROM industries WHERE code = $1 RETURNING *",
      [code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Can't locate industry with code of ${code}`, 404);
    }
    return res.send({ status: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
