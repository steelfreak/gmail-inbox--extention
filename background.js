chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.action.onClicked.addListener(() => {
  console.log('Extension icon clicked');
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    if (chrome.runtime.lastError) {
      console.error('Error getting auth token:', chrome.runtime.lastError);
      return;
    }

    console.log('Auth token:', token);

    fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log('Messages data:', data);
      if (data.messages) {
        const messagePromises = data.messages.map(message =>
          fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`, {
            headers: {
              'Authorization': 'Bearer ' + token
            }
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
          })
        );

        Promise.all(messagePromises)
          .then(messages => {
            chrome.storage.local.set({ messages: messages }, function () {
              console.log('Messages stored');
            });
          })
          .catch(error => console.error('Fetch message error:', error));
      }
    })
    .catch(error => console.error('Fetch error:', error));
  });
});
