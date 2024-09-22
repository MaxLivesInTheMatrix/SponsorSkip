let timeRanges = [
    { startTime: 10, endTime: 15 },
    { startTime: 30, endTime: 35 },
    { startTime: 43, endTime: 90 }
];

chrome.storage.sync.get('transcriptEnabled', (data) => {
    console.log("Global state retrieved from sync storage:", data.transcriptEnabled);
  });

function waitForYouTubeVideo() {
    return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
        const video = document.querySelector('video');
        if (video && video.src.includes('blob')) {
            console.log("YouTube video element found!");
            observer.disconnect();
            resolve(video);
        }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    });
}

function autoSkipVideo(video, ranges) {
    console.log("Adding timeupdate event listener to YouTube video...");

    video.addEventListener('timeupdate', () => {
    console.log(`Current video time: ${video.currentTime}`);

    ranges.forEach(({ startTime, endTime }) => {
        if (video.currentTime >= startTime && video.currentTime < endTime) {
        console.log(`Skipping from ${startTime} to ${endTime}`);
        video.currentTime = endTime;
        }
    });
    });
}

waitForYouTubeVideo().then((video) => {
    console.log("YouTube video element detected. Adding timeupdate listener.");
    autoSkipVideo(video, timeRanges);
});
