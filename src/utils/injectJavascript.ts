/* eslint-disable */
import type { GeoPosition } from 'react-native-geolocation-service';

export const injectJavascript = (appId: string, publicKey: string, type: string, config: any, userData: any, metadata: any, location?: GeoPosition) => {
    return `
    const options = {
      app_id: "${appId}",
      p_key: "${publicKey}",
      type: "${type}",
      config: ${config ? JSON.stringify(config) : null},
      user_data: ${userData ? JSON.stringify(userData) : null},
      metadata: ${metadata ? JSON.stringify(metadata) : null},
      __location: ${location ? JSON.stringify(location) : null},
      onSuccess: function (response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'success', data: response}));
      },
      onError: function (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', data: err}));
      },
      onClose: function (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'close', data: err}));
      }
    };
    const connect = new window.Connect(options);
    connect.setup();
    connect.open();
    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loading'}));
    document.getElementsByTagName('iframe')[0].onload = function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'begin'}));
    };
    true;
  `;
}


