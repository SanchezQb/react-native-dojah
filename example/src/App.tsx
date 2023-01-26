/* eslint-disable */
import * as React from 'react';

import { SafeAreaView, StyleSheet } from 'react-native';
import { Dojah } from 'react-native-dojah';

export default function App() {


  const appId = '6000604fb87ea60035ef41bb';

  const publicKey = 'prod_pk_7jspvKP2FMkjkSZx1qnbgiMWy';

  const type = 'liveness';

  const config = {
    debug: true,
    pages: [
      // { page: 'address' },
      // {
      //   page: 'government-data',
      //   config: {
      //     bvn: true,
      //     nin: false,
      //     dl: false,
      //     mobile: false,
      //     otp: false,
      //     selfie: false,
      //   },
      // },
      { page: 'selfie' },
      // { page: 'id', config: { passport: false, dl: true } },
    ],
  };


  const userData = {
    first_name: 'Chisom',
    last_name: 'Ekwuribe',
    dob: '2022-05-01',
  };

  const metadata = {
    user_id: '121',
  };


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
