document.addEventListener('DOMContentLoaded', function () {
  console.log('Popup loaded');
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.error('Error getting auth token:', chrome.runtime.lastError);
      return;
    }

    console.log('Auth token:', token);

    chrome.storage.local.get('messages', function (result) {
      console.log('Stored messages:', result);
      const messages = result.messages;
      if (messages) {
        messages.forEach(message => {
          const messageElement = document.createElement('div');
          messageElement.classList.add('message');
          messageElement.innerHTML = `<strong>From:</strong> ${message.payload.headers.find(header => header.name === 'From').value}<br>
                                      <strong>Subject:</strong> ${message.payload.headers.find(header => header.name === 'Subject').value}<br>
                                      <strong>Date:</strong> ${new Date(parseInt(message.internalDate)).toLocaleString()}<br>
                                      <strong>Snippet:</strong> ${message.snippet}<br>
                                      <strong>Content:</strong> ${atob(message.payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/'))}<br>`;
          document.getElementById('messages').appendChild(messageElement);
        });
      } else {
        const noMessagesElement = document.createElement('div');
        noMessagesElement.classList.add('message');
        noMessagesElement.innerText = 'No messages found';
        document.getElementById('messages').appendChild(noMessagesElement);
      }
    });
  });
});
