import { useState } from 'react';

export default function LearnerForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    grade_level: '',
    guardian_contact: '',
    start_date: '',
    status: 'active',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
        <input
          name="grade_level"
          value={form.grade_level}
          onChange={handleChange}
          placeholder="e.g. Grade 11"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact</label>
        <input
          name="guardian_contact"
          value={form.guardian_contact}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          type="date"
          name="start_date"
          value={form.start_date?.slice(0, 10) || ''}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          {initialData ? 'Update' : 'Add Learner'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}