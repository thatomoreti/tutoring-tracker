const pool = require('../config/db');

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

// Records a payment and updates the related invoice's status
exports.createPayment = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { invoice_id, learner_id, amount, payment_date, payment_method, reference_number, notes } = req.body;
    if (!invoice_id || !learner_id || !amount || !payment_date || !payment_method) {
      return res.status(400).json({ message: 'invoice_id, learner_id, amount, payment_date, and payment_method are required' });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO payments (invoice_id, learner_id, amount, payment_date, payment_method, reference_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice_id, learner_id, amount, payment_date, payment_method, reference_number, notes]
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