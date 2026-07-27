import { useState } from 'react';

const NAME_REGEX = /^[A-Za-z'\-\s]+$/;
const PHONE_REGEX = /^(\+27|0)[6-8][0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 50;
const MIN_START_DATE = '2000-01-01';

function extractGradeNumber(gradeLevel) {
  if (!gradeLevel) return '';
  const match = String(gradeLevel).match(/\d+/);
  return match ? match[0] : '';
}

function normalizePhone(value) {
  return value.replace(/[\s\-]/g, '');
}

function validate(form) {
  const errors = {};
  const firstName = form.first_name.trim();
  const lastName = form.last_name.trim();
  const contact = form.guardian_contact.trim();

  if (!firstName) {
    errors.first_name = 'First name is required';
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors.first_name = `First name must be under ${MAX_NAME_LENGTH} characters`;
  } else if (!NAME_REGEX.test(firstName)) {
    errors.first_name = 'First name can only contain letters';
  }

  if (!lastName) {
    errors.last_name = 'Last name is required';
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors.last_name = `Last name must be under ${MAX_NAME_LENGTH} characters`;
  } else if (!NAME_REGEX.test(lastName)) {
    errors.last_name = 'Last name can only contain letters';
  }

  if (!form.grade_level_number) {
    errors.grade_level_number = 'Grade is required';
  } else {
    const num = Number(form.grade_level_number);
    if (!Number.isInteger(num) || num < 1 || num > 12) {
      errors.grade_level_number = 'Grade must be a number from 1 to 12';
    }
  }

  if (!form.start_date) {
    errors.start_date = 'Start date is required';
  } else {
    const today = new Date().toISOString().slice(0, 10);
    if (form.start_date > today) {
      errors.start_date = 'Start date cannot be in the future';
    } else if (form.start_date < MIN_START_DATE) {
      errors.start_date = `Start date must be after ${MIN_START_DATE}`;
    }
  }

  if (!contact) {
    errors.guardian_contact = 'Guardian contact is required';
  } else {
    const normalizedPhone = normalizePhone(contact);
    if (!PHONE_REGEX.test(normalizedPhone) && !EMAIL_REGEX.test(contact)) {
      errors.guardian_contact = 'Enter a valid SA phone number (e.g. 082 123 4567) or email address';
    }
  }

  return errors;
}

export default function LearnerForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    grade_level_number: extractGradeNumber(initialData?.grade_level),
    guardian_contact: initialData?.guardian_contact || '',
    start_date: initialData?.start_date || '',
    status: initialData?.status || 'active',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleGradeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 2);
    setForm({ ...form, grade_level_number: digitsOnly });
    if (errors.grade_level_number) {
      setErrors({ ...errors, grade_level_number: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const contact = form.guardian_contact.trim();
    const isEmail = EMAIL_REGEX.test(contact);

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      grade_level: `Grade ${form.grade_level_number}`,
      guardian_contact: isEmail ? contact : normalizePhone(contact),
      start_date: form.start_date,
      status: form.status,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full border-b-2 px-1 py-2 bg-transparent focus:outline-none transition ${
      errors[field]
        ? 'border-red-400 focus:border-red-500'
        : 'border-ink/15 focus:border-gold'
    }`;

  const labelClass = 'block text-xs uppercase tracking-wider font-semibold text-ink/60 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ink/10 p-8 rounded-sm shadow-sm space-y-5 max-w-md mx-auto">
      <div>
        <label className={labelClass}>First Name</label>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          maxLength={MAX_NAME_LENGTH}
          className={inputClass('first_name')}
        />
        {errors.first_name && <p className="text-red-600 text-xs mt-1.5">{errors.first_name}</p>}
      </div>

      <div>
        <label className={labelClass}>Last Name</label>
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          maxLength={MAX_NAME_LENGTH}
          className={inputClass('last_name')}
        />
        {errors.last_name && <p className="text-red-600 text-xs mt-1.5">{errors.last_name}</p>}
      </div>

      <div>
        <label className={labelClass}>Grade</label>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-slate/50 font-medium">Grade</span>
          <input
            name="grade_level_number"
            inputMode="numeric"
            value={form.grade_level_number}
            onChange={handleGradeChange}
            placeholder="11"
            className={`${inputClass('grade_level_number')} max-w-[60px] text-center`}
          />
        </div>
        {errors.grade_level_number && <p className="text-red-600 text-xs mt-1.5">{errors.grade_level_number}</p>}
      </div>

      <div>
        <label className={labelClass}>Guardian Contact</label>
        <input
          name="guardian_contact"
          value={form.guardian_contact}
          onChange={handleChange}
          placeholder="Phone (082 123 4567) or email"
          maxLength={100}
          className={inputClass('guardian_contact')}
        />
        {errors.guardian_contact && <p className="text-red-600 text-xs mt-1.5">{errors.guardian_contact}</p>}
      </div>

      <div>
        <label className={labelClass}>Start Date</label>
        <input
          type="date"
          name="start_date"
          min={MIN_START_DATE}
          max={new Date().toISOString().slice(0, 10)}
          value={form.start_date?.slice(0, 10) || ''}
          onChange={handleChange}
          className={inputClass('start_date')}
        />
        {errors.start_date && <p className="text-red-600 text-xs mt-1.5">{errors.start_date}</p>}
      </div>

      {initialData && (
        <div>
          <label className={labelClass}>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border-b-2 border-ink/15 px-1 py-2 bg-transparent focus:outline-none focus:border-gold transition"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-white px-5 py-2.5 rounded-sm hover:bg-gold transition font-medium text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : initialData ? 'Update Learner' : 'Add Learner'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="text-slate/60 px-5 py-2.5 hover:text-ink transition font-medium text-sm disabled:opacity-40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}