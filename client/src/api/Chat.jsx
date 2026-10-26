import { api } from './auth';

// إرسال المحادثة للمساعد وجلب الرد
// messages: [{ role: 'user' | 'assistant', content: '...' }, ...]
export const sendChatMessage = async (messages) => {
  try {
    // longer timeout than the default 10s, since the AI can take a while to answer
    const response = await api.post('/chat', { messages }, { timeout: 40000 });
    return response.data;
  } catch (error) {
    console.error('Error in sendChatMessage:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'فشل في الاتصال بالمساعد' };
  }
};