import React, { useContext, useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../api/chat';
import { AuthContext } from '../context/auth-context';

// Floating chat widget. Render it once in App.jsx; it only shows when a
// user is logged in. Sends the conversation to POST /api/chat.
const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعد نظام المزرعة. اسألني عن النظام أو عن بيانات المزرعة.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const res = await sendChatMessage(next);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setError(err.message || 'تعذر الحصول على رد');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // hidden on the sign-in / sign-up pages

  return (
    <div className="fixed bottom-4 left-4 z-50" dir="rtl">
      {open && (
        <div className="mb-3 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-blue-600 text-white rounded-t-lg">
            <span className="text-sm font-semibold">مساعد المزرعة</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-lg leading-none"
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white mr-0 ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 text-gray-500 text-sm px-3 py-2 rounded-lg w-fit">
                ...جاري الكتابة
              </div>
            )}
            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="flex gap-2 p-2 border-t border-gray-200">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="اكتب سؤالك..."
              className="flex-1 border border-gray-300 rounded-md px-2 py-1.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white
                         text-sm font-medium rounded-md px-3 transition-colors"
            >
              إرسال
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xl
                   shadow-lg flex items-center justify-center transition-colors"
        aria-label="فتح المساعد"
      >
        💬
      </button>
    </div>
  );
};

export default Chatbot;