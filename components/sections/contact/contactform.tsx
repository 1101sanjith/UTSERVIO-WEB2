import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

export default function ContactForm() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 72; // 72px approximates 3 rows
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Replace these with your actual EmailJS service details
      const result = await emailjs.sendForm(
        'service_5z2f63n', // EmailJS service ID
        'template_pjwfmik', // EmailJS template ID
        formRef.current, // Form reference
        'dC44HYPa6TmCOHz5H', // EmailJS public key
      );

      setSubmitStatus({
        success: true,
        message: 'Message sent successfully!',
      });
      formRef.current.reset();
    } catch (error) {
      console.error('Failed to send message:', error);
      setSubmitStatus({
        success: false,
        message: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm sm:text-lg">
            First name <span className="text-red-600">*</span>
          </label>
          <input
            name="first_name"
            type="text"
            required
            className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 bg-transparent text-sm sm:text-base"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm sm:text-lg">
            Last name <span className="text-red-600">*</span>
          </label>
          <input
            name="last_name"
            type="text"
            required
            className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 bg-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm sm:text-lg">
          Email <span className="text-red-600">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 bg-transparent text-sm sm:text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs sm:text-lg">Write a message</label>
        <textarea
          ref={textareaRef}
          name="message"
          rows={1}
          onInput={handleInput}
          style={{ maxHeight: '72px' }}
          className="w-full border-b-2 border-black focus:outline-none focus:border-blue-600 pb-1 bg-transparent resize-none overflow-y-auto text-xs sm:text-base"
        />
      </div>

      {submitStatus && (
        <div
          className={`p-3 rounded-lg ${
            submitStatus.success
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {submitStatus.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full ${
          isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
        } text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base`}
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
