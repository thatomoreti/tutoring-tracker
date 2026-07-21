const pool = require('../config/db');

exports.getAllSubjects = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getSubjectById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE subject_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { subject_name, hourly_rate } = req.body;
    if (!subject_name || !hourly_rate) {
      return res.status(400).json({ message: 'subject_name and hourly_rate are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO subjects (subject_name, hourly_rate) VALUES (?, ?)',
      [subject_name, hourly_rate]
    );
    res.status(201).json({ subject_id: result.insertId, subject_name, hourly_rate });
  } catch (err) {
    next(err);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const { subject_name, hourly_rate } = req.body;
    const [result] = await pool.query(
      'UPDATE subjects SET subject_name = ?, hourly_rate = ? WHERE subject_id = ?',
      [subject_name, hourly_rate, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM subjects WHERE subject_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Subject not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};