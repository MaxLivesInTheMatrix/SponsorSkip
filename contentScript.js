let timeRanges = [];

chrome.storage.sync.get('times', (data) => {
    if (data.times) {
        //console.log("Global state retrieved from sync storage:", data.times);
        timeRanges = data.times.map(time => ({
            startTime: time[0],
            endTime: time[1]
        }));
        waitForYouTubeVideo().then((video) => {
            //console.log("YouTube video element detected. Adding timeupdate listener.");
            autoSkipVideo(video, timeRanges);
        });
    } else {
        //console.log("Times data is not available yet.");
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.times?.newValue) {
        //console.log("Times updated in storage:", changes.times.newValue);
        timeRanges = changes.times.newValue.map(time => ({
            startTime: time[0],
            endTime: time[1]
        }));
        
        waitForYouTubeVideo().then((video) => {
            //console.log("YouTube video element detected. Adding timeupdate listener.");
            autoSkipVideo(video, timeRanges);
        });
    }
});

function waitForYouTubeVideo() {
    return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
        const video = document.querySelector('video');
        if (video && video.src.includes('blob')) {
            //console.log("YouTube video element found!");
            observer.disconnect();
            resolve(video);
        }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    });
}

function autoSkipVideo(video, ranges) {
    //console.log("Adding timeupdate event listener to YouTube video...");

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
    //console.log("YouTube video element detected. Adding timeupdate listener.");
    autoSkipVideo(video, timeRanges);
});
