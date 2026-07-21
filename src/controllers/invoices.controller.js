const pool = require('../config/db');

exports.getAllInvoices = async (req, res, next) => {
  try {
    const { learner_id } = req.query;
    let query = `SELECT i.*, l.first_name, l.last_name
                 FROM invoices i
                 JOIN learners l ON i.learner_id = l.learner_id`;
    const params = [];
    if (learner_id) {
      query += ' WHERE i.learner_id = ?';
      params.push(learner_id);
    }
    query += ' ORDER BY i.issued_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const [invoiceRows] = await pool.query('SELECT * FROM invoices WHERE invoice_id = ?', [req.params.id]);
    if (invoiceRows.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const [lineItems] = await pool.query('SELECT * FROM invoice_line_items WHERE invoice_id = ?', [req.params.id]);
    res.json({ ...invoiceRows[0], line_items: lineItems });
  } catch (err) {
    next(err);
  }
};

// Generates an invoice from unbilled sessions in a date range for one learner
exports.createInvoice = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { learner_id, period_start, period_end, due_date } = req.body;
    if (!learner_id || !period_start || !period_end || !due_date) {
      return res.status(400).json({ message: 'learner_id, period_start, period_end, and due_date are required' });
    }

    await connection.beginTransaction();

    // Pull sessions in range not yet billed (no existing line item referencing them)
    const [sessions] = await connection.query(
      `SELECT s.session_id, s.duration_minutes, s.session_date, sub.subject_name, sub.hourly_rate
       FROM sessions s
       JOIN subjects sub ON s.subject_id = sub.subject_id
       WHERE s.learner_id = ? AND s.session_date BETWEEN ? AND ? AND s.attended = TRUE
       AND s.session_id NOT IN (SELECT session_id FROM invoice_line_items WHERE session_id IS NOT NULL)`,
      [learner_id, period_start, period_end]
    );

    if (sessions.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'No unbilled sessions found in this period' });
    }

    const lineItems = sessions.map(s => {
      const quantity = +(s.duration_minutes / 60).toFixed(2);
      const line_total = +(quantity * s.hourly_rate).toFixed(2);
      return { session_id: s.session_id, description: `${s.subject_name} - ${s.session_date}`, quantity, unit_price: s.hourly_rate, line_total };
    });
    const subtotal = +lineItems.reduce((sum, li) => sum + li.line_total, 0).toFixed(2);
    const invoice_number = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices (learner_id, invoice_number, period_start, period_end, subtotal, tax_amount, total_amount, status, issued_date, due_date)
       VALUES (?, ?, ?, ?, ?, 0, ?, 'sent', CURDATE(), ?)`,
      [learner_id, invoice_number, period_start, period_end, subtotal, subtotal, due_date]
    );
    const invoice_id = invoiceResult.insertId;

    for (const li of lineItems) {
      await connection.query(
        `INSERT INTO invoice_line_items (invoice_id, session_id, description, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [invoice_id, li.session_id, li.description, li.quantity, li.unit_price, li.line_total]
      );
    }

    await connection.commit();
    res.status(201).json({ invoice_id, invoice_number, subtotal, total_amount: subtotal, line_items: lineItems });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

exports.updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const [result] = await pool.query('UPDATE invoices SET status = ? WHERE invoice_id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice status updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM invoices WHERE invoice_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};