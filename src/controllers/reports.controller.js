const pool = require('../config/db');

exports.getBalances = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM learner_balances ORDER BY balance DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getRevenueByMonth = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT DATE_FORMAT(payment_date, '%Y-%m') AS month, SUM(amount) AS total
      FROM payments
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        l.learner_id,
        l.first_name,
        l.last_name,
        COUNT(s.session_id) AS total_sessions,
        SUM(CASE WHEN s.attended THEN 1 ELSE 0 END) AS attended_sessions,
        ROUND(
          SUM(CASE WHEN s.attended THEN 1 ELSE 0 END) / NULLIF(COUNT(s.session_id), 0) * 100, 1
        ) AS attendance_rate
      FROM learners l
      LEFT JOIN sessions s ON s.learner_id = l.learner_id
      GROUP BY l.learner_id, l.first_name, l.last_name
      ORDER BY l.last_name, l.first_name
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [[{ active_learners }]] = await pool.query(
      "SELECT COUNT(*) AS active_learners FROM learners WHERE status = 'active'"
    );
    const [[{ sessions_this_month }]] = await pool.query(`
      SELECT COUNT(*) AS sessions_this_month FROM sessions
      WHERE YEAR(session_date) = YEAR(CURDATE()) AND MONTH(session_date) = MONTH(CURDATE())
    `);
    const [[{ outstanding_balance }]] = await pool.query(
      'SELECT COALESCE(SUM(balance), 0) AS outstanding_balance FROM learner_balances WHERE balance > 0'
    );
    res.json({ active_learners, sessions_this_month, outstanding_balance });
  } catch (err) {
    next(err);
  }
};