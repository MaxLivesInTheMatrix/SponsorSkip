// contentScript.js

// Function to get the transcript text (from YouTube CC or transcript feature)
async function getTranscript() {
    const transcriptButton = document.querySelector('ytd-menu-renderer yt-formatted-string:contains("Transcript")');
    if (!transcriptButton) {
        console.log("Transcript not available for this video.");
        return null;
    }
    
    // Click on the transcript button to display the transcript panel
    transcriptButton.click();
    
    // Wait for transcript panel to load (add delay or better selector management)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Grab transcript lines from the DOM (adjust selector based on YouTube’s structure)
    const transcriptLines = document.querySelectorAll('yt-transcript-segment-renderer');

    if (!transcriptLines.length) {
        console.log("No transcript found.");
        return null;
    }

    // Build transcript text
    let transcriptText = "";
    transcriptLines.forEach(line => {
        const time = line.querySelector('div.cue-group-start-offset').innerText;
        const text = line.querySelector('div.cue').innerText;
        transcriptText += `[${time}] ${text}\n`;
    });

    return transcriptText;
}

// Listen for page load or video element presence
window.addEventListener('load', async () => {
    const transcript = await getTranscript();
    
    if (transcript) {
        console.log("Transcript:", transcript);

        // (Optional) Send the transcript to the background script for analysis
        chrome.runtime.sendMessage({ type: 'TRANSCRIPT', data: transcript });

        // Or, you can analyze the transcript locally for sponsor phrases
        // Analyze for sponsor keywords (e.g., "thanks to our sponsor", "sponsored by")
        if (transcript.includes("thanks to our sponsor") || transcript.includes("sponsored by")) {
            console.log("Sponsor detected!");
            // Logic to skip the sponsor section using the YouTube player API
        }
    }
});
