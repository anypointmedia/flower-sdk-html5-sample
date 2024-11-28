import { useEffect, useRef, useState } from 'react';
import { videoList } from './video';
import './Playback.css';

function Playback({ video, onClose }) {
  // Your Bitmovin API key
  const BITMOVIN_API_KEY = '';
  const nextVideo = videoList.filter((v) => v !== video)[0];

  const [ urlInput, setUrlInput ] = useState('https://xxx');
  const [ durationInput, setDurationInput ] = useState('0');

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const adContainerRef = useRef(null);
  const flowerAdViewRef = useRef(null);
  const adsManagerListenerRef = useRef(null);
  const isContentLoadRef = useRef(false);
  const isContentEndRef = useRef(false);

  useEffect(() => {
    if (!adContainerRef.current) return;

    flowerAdViewRef.current = new window.FlowerAdView(adContainerRef.current);

    if (video) {
      playVod();
    }

    return () => {
      releasePlayer();
    };
  }, [ video, adContainerRef ]);

  const playVod = () => {
    const videoUrl = video?.url ?? urlInput;
    const videoDuration = video?.duration ?? durationInput;

    // Creating the Bitmovin player instance
    playerRef.current = new window.bitmovin.player.Player(
      playerContainerRef.current,
      {
        key: BITMOVIN_API_KEY,
      },
    );

    isContentLoadRef.current = false;
    playerRef.current.on(window.bitmovin.player.PlayerEvent.Ready, () => isContentLoadRef.current = true);
    playerRef.current.on(window.bitmovin.player.PlayerEvent.PlaybackFinished, () => {
      isContentEndRef.current = true;
      // TODO GUIDE: notify end of vod content
      flowerAdViewRef.current.adsManager.notifyContentEnded();
    });

    // TODO GUIDE: implement & add FlowerAdsManagerListener
    adsManagerListenerRef.current = {
      onPrepare(adDurationMs) {
        if (playerRef.current.isPlaying()) {
          // OPTIONAL GUIDE: additional actions before ad playback

          // TODO GUIDE: play midroll ad
          flowerAdViewRef.current.adsManager.play();
        } else {
          // TODO GUIDE: play preroll ad
          flowerAdViewRef.current.adsManager.play();
        }
      },
      onPlay() {
        // TODO GUIDE: pause VOD content
        playerRef.current.pause();
      },
      onCompleted() {
        // TODO GUIDE: resume VOD content after ad complete
        if (isContentEndRef.current) {
          return;
        }

        if (isContentLoadRef.current) {
          playerRef.current.play();
        } else {
          playerRef.current.on(window.bitmovin.player.PlayerEvent.Ready, () => playerRef.current.play());
        }
      },
      onError(error) {
        console.error('Error from Flower SDK: ', error);
        // TODO GUIDE: resume VOD content on ad error
        if (isContentEndRef.current) {
          return;
        }

        playerRef.current.play();
      },
      onAdSkipped(reason) {
        console.log('onAdSkipped: ', reason);
      },
    };

    flowerAdViewRef.current.adsManager.addListener(adsManagerListenerRef.current);

    // TODO GUIDE: implement MediaPlayerHook
    const mediaPlayerHook = {
      getPlayer() {
        return playerRef.current;
      },
    };

    // TODO GUIDE: request vod ad
    // arg0: adTagUrl, url from flower system.
    //       You must file a request to Anypoint Media to receive a adTagUrl.
    // arg1: contentId, unique content id in your service
    // arg2: durationMs, duration of vod content in milliseconds
    // arg3: extraParams, values you can provide for targeting
    // arg4: mediaPlayerHook, interface that provides currently playing segment information for ad tracking
    // arg5: adTagHeaders, (Optional) values included in headers for ad request
    flowerAdViewRef.current.adsManager.requestVodAd(
      'https://ad_request',
      '-255',
      videoDuration,
      new Map(),
      mediaPlayerHook,
      new Map(),
    );

    // Loading the stream with the Bitmovin player
    playerRef.current.load({ hls: videoUrl });
  };

  const releasePlayer = () => {
    flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
    flowerAdViewRef.current.adsManager.stop();
    return playerRef.current?.destroy();
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={() => onClose(null)}>Back</button>
      {!video && (
        <div>
          <input type="text" placeholder="Enter video URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
          <input type="number" placeholder="Enter video duration in milliseconds" value={durationInput} onChange={(e) => setDurationInput(e.target.value)} />
          <button onClick={playVod}>Play</button>
        </div>
      )}
      <div ref={playerContainerRef} className={'player-container'} style={{position: 'relative', width: '1024px', height: '720px'}}>
        <div ref={adContainerRef} className={'ad-container'}></div>
      </div>
      <button onClick={() => onClose(nextVideo)}>Switch to {nextVideo.title}</button>
    </div>
  );
}

export default Playback;
