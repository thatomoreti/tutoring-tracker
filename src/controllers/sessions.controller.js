const pool = require('../config/db');

exports.getAllSessions = async (req, res, next) => {
  try {
    const { learner_id } = req.query;
    let query = `SELECT s.*, l.first_name, l.last_name, sub.subject_name
                 FROM sessions s
                 JOIN learners l ON s.learner_id = l.learner_id
                 JOIN subjects sub ON s.subject_id = sub.subject_id`;
    const params = [];
    if (learner_id) {
      query += ' WHERE s.learner_id = ?';
      params.push(learner_id);
    }
    query += ' ORDER BY s.session_date DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sessions WHERE session_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Session not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const { learner_id, subject_id, session_date, duration_minutes, attended, notes } = req.body;
    if (!learner_id || !subject_id || !session_date || !duration_minutes) {
      return res.status(400).json({ message: 'learner_id, subject_id, session_date, and duration_minutes are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO sessions (learner_id, subject_id, session_date, duration_minutes, attended, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [learner_id, subject_id, session_date, duration_minutes, attended ?? true, notes]
    );
    res.status(201).json({ session_id: result.insertId, learner_id, subject_id, session_date, duration_minutes, attended, notes });
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const { session_date, duration_minutes, attended, notes } = req.body;
    const [result] = await pool.query(
      `UPDATE sessions SET session_date = ?, duration_minutes = ?, attended = ?, notes = ?
       WHERE session_id = ?`,
      [session_date, duration_minutes, attended, notes, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM sessions WHERE session_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Session not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};