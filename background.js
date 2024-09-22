import { YoutubeTranscript } from './youtube-transcript.esm.min.js';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {  
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.sync.get('transcriptEnabled', (data) => {
      //console.log("Transcript fetching enabled:", data.transcriptEnabled);
      
      if (data.transcriptEnabled) {
        const url = new URL(tab.url);
        if (url.hostname === 'www.youtube.com' && url.searchParams.get('v')) {
          const videoId = url.searchParams.get('v');
          fetchTranscript(videoId);
        } else {
          console.error("Not a YouTube video URL.");
        }
      } else {
        //console.log("Transcript fetching is disabled.");
      }
    });
  }
});

chrome.storage.sync.set({ transcriptEnabled: false }, () => {});

async function fetchTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log('Transcript fetched:', transcript);
    sendTranscriptToAPI(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
  }
}

async function sendTranscriptToAPI(transcript) {
  try {
    console.log("Sending transcript to API...");
    const response = await fetch("https://your-api-endpoint.com/transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transcript })
    });
    
    const result = await response.json();
    console.log('Transcript successfully sent to API:', result);
  } catch (error) {
    console.error('Error sending transcript to API:', error);
  }
}
