const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/learners', require('./routes/learners.routes'));
app.use('/api/subjects', require('./routes/subjects.routes'));
app.use('/api/sessions', require('./routes/sessions.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/invoices', require('./routes/invoices.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/reports', require('./routes/reports.routes'));

app.use(require('./middleware/errorHandler'));

module.exports = app;