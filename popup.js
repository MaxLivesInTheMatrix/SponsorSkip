document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggle-transcript');
  const statusText = document.getElementById('status-text');
  const sentimentList = document.getElementById('sentiment-list'); // Add sentiment list element

  // Retrieve the current state of the toggle and update status text
  chrome.storage.sync.get(['transcriptEnabled', 'sentiment'], function(data) {
    toggle.checked = data.transcriptEnabled || false;
    updateStatusText(data.transcriptEnabled);
    
    // Display sentiment analysis if available
    if (data.sentiment && data.sentiment.length > 0) {
      displaySentiment(data.sentiment);
    } else {
      sentimentList.textContent = "No sentiment data available.";
    }
  });

  // Handle toggle state changes
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    chrome.storage.sync.set({ transcriptEnabled: isEnabled }, function() {
      updateStatusText(isEnabled);

      if (isEnabled) {
        console.log('Fetching transcript...');
      } else {
        console.log('Transcript fetching disabled.');
      }
    });
  });

  // Update status text based on the toggle state
  function updateStatusText(isEnabled) {
    if (isEnabled) {
      statusText.textContent = "Transcript fetching is ON.";
    } else {
      statusText.textContent = "Transcript fetching is OFF.";
    }
  }

  // Function to display sentiment analysis data
  function displaySentiment(sentimentArray) {
    sentimentList.innerHTML = ''; // Clear the list first
    sentimentArray.forEach((sentiment, index) => {
      const listItem = document.createElement('li');
      listItem.textContent = `Sentiment ${index + 1}: ${sentiment}`;
      sentimentList.appendChild(listItem);
    });
  }
});