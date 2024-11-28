import { useEffect, useRef, useState } from 'react';

function InterstitialAd({ onClose }) {
  const adContainerRef = useRef(null);
  const flowerAdViewRef = useRef(null);
  const adsManagerListenerRef = useRef(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    flowerAdViewRef.current = new window.FlowerAdView(adContainerRef.current);

    requestAd();

    return () => {
      flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
      flowerAdViewRef.current.adsManager.stop();
    };
  }, [ adContainerRef ]);

  const requestAd = () => {
    // TODO GUIDE: implement & add FlowerAdsManagerListener
    adsManagerListenerRef.current = {
      onPrepare(adDurationMs) {
        // TODO GUIDE: play ad
        flowerAdViewRef.current.adsManager.play();
      },
      onPlay() {
        // TODO GUIDE: need nothing for interstitial ad
      },
      onCompleted() {
        // TODO GUIDE: stop FlowerAdsManager
        flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
        flowerAdViewRef.current.adsManager.stop();
      },
      onError(error) {
        console.error('Error from Flower SDK: ', error);

        // TODO GUIDE: stop FlowerAdsManager
        flowerAdViewRef.current.adsManager.removeListener(adsManagerListenerRef.current);
        flowerAdViewRef.current.adsManager.stop();
      },
      onAdSkipped(reason) {
        console.log('onAdSkipped: ', reason);
      },
    };

    flowerAdViewRef.current.adsManager.addListener(adsManagerListenerRef.current);

    // TODO GUIDE: request ad
    // arg0: adTagUrl, url from flower system
    //       You must file a request to Anypoint Media to receive a adTagUrl.
    // arg1: extraParams, values you can provide for targeting
    // arg2: adTagHeaders, (Optional) values included in headers for ad request
    flowerAdViewRef.current.adsManager.requestAd(
      'https://ad_request',
      new Map(),
      new Map(),
    );
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={onClose}>Back</button>
      <div style={{ position: 'relative', display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <div ref={adContainerRef} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'none', zIndex: 9999 }}></div>
        <div>Original Content</div>
      </div>
    </div>
  );
}

export default InterstitialAd;
