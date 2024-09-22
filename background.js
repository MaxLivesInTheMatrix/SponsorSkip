import { YoutubeTranscript } from './youtube-transcript.esm.min.js';

let transcriptList = "";
let timeArrays = [];

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

async function fetchTranscript(videoId) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    transcript.forEach((_, i) => {
        let parsedScript = `${parseInt(transcript[i].offset)} ${transcript[i].text}`;
        transcriptList += parsedScript + "\n";
    });
    //console.log(transcriptList);
    sendTranscriptToAPI(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
  }
}

async function sendTranscriptToAPI(transcriptList, retryCount = 0) {
    try {
        console.log("Sending transcript to API...");
        const response = await fetch("http://127.0.0.1:5000", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript: transcriptList }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const rawResponse = await response.json();
        console.log("Raw response:", rawResponse);

        if (rawResponse.times && rawResponse.times.length > 0 && rawResponse.sentiment && rawResponse.sentiment.length > 0) {
            timeArrays = rawResponse.times;
            console.log("Time Arrays from API:", timeArrays);
            sentimentArray = rawResponse.sentiment
            print(sentimentArray)
            chrome.storage.sync.set({ times: timeArrays, sentiment: sentimentArray}, () => {
                console.log('Times and Sentiment saved to storage.');
            });
        } else {
            if (retryCount < 3) {
                console.warn(`Empty time array. Retrying... (${retryCount + 1}/3)`);
                await sendTranscriptToAPI(transcriptList, retryCount + 1);
            } else {
                console.error('Failed to get valid time arrays after 3 attempts.');
            }
        }

        console.log('Transcript successfully sent to API:', rawResponse);
    } catch (error) {
        console.error('Error sending transcript to API:', error);
    }
}
