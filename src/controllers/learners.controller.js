const pool = require('../config/db');

exports.getAllLearners = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM learners ORDER BY last_name, first_name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getLearnerById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM learners WHERE learner_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Learner not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createLearner = async (req, res, next) => {
  try {
    const { first_name, last_name, grade_level, guardian_contact, start_date } = req.body;
    if (!first_name || !last_name || !start_date) {
      return res.status(400).json({ message: 'first_name, last_name, and start_date are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO learners (first_name, last_name, grade_level, guardian_contact, start_date)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, grade_level, guardian_contact, start_date]
    );
    res.status(201).json({ learner_id: result.insertId, first_name, last_name, grade_level, guardian_contact, start_date });
  } catch (err) {
    next(err);
  }
};

exports.updateLearner = async (req, res, next) => {
  try {
    const { first_name, last_name, grade_level, guardian_contact, status } = req.body;
    const [result] = await pool.query(
      `UPDATE learners SET first_name = ?, last_name = ?, grade_level = ?, guardian_contact = ?, status = ?
       WHERE learner_id = ?`,
      [first_name, last_name, grade_level, guardian_contact, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Learner not found' });
    res.json({ message: 'Learner updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteLearner = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM learners WHERE learner_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Learner not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};