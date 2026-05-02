import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';

import RecipientInput from '../components/RecipientInput';
import FileDropzone from '../components/FileDropzone';
import EmailPreviewModal from '../components/EmailPreviewModal';
import StatusBadge from '../components/StatusBadge';

import { sendEmail, previewEmail } from '../services/emailApi';
import { useLocalDraft } from '../hooks/useLocalDraft';

const defaultValues = {
  senderName: '',
  senderEmail: '',
  senderImage: '',
  recipients: [],
  cc: [],
  bcc: [],
  subject: '',
  emailContent: '',
};

export default function ComposePage() {
  const [files, setFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues });

  const { clearDraft } = useLocalDraft(watch, reset);

  async function onSubmit(data) {
    if (data.recipients.length === 0) {
      toast.error('Add at least one recipient');
      return;
    }

    setIsSending(true);

    try {
      const fd = new FormData();
      fd.append('senderName', data.senderName);
      fd.append('senderEmail', data.senderEmail);
      if (data.senderImage) fd.append('senderImage', data.senderImage);
      fd.append('subject', data.subject);
      fd.append('emailContent', data.emailContent);
      fd.append('recipients', JSON.stringify(data.recipients));
      if (data.cc?.length) fd.append('cc', JSON.stringify(data.cc));
      if (data.bcc?.length) fd.append('bcc', JSON.stringify(data.bcc));
      files.forEach((file) => fd.append('attachments', file));

      const result = await sendEmail(fd);
      setLastResult(result.data);
      clearDraft();
      setFiles([]);
      reset(defaultValues);

      toast.success(`Email sent to ${result.data.accepted?.length || data.recipients.length} recipient(s)!`, {
        duration: 5000,
        icon: '✉️',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send email. Check your SMTP config.';
      toast.error(msg, { duration: 6000 });

      // Show field errors from backend
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors?.length) {
        fieldErrors.forEach((e) => toast.error(`${e.field}: ${e.message}`, { duration: 5000 }));
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handlePreview() {
    const data = getValues();
    if (!data.senderName || !data.subject || !data.emailContent) {
      toast.error('Fill in sender name, subject, and content to preview');
      return;
    }

    setIsLoadingPreview(true);
    setPreviewHtml(null);

    try {
      const res = await previewEmail({
        senderName: data.senderName,
        senderEmail: data.senderEmail || 'preview@example.com',
        senderImage: data.senderImage,
        subject: data.subject,
        emailContent: data.emailContent,
      });
      setPreviewHtml(res.html);
    } catch (err) {
      toast.error('Could not generate preview');
      setIsLoadingPreview(false);
      return;
    }

    setIsLoadingPreview(false);
  }

  function handleClearDraft() {
    reset(defaultValues);
    setFiles([]);
    clearDraft();
    toast.success('Draft cleared');
  }

  return (
    <div className="noise-bg min-h-screen">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-accent-red/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent-gold/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="flex items-start justify-between mb-10 animate-slide-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✉️</span>
              <h1 className="font-display text-3xl font-bold text-ink-50 tracking-tight">
                MailForge
              </h1>
            </div>
            <p className="text-ink-400 text-sm">
              Professional email composer &amp; sender
            </p>
          </div>
          <StatusBadge />
        </header>

        {/* Success banner */}
        {lastResult && (
          <div className="mb-6 animate-slide-up bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-emerald-300 font-semibold text-sm">Email delivered successfully</p>
                <p className="text-emerald-500 text-xs">Message ID: {lastResult.messageId}</p>
              </div>
              <button
                onClick={() => setLastResult(null)}
                className="ml-auto text-emerald-600 hover:text-emerald-300 transition-colors"
              >
                ×
              </button>
            </div>
            {lastResult.accepted?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {lastResult.accepted.map((email) => (
                  <span key={email} className="text-xs bg-emerald-500/20 text-emerald-300 rounded-full px-2.5 py-0.5">
                    {email}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-0 overflow-hidden animate-slide-up">

          {/* Card Header */}
          <div className="px-7 pt-7 pb-5 border-b border-ink-800">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-ink-100 text-lg">Compose Email</h2>
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-ink-500 hover:text-ink-300 text-xs font-medium transition-colors flex items-center gap-1"
              >
                🗑 Clear draft
              </button>
            </div>
          </div>

          <div className="p-7 space-y-7">

            {/* Sender Section */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-gradient-to-b from-accent-red to-accent-gold rounded-full" />
                <span className="text-ink-300 text-xs font-semibold uppercase tracking-widest">Sender</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Sender Name *</label>
                  <input
                    {...register('senderName', {
                      required: 'Sender name is required',
                      maxLength: { value: 100, message: 'Max 100 characters' },
                    })}
                    className="input-field"
                    placeholder="John Smith"
                    disabled={isSending}
                  />
                  {errors.senderName && (
                    <p className="field-error">⚠ {errors.senderName.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Sender Email *</label>
                  <input
                    {...register('senderEmail', {
                      required: 'Sender email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                    })}
                    type="email"
                    className="input-field"
                    placeholder="john@company.com"
                    disabled={isSending}
                  />
                  {errors.senderEmail && (
                    <p className="field-error">⚠ {errors.senderEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <label className="label">Profile / Logo Image URL <span className="text-ink-600 normal-case tracking-normal font-normal">(optional)</span></label>
                <input
                  {...register('senderImage', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Must be a valid HTTP/HTTPS URL',
                    },
                  })}
                  type="url"
                  className="input-field"
                  placeholder="https://example.com/avatar.png"
                  disabled={isSending}
                />
                {errors.senderImage && (
                  <p className="field-error">⚠ {errors.senderImage.message}</p>
                )}
              </div>
            </section>

            <div className="h-px bg-ink-800" />

            {/* Recipients Section */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full" />
                  <span className="text-ink-300 text-xs font-semibold uppercase tracking-widest">Recipients</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCcBcc(!showCcBcc)}
                  className="text-ink-500 hover:text-accent-red text-xs font-medium transition-colors"
                >
                  {showCcBcc ? '− Hide CC/BCC' : '+ CC / BCC'}
                </button>
              </div>

              <Controller
                name="recipients"
                control={control}
                rules={{
                  validate: (v) => (v && v.length > 0) || 'At least one recipient is required',
                }}
                render={({ field }) => (
                  <RecipientInput
                    label="To *"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.recipients?.message}
                    disabled={isSending}
                    placeholder="recipient@example.com"
                  />
                )}
              />

              {showCcBcc && (
                <div className="mt-5 space-y-5 animate-slide-up">
                  <Controller
                    name="cc"
                    control={control}
                    render={({ field }) => (
                      <RecipientInput
                        label="CC"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSending}
                        placeholder="cc@example.com"
                      />
                    )}
                  />
                  <Controller
                    name="bcc"
                    control={control}
                    render={({ field }) => (
                      <RecipientInput
                        label="BCC"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSending}
                        placeholder="bcc@example.com"
                      />
                    )}
                  />
                </div>
              )}
            </section>

            <div className="h-px bg-ink-800" />

            {/* Content Section */}
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-4 bg-gradient-to-b from-accent-gold to-orange-500 rounded-full" />
                <span className="text-ink-300 text-xs font-semibold uppercase tracking-widest">Message</span>
              </div>

              <div className="mb-5">
                <label className="label">Subject *</label>
                <input
                  {...register('subject', {
                    required: 'Subject is required',
                    maxLength: { value: 255, message: 'Max 255 characters' },
                  })}
                  className="input-field"
                  placeholder="Your email subject here"
                  disabled={isSending}
                />
                {errors.subject && (
                  <p className="field-error">⚠ {errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="label">Content *</label>
                <textarea
                  {...register('emailContent', {
                    required: 'Email content is required',
                    maxLength: { value: 50000, message: 'Content too long' },
                  })}
                  className="input-field resize-y"
                  rows={8}
                  placeholder="Write your email message here. HTML tags are supported for formatting."
                  disabled={isSending}
                />
                {errors.emailContent && (
                  <p className="field-error">⚠ {errors.emailContent.message}</p>
                )}
                <p className="text-ink-600 text-xs mt-1.5">
                  You can use basic HTML: &lt;b&gt;, &lt;i&gt;, &lt;a href="..."&gt;, &lt;br&gt;, &lt;p&gt;, etc.
                </p>
              </div>
            </section>

            <div className="h-px bg-ink-800" />

            {/* Attachments */}
            <section>
              <FileDropzone files={files} onChange={setFiles} disabled={isSending} />
            </section>

          </div>

          {/* Action Bar */}
          <div className="px-7 py-5 bg-ink-950/50 border-t border-ink-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePreview}
              disabled={isSending || isLoadingPreview}
              className="btn-secondary flex items-center gap-2"
            >
              {isLoadingPreview ? (
                <span className="w-4 h-4 border-2 border-ink-400 border-t-transparent rounded-full animate-spin" />
              ) : '👁️'}
              Preview
            </button>

            <button
              type="submit"
              disabled={isSending}
              className="btn-primary flex items-center gap-2.5 min-w-[140px] justify-center"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <span>✈️</span>
                  Send Email
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer */}
        <footer className="mt-8 text-center text-ink-700 text-xs">
          MailForge v1.0 · Powered by Nodemailer + React
        </footer>

      </div>

      {/* Preview Modal */}
      {previewHtml !== null && (
        <EmailPreviewModal
          html={previewHtml}
          onClose={() => setPreviewHtml(null)}
        />
      )}
    </div>
  );
}
