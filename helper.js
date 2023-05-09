function createInvoice(data) {
  const invoice = {
    id: data.id,
    company: {
      code: data.comp_code,
      name: data.name,
      description: data.description,
    },
    amt: data.amt,
    paid: data.paid,
    add_date: data.add_date,
    paid_date: data.paid_date,
  };
  return invoice;
}

module.exports = {
  createInvoice,
};
