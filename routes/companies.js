/** Routes for companies of biztime. */

// npm packages
const express = require("express");
const slugify = require("slugify");

// local
const ExpressError = require("../expressError");

// use router
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Company code ${code} not found`, 404);
    }
    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let code = slugify(name, { lower: true });
    const checkUniqueCode = await db.query(
      "SELECT * FROM companies WHERE code = $1",
      [code]
    );

    if (checkUniqueCode.rows.length > 0) {
      throw new ExpressError(
        `Company with name ${name} already exists.  Please enter new company name.`,
        400
      );
    }
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ user: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { code } = req.params;

    const results = await db.query(
      "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404);
    }
    return res.send({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const results = await db.query(
      "DELETE FROM companies WHERE code = $1 RETURNING *",
      [code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't locate company with code of ${code}`, 404);
    }
    return res.send({ status: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
