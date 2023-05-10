/** Routes for companies of biztime. */

// npm packages
const express = require("express");

// local
const ExpressError = require("../expressError");
const helpers = require("../helper");

// use router
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT id, comp_code FROM invoices`);

    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE id = $1 ",
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice id ${id} not found`, 404);
    }
    debugger;
    // create invoice with company data included :
    const data = result.rows[0];
    const invoice = helpers.createInvoice(data);

    return res.json({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    const results = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code",
      [comp_code, amt]
    );
    return res.status(201).json({ invoices: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { amt, paid } = req.body;
    const { id } = req.params;
    let paid_date = "";

    const invoiceResult = await db.query(
      `SELECT paid FROM invoices WHERE id = $1`,
      [id]
    );
    if (invoiceResult.rows.length === 0) {
      throw new ExpressError(`Invoice ${id} does not exist`, 404);
    }
    let currentPaidDate = invoiceResult.paid_date;

    // if paying: let paid_date = new Date().toJSON();
    // if not paying paid = null
    // else if already paid keep the same
    if (!currentPaidDate && paid) {
      date = new Date();
      paid_date = date.toISOString();
    } else if (!currentPaidDate) {
      paid_date = null;
    } else {
      paid_date = currentPaidDate;
    }
    const results = await db.query(
      "UPDATE invoices SET amt=$1, paid_date=$2 WHERE id=$3 RETURNING *",
      [amt, paid_date, id]
    );

    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const results = await db.query(
      "DELETE FROM invoices WHERE id = $1 RETURNING *",
      [id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(`Can't locate invoice with id of ${id}`, 404);
    }
    return res.send({ status: "Deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
