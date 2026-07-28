const pool = require('../config/db');

const CAPS_SUBJECTS = [
  'Mathematics',
  'Mathematical Literacy',
  'Physical Sciences',
  'Life Sciences',
  'English Home Language',
  'English First Additional Language',
  'Afrikaans',
  'isiZulu',
  'isiXhosa',
  'Sepedi',
  'Setswana',
  'Sesotho',
  'Geography',
  'History',
  'Accounting',
  'Business Studies',
  'Economics',
  'Life Orientation',
  'Information Technology',
  'Computer Applications Technology',
  'Agricultural Sciences',
  'Tourism',
  'Consumer Studies',
  'Engineering Graphics and Design',
  'Visual Arts',
  'Dramatic Arts',
  'Music',
];

const MIN_RATE = 1;
const MAX_RATE = 5000;
const RATE_REGEX = /^\d+(\.\d{1,2})?$/;

function validateSubjectInput(data, { partial = false } = {}) {
  const errors = [];
  const { subject_name, hourly_rate } = data;

  if (!partial || subject_name !== undefined) {
    if (!subject_name) {
      errors.push('subject_name is required');
    } else if (!CAPS_SUBJECTS.includes(subject_name)) {
      errors.push('subject_name must be a recognized CAPS curriculum subject');
    }
  }

  if (!partial || hourly_rate !== undefined) {
    if (hourly_rate === undefined || hourly_rate === null || hourly_rate === '') {
      errors.push('hourly_rate is required');
    } else {
      const rateStr = String(hourly_rate);
      const rateNum = Number(hourly_rate);
      if (!RATE_REGEX.test(rateStr)) {
        errors.push('hourly_rate can have at most 2 decimal places');
      } else if (!Number.isFinite(rateNum) || rateNum < MIN_RATE || rateNum > MAX_RATE) {
        errors.push(`hourly_rate must be between ${MIN_RATE} and ${MAX_RATE}`);
      }
    }
  }

  return errors;
}

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
    const errors = validateSubjectInput(req.body);
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const { subject_name, hourly_rate } = req.body;
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
    const errors = validateSubjectInput(req.body, { partial: true });
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

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