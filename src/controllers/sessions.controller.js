const pool = require('../config/db');

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];
const MAX_NOTES_LENGTH = 500;

async function validateSessionInput(data, { partial = false } = {}) {
  const errors = [];
  const { learner_id, subject_id, session_date, duration_minutes, notes } = data;

  let learner = null;

  if (!partial || learner_id !== undefined) {
    if (!learner_id) {
      errors.push('learner_id is required');
    } else {
      const [rows] = await pool.query('SELECT learner_id, start_date FROM learners WHERE learner_id = ?', [learner_id]);
      if (rows.length === 0) {
        errors.push('learner_id does not reference an existing learner');
      } else {
        learner = rows[0];
      }
    }
  }

  if (!partial || subject_id !== undefined) {
    if (!subject_id) {
      errors.push('subject_id is required');
    } else {
      const [rows] = await pool.query('SELECT subject_id FROM subjects WHERE subject_id = ?', [subject_id]);
      if (rows.length === 0) errors.push('subject_id does not reference an existing subject');
    }
  }

  if (!partial || session_date !== undefined) {
    if (!session_date) {
      errors.push('session_date is required');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      if (session_date > today) {
        errors.push('session_date cannot be in the future');
      } else if (learner) {
        const learnerStart = learner.start_date.toISOString().slice(0, 10);
        if (session_date < learnerStart) {
          errors.push(`session_date cannot be before the learner's start date (${learnerStart})`);
        }
      }
    }
  }

  if (!partial || duration_minutes !== undefined) {
    if (!duration_minutes) {
      errors.push('duration_minutes is required');
    } else if (!DURATION_OPTIONS.includes(Number(duration_minutes))) {
      errors.push(`duration_minutes must be one of: ${DURATION_OPTIONS.join(', ')}`);
    }
  }

  if (notes !== undefined && notes !== null && notes.length > MAX_NOTES_LENGTH) {
    errors.push(`notes must be under ${MAX_NOTES_LENGTH} characters`);
  }

  return errors;
}

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
    const errors = await validateSessionInput(req.body);
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const { learner_id, subject_id, session_date, duration_minutes, attended, notes } = req.body;
    const [result] = await pool.query(
      `INSERT INTO sessions (learner_id, subject_id, session_date, duration_minutes, attended, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [learner_id, subject_id, session_date, duration_minutes, attended ?? true, notes?.trim() || null]
    );
    res.status(201).json({ session_id: result.insertId, learner_id, subject_id, session_date, duration_minutes, attended, notes });
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const errors = await validateSessionInput(req.body, { partial: true });
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const { session_date, duration_minutes, attended, notes } = req.body;
    const [result] = await pool.query(
      `UPDATE sessions SET session_date = ?, duration_minutes = ?, attended = ?, notes = ?
       WHERE session_id = ?`,
      [session_date, duration_minutes, attended, notes?.trim() || null, req.params.id]
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