# react-native-dojah

> https://github.com/cjayprime/react-native-dojah

[![NPM](https://img.shields.io/npm/v/react-native-dojah.svg)](https://www.npmjs.com/package/react-native-dojah) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Install

```sh
npm install react-native-dojah-lib --save
```

or with `yarn`

```sh
yarn add react-native-dojah-lib
```

Required Packages
## Other required installations (make sure to follow the instructions in the react-native-webview documentation)
### See https://github.com/react-native-webview/react-native-webview/issues/140#issuecomment-574185464
```sh
npm install react-native-webview react-native-permissions react-native-geolocation-service @react-native-async-storage/async-storage --save
```

# On Android
```sh
// If you would like to use the selfie, or id screens, add:
// Add the camera permission: 
<uses-permission android:name="android.permission.CAMERA" />
// Add the modify audio settings permission:
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

// If you would like to use the address screen, add:
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

# On iOS
```sh
// If you would like to use the selfie, or id screens, add:
permissions_path = '../node_modules/react-native-permissions/ios'
pod 'Permission-Camera', :path => "#{permissions_path}/Camera"

// If you would like to use the address screen, add:
pod 'Permission-LocationAccuracy', :path => "#{permissions_path}/LocationAccuracy"
pod 'Permission-LocationAlways', :path => "#{permissions_path}/LocationAlways"
pod 'react-native-geolocation-service', path: '../node_modules/react-native-geolocation-service'
```


## Usage

```jsx
/* eslint-disable */
import * as React from 'react';

import { SafeAreaView, StyleSheet } from 'react-native';
import { Dojah } from 'react-native-dojah';

export default function App() {

/**
 *  This is your app ID
 * (go to your dashboard at
 * https://dojah.io/dashboard
 * to create an app and retrieve it)
 */
const appId = '6000604fb87ea60035ef41bb';


/**
 *  This is your account public key
 *  (go to your dashboard at
 *  https://dojah.io/dashboard to
 *  retrieve it. You can also regenerate one)
 */
const publicKey = 'test_pk_TO6a57RT0v5QyhZmhbuLG8nZI';



/**
 *  This is the widget type you'd like to load
 *  (go to your dashboard at
 *  https://dojah.io/dashboard to enable different
 *  widget types)
 */
const type = 'liveness';

/**
 *  These are the configuration options
 *  available to you are:
 *  {debug: BOOL, pages: ARRAY[{page: STRING, config: OBJECT}]}
 *
 *  The config object is as defined below
 *
 *  NOTE: The otp and selfie options are only
 *  available to the `verification` widget
 */

const config = {
    debug: true,
    pages: [
        { page: 'address', config: { verification: true } },
        {
        page: 'government-data',
        config: {
            bvn: true,
            nin: false,
            dl: false,
            mobile: false,
            otp: false,
            selfie: false,
        },
        },
    ],
};


/**
 *  These are the user's data to verify, options
 *  available to you possible options are:
 *  {first_name: STRING, last_name: STRING, dob: DATE STRING}
 *
 *  NOTE: Passing all the values will automatically skip
 *  the user-data page (thus the commented out `last_name`)
 */

const userData = {
    first_name: 'Chisom',
    last_name: 'Ekwuribe',
    dob: '2022-05-01',
};


/**
 *  These are the metadata options
 *  You can pass any values within the object
 */

const metadata = {
    user_id: '121',
};



/**
 * @param {String} responseType
 * This method receives the type
 * The type can only be one of:
 * loading, begin, success, error, close
 * @param {String} data
 * This is the data from doja
 */

  const response = (responseType: string, data: any) => {
    console.log('Response:', responseType, JSON.stringify(data));
    if (responseType === 'success') {
    } else if (responseType === 'error') {
    } else if (responseType === 'close') {
    } else if (responseType === 'begin') {
    } else if (responseType === 'loading') {
    }
  };
  React.useEffect(() => {
    Dojah.hydrate(appId, publicKey);
  }, [appId, publicKey]);


  return (
    <SafeAreaView style={styles.container}>
      <Dojah
        appId={appId}
        publicKey={publicKey}
        type={type}
        config={config}
        userData={userData}
        metadata={metadata}
        response={response}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


export default App

```

See the `example` folder for an implementation

## Deployment

**`REMEMBER TO CHANGE THE APP ID and PUBLIC KEY WHEN DEPLOYING TO A LIVE (PRODUCTION) ENVIRONMENT`**

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b feature/feature-name`
3. Commit your changes: `git commit -am 'Some commit message'`
4. Push to the branch: `git push origin feature/feature-name`
5. Submit a pull request 😉😉

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
