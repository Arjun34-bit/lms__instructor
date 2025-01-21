const ChatBotAPI = {
  GetChatbotResponse: (message) => {
    return new Promise((resolve, reject) => {
      fetch('https://backend.chat.duoples.com/chatbot/interact/pcc/', {
        method: 'POST',
        headers: {
          'Authorization': 'api-key DxKZ05dK.2ZeespFMSvBgRkZDGJSqu3ATQwNCelzT',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message }),
      })
        .then((response) => {
          if (!response.ok) {
            reject(`Error: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data?.answer)
          const formattedAnswer = data?.answer;

          resolve(
            // data?.answer?.replace(/\n/g, " ").replace(/\*/g, "")
            formattedAnswer
            || "Sorry, I couldn't understand that."
          );
        })
        .catch((error) => {
          console.error('API error:', error);
          reject('Sorry, there was an error processing your request.');
        });
    });
  },
};

export default ChatBotAPI;
