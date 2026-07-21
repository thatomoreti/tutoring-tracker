const pool = require('../config/db');

exports.getAllProgress = async (req, res, next) => {
  try {
    const { learner_id } = req.query;
    let query = `SELECT p.*, l.first_name, l.last_name, sub.subject_name
                 FROM progress_records p
                 JOIN learners l ON p.learner_id = l.learner_id
                 JOIN subjects sub ON p.subject_id = sub.subject_id`;
    const params = [];
    if (learner_id) {
      query += ' WHERE p.learner_id = ?';
      params.push(learner_id);
    }
    query += ' ORDER BY p.recorded_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getProgressById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM progress_records WHERE progress_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Progress record not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createProgress = async (req, res, next) => {
  try {
    const { learner_id, subject_id, session_id, assessment_name, score, max_score, recorded_date, remarks } = req.body;
    if (!learner_id || !subject_id || !recorded_date) {
      return res.status(400).json({ message: 'learner_id, subject_id, and recorded_date are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO progress_records (learner_id, subject_id, session_id, assessment_name, score, max_score, recorded_date, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [learner_id, subject_id, session_id, assessment_name, score, max_score, recorded_date, remarks]
    );
    res.status(201).json({ progress_id: result.insertId, ...req.body });
  } catch (err) {
    next(err);
  }
};

exports.updateProgress = async (req, res, next) => {
  try {
    const { assessment_name, score, max_score, remarks } = req.body;
    const [result] = await pool.query(
      `UPDATE progress_records SET assessment_name = ?, score = ?, max_score = ?, remarks = ?
       WHERE progress_id = ?`,
      [assessment_name, score, max_score, remarks, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Progress record not found' });
    res.json({ message: 'Progress record updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteProgress = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM progress_records WHERE progress_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Progress record not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};