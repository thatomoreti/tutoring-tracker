const pool = require('../config/db');

const NAME_REGEX = /^[A-Za-z'\-\s]+$/;
const PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GRADE_REGEX = /^Grade (?:[1-9]|1[0-2])$/;
const MIN_START_DATE = '2000-01-01';

function validateLearnerInput(data, { partial = false } = {}) {
  const errors = [];
  const { first_name, last_name, grade_level, guardian_contact, start_date } = data;

  if (!partial || first_name !== undefined) {
    if (!first_name?.trim()) errors.push('first_name is required');
    else if (first_name.trim().length > 50) errors.push('first_name must be under 50 characters');
    else if (!NAME_REGEX.test(first_name.trim())) errors.push('first_name can only contain letters');
  }

  if (!partial || last_name !== undefined) {
    if (!last_name?.trim()) errors.push('last_name is required');
    else if (last_name.trim().length > 50) errors.push('last_name must be under 50 characters');
    else if (!NAME_REGEX.test(last_name.trim())) errors.push('last_name can only contain letters');
  }

  if (grade_level !== undefined && grade_level !== null && grade_level !== '') {
    if (!GRADE_REGEX.test(grade_level)) errors.push('grade_level must be in the format "Grade 1" through "Grade 12"');
  }

  if (guardian_contact !== undefined) {
    if (!guardian_contact?.trim()) {
      errors.push('guardian_contact is required');
    } else if (!PHONE_REGEX.test(guardian_contact.trim()) && !EMAIL_REGEX.test(guardian_contact.trim())) {
      errors.push('guardian_contact must be a valid SA phone number or email address');
    }
  }

  if (!partial || start_date !== undefined) {
    if (!start_date) {
      errors.push('start_date is required');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      if (start_date > today) errors.push('start_date cannot be in the future');
      else if (start_date < MIN_START_DATE) errors.push(`start_date must be after ${MIN_START_DATE}`);
    }
  }

  return errors;
}

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
    const errors = validateLearnerInput(req.body);
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const { first_name, last_name, grade_level, guardian_contact, start_date } = req.body;
    const [result] = await pool.query(
      `INSERT INTO learners (first_name, last_name, grade_level, guardian_contact, start_date)
       VALUES (?, ?, ?, ?, ?)`,
      [first_name.trim(), last_name.trim(), grade_level || null, guardian_contact.trim(), start_date]
    );
    res.status(201).json({ learner_id: result.insertId, first_name, last_name, grade_level, guardian_contact, start_date });
  } catch (err) {
    next(err);
  }
};

exports.updateLearner = async (req, res, next) => {
  try {
    const errors = validateLearnerInput(req.body, { partial: true });
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const { first_name, last_name, grade_level, guardian_contact, status } = req.body;
    const [result] = await pool.query(
      `UPDATE learners SET first_name = ?, last_name = ?, grade_level = ?, guardian_contact = ?, status = ?
       WHERE learner_id = ?`,
      [first_name?.trim(), last_name?.trim(), grade_level, guardian_contact?.trim(), status, req.params.id]
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