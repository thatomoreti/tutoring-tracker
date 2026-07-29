const pool = require('../config/db');

const PAYMENT_METHODS = ['cash', 'eft', 'card', 'other'];
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

async function validatePaymentInput(data) {
  const errors = [];
  const { invoice_id, learner_id, amount, payment_date, payment_method, reference_number } = data;

  let invoice = null;

  if (!invoice_id) {
    errors.push('invoice_id is required');
  } else {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE invoice_id = ?', [invoice_id]);
    if (rows.length === 0) {
      errors.push('invoice_id does not reference an existing invoice');
    } else {
      invoice = rows[0];
    }
  }

  if (!learner_id) {
    errors.push('learner_id is required');
  } else if (invoice && Number(learner_id) !== invoice.learner_id) {
    errors.push('learner_id does not match the learner on this invoice');
  }

  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else {
    const amountStr = String(amount);
    const amountNum = Number(amount);
    if (!AMOUNT_REGEX.test(amountStr)) {
      errors.push('amount can have at most 2 decimal places');
    } else if (!Number.isFinite(amountNum) || amountNum <= 0) {
      errors.push('amount must be greater than 0');
    } else if (invoice) {
      const [[{ total_paid }]] = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ?',
        [invoice_id]
      );
      const remaining = Number(invoice.total_amount) - Number(total_paid);
      if (amountNum > remaining + 0.01) { // small epsilon for float rounding
        errors.push(`amount cannot exceed the outstanding balance (${remaining.toFixed(2)})`);
      }
    }
  }

  if (!payment_date) {
    errors.push('payment_date is required');
  } else {
    const today = new Date().toISOString().slice(0, 10);
    if (payment_date > today) {
      errors.push('payment_date cannot be in the future');
    } else if (invoice) {
      const issuedDate = invoice.issued_date.toISOString().slice(0, 10);
      if (payment_date < issuedDate) {
        errors.push(`payment_date cannot be before the invoice's issued date (${issuedDate})`);
      }
    }
  }

  if (!payment_method) {
    errors.push('payment_method is required');
  } else if (!PAYMENT_METHODS.includes(payment_method)) {
    errors.push(`payment_method must be one of: ${PAYMENT_METHODS.join(', ')}`);
  }

  if (reference_number !== undefined && reference_number !== null && reference_number.length > 50) {
    errors.push('reference_number must be under 50 characters');
  }

  return errors;
}

exports.getAllPayments = async (req, res, next) => {
  try {
    const { learner_id } = req.query;
    let query = `SELECT p.*, l.first_name, l.last_name
                 FROM payments p
                 JOIN learners l ON p.learner_id = l.learner_id`;
    const params = [];
    if (learner_id) {
      query += ' WHERE p.learner_id = ?';
      params.push(learner_id);
    }
    query += ' ORDER BY p.payment_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const errors = await validatePaymentInput(req.body);
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const { invoice_id, learner_id, amount, payment_date, payment_method, reference_number, notes } = req.body;

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO payments (invoice_id, learner_id, amount, payment_date, payment_method, reference_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_id, learner_id, amount, payment_date, payment_method, reference_number?.trim() || null, notes]
    );

    const [[invoice]] = await connection.query('SELECT total_amount FROM invoices WHERE invoice_id = ?', [invoice_id]);
    const [[{ total_paid }]] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = ?',
      [invoice_id]
    );

    const newStatus = total_paid >= invoice.total_amount ? 'paid' : 'partially_paid';
    await connection.query('UPDATE invoices SET status = ? WHERE invoice_id = ?', [newStatus, invoice_id]);

    await connection.commit();
    res.status(201).json({ payment_id: result.insertId, invoice_id, amount, invoice_status: newStatus });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM payments WHERE payment_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Payment not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};