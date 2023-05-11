/** BizTime express application. */

// npm packages
const express = require("express");

const app = express();

// local
const ExpressError = require("./expressError");

app.use(express.json());

// routes
const companyRoutes = require("./routes/companies");
app.use("/companies", companyRoutes);

const invoiceRoutes = require("./routes/invoices");
app.use("/invoices", invoiceRoutes);

const industriesRoutes = require("./routes/industries");
app.use("/industries", industriesRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    // message: err.message,
  });
});

module.exports = app;
