'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const VENUES = ['Gym', 'Auditorium', 'Room 101', 'Field'];

export default function NewProposalPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    objectives: '',
    description: '',
    schedule_start: '',
    schedule_end: '',
    target_audience: '',
    venue: VENUES[0],
    materials: '',
    budget_amount: '',
    funding_source: '',
    submitter_name: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        budget_amount: Number(form.budget_amount) || 0,
        schedule_start: new Date(form.schedule_start).toISOString(),
        schedule_end: new Date(form.schedule_end).toISOString(),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!data.success) {
      setError(data.error);
      return;
    }

    router.push('/');
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Submit Activity Proposal</h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Objectives</label>
          <textarea
            name="objectives"
            value={form.objectives}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Start</label>
            <input
              type="datetime-local"
              name="schedule_start"
              value={form.schedule_start}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">End</label>
            <input
              type="datetime-local"
              name="schedule_end"
              value={form.schedule_end}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Target Audience</label>
          <input
            name="target_audience"
            value={form.target_audience}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Venue</label>
          <select
            name="venue"
            value={form.venue}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            {VENUES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Materials / Equipment</label>
          <textarea
            name="materials"
            value={form.materials}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Budget Amount</label>
            <input
              type="number"
              name="budget_amount"
              value={form.budget_amount}
              onChange={handleChange}
              className="w-full border rounded p-2"
              min="0"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Funding Source</label>
            <input
              name="funding_source"
              value={form.funding_source}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Submitter Name</label>
          <input
            name="submitter_name"
            value={form.submitter_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </form>
    </main>
  );
}