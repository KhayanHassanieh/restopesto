'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // null | 'ok' | 'error'

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      mobile:form.mobile.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      hp: form.hp.value, // honeypot
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('ok');
      form.reset();
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* honeypot field (hidden) */}
      <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input id="name" name="name" type="text" required
            className="w-full px-4 py-3 rounded-lg border border-white/60 bg-white/70 focus:ring-2 focus:ring-[#ffd200] outline-none" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="email" name="email" type="email" required
            className="w-full px-4 py-3 rounded-lg border border-white/60 bg-white/70 focus:ring-2 focus:ring-[#ffd200] outline-none" />
        </div>
      </div>
<div>
  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
    Mobile Number
  </label>
  <input
    id="mobile"
    type="tel"
    name="mobile"
    className="w-full px-4 py-3 rounded-lg border border-white/60 bg-white/70 focus:ring-2 focus:ring-[#ffd200] outline-none"
  />
</div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input id="subject" name="subject" type="text" required
          className="w-full px-4 py-3 rounded-lg border border-white/60 bg-white/70 focus:ring-2 focus:ring-[#ffd200] outline-none" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea id="message" name="message" rows={4} required
          className="w-full px-4 py-3 rounded-lg border border-white/60 bg-white/70 focus:ring-2 focus:ring-[#ffd200] outline-none" />
      </div>

      <button type="submit" disabled={sending}
        className="w-full bg-[#ffd200] hover:bg-[#e6bd00] disabled:opacity-60 disabled:cursor-not-allowed text-[#333] font-bold py-3 px-4 rounded-lg transition">
        {sending ? 'Sending…' : 'Send Message'}
      </button>

      {status === 'ok' && (
        <p className="text-green-700 bg-green-100/70 border border-green-200 rounded-lg p-3">
          Thanks! Your message was sent.
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-700 bg-red-100/70 border border-red-200 rounded-lg p-3">
          Sorry—something went wrong. Please try again or email us directly.
        </p>
      )}
    </form>
  );
}
