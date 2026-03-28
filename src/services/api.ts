  sendMessage: async (chatId: string, receiverId: string | undefined, content: string, type: 'text' | 'audio' | 'image' = 'text') => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token');
    const response = await fetch(`${SERVER_URL}/api/v1/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ chatId, receiverId, content, type }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },
