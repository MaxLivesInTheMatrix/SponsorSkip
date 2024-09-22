document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('toggle-transcript');
    const statusText = document.getElementById('status-text');
  
    chrome.storage.sync.get('transcriptEnabled', function(data) {
      toggle.checked = data.transcriptEnabled || false;
      updateStatusText(data.transcriptEnabled);
    });
  
    toggle.addEventListener('change', function() {
      const isEnabled = toggle.checked;
      chrome.storage.sync.set({ transcriptEnabled: isEnabled }, function() {
        updateStatusText(isEnabled);
  
        if (isEnabled) {
          console.log('Fetching transcript..');
        } else {
          console.log('Transcript fetching disabled.');
        }
      });
    });
  
    function updateStatusText(isEnabled) {
      if (isEnabled) {
        statusText.textContent = "Transcript fetching is ON.";
      } else {
        statusText.textContent = "Transcript fetching is OFF.";
      }
    }
  });
  