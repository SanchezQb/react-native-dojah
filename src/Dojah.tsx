/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';
import {
    checkMultiple,
    requestMultiple,
    openSettings,
    PERMISSIONS,
    RESULTS,
    Permission,
} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { injectJavascript } from './utils/injectJavascript';
import type { UserData } from './types/userData.type';
import type { Metadata } from './types/metadata.type';

const PLATFORM_CAMERA: Permission =
    Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;


const PLATFORM_LOCATION = Platform.OS === 'android'
    ? [
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ]
    : PERMISSIONS.IOS.LOCATION_ALWAYS;



const DojahWidget = (props: DojahProps) => {

    const { appId, publicKey, userData, metadata, config, type, response } = props;

    const [permissionsGranted, setPermissionsGranted] = useState<{ camera?: boolean, location?: boolean }>({
        location: undefined,
        camera: undefined,
    });
    type PermissionsObjKey = keyof typeof permissionsGranted;


    const [location, setLocation] = useState<Geolocation.GeoPosition>();

    const pages = useMemo(
        () => (!config.pages ? [] : config.pages.map((page: any) => page.page)),
        [config.pages],
    );
    const needsCamera = useMemo(
        () =>
            ['liveness', 'verification'].includes(type) ||
            pages.includes('selfie') ||
            pages.includes('id') ||
            pages.includes('face-id'),
        [pages, type],
    );
    const needsLocation = useMemo(() => {
        return config.pages.some(
            (page: any) =>
                page.page === 'address' &&
                (typeof page.config?.verification === undefined ||
                    page.config?.verification === true),
        );
    }, [config.pages]);



    const log = useCallback(
        (...args: any[]) => {
            config.debug && console.log(...args);
        },
        [config.debug],
    );


    const permissionsNeeded = useMemo(() => needsCamera || needsLocation, [
        needsCamera,
        needsLocation,
    ]);



    const getCurrentPosition = useCallback(() => {
        Geolocation.getCurrentPosition(
            async (loc) => {
                log('GeoLocation:', loc);
                setLocation({
                    ...loc,
                });
            },
            (error) => {
                log('GeoLocation Error:', error);
                setPermissionsGranted((state) => ({ ...state, location: false }));
            },
            {
                distanceFilter: 10,
                maximumAge: 0,
                timeout: 6 * 60 * 60 * 1000,
                enableHighAccuracy: true,
                showLocationDialog: true,
                forceRequestLocation: true,
                forceLocationManager: false,
            },
        );
    }, [log]);



    const makeRequest = useCallback(
        (permissions: Permission[]) => {
            log('Dojah Requesting:', permissions);

            requestMultiple(permissions).then((statuses) => {
                log('ANDROID Camera', statuses[PERMISSIONS.ANDROID.CAMERA]);
                log('IOS Camera', statuses[PERMISSIONS.IOS.CAMERA]);
                log(
                    'ANDROID Background Location',
                    statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION],
                );
                log(
                    'ANDROID Fine Location',
                    statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION],
                );
                log('IOS Location', statuses[PERMISSIONS.IOS.LOCATION_ALWAYS]);

                const _location =
                    statuses[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] ===
                    'granted' ||
                    statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === 'granted' ||
                    statuses[PERMISSIONS.IOS.LOCATION_ALWAYS] === 'granted';
                setPermissionsGranted({
                    camera:
                        statuses[PERMISSIONS.ANDROID.CAMERA] === 'granted' ||
                        statuses[PERMISSIONS.IOS.CAMERA] === 'granted' ||
                        undefined,
                    location: _location || undefined,
                });

                if (_location) {
                    getCurrentPosition();
                }
            });
        },
        [log, getCurrentPosition],
    );


    const requestPermission = useCallback(() => {
        const permissions: Permission[] = [
            needsCamera && PLATFORM_CAMERA,
            needsLocation && PLATFORM_LOCATION,
        ]
            .filter((perm) => !!perm)
            .flatMap((item) => item);


        console.log("Checking multiple")

        checkMultiple(permissions)
            .then((statuses) => {
                let request = false;
                let read = false;
                permissions.every((permission) => {
                    const check = permission === PLATFORM_CAMERA ? 'camera' : 'location';

                    switch (statuses[permission]) {
                        case RESULTS.GRANTED:
                            log('The permission is granted', permission);
                            setPermissionsGranted((state) => ({ ...state, [check]: true }));
                            if (permission === PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION) {
                                read = true;
                            }
                            break;
                        case RESULTS.UNAVAILABLE:
                            log(
                                'This feature is not available (on this device / in this context)',
                                permission,
                            );
                            // If it's background location don't return false
                            if (
                                permission === PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION
                            ) {
                                return true;
                            }
                            setPermissionsGranted((state) => ({ ...state, [check]: false }));
                            return false;
                        case RESULTS.BLOCKED:
                            log('The permission is denied and not requestable anymore');
                            setPermissionsGranted((state) => ({ ...state, [check]: false }));
                            openSettings().catch(() => log('We cannot open settings'));
                            return false;
                        case RESULTS.DENIED:
                            log(
                                'The permission has not been requested / is denied but requestable',
                            );
                            request = true;
                            break;
                        case RESULTS.LIMITED:
                            log('The permission is limited: some actions are possible');
                            request = true;
                            break;
                        default:
                            log('The permission is unknown', statuses, permission);
                            break;
                    }

                    return true;
                });

                if (request) {
                    makeRequest(permissions);
                } else if (read) {
                    getCurrentPosition();
                }
            })
            .catch((e) => {
                log('Error when checking for permissions', e);
            });
    }, [getCurrentPosition, log, makeRequest, needsCamera, needsLocation]);


    if (permissionsNeeded) {
        if (
            (needsLocation && permissionsGranted.location === undefined) ||
            (needsCamera && permissionsGranted.camera === undefined)
        ) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3977de" />
                </View>
            );
        }

        if (
            (needsLocation && !permissionsGranted.location) ||
            (needsCamera && !permissionsGranted.camera)
        ) {
            return (
                <View style={styles.center}>
                    <Text style={styles.text}>
                        You need to grant all necessary permissions. You denied the the
                        following permissions:{' '}
                        {Object.keys(permissionsGranted)
                            .map((permission) => {

                                const key = permission as PermissionsObjKey;

                                return (!permissionsGranted[`${key}`] ? permission : null)
                            })
                            .filter((permission) => !!permission)
                            .join(', ')}
                    </Text>
                </View>
            );
        }
    }

    useEffect(() => {

        if (permissionsNeeded) {

            requestPermission();
        }
        return () => response('close');
    }, [
        permissionsNeeded,
        config.pages,
        requestPermission,
        type,
        needsCamera,
        needsLocation,
        response,
    ]);

    return (
        <WebView
            originWhiteList={['*']}
            javaScriptEnabled={true}
            scalesPageToFit={true}
            useWebkit={true}
            startInLoadingState={true}
            source={{
                baseUrl: 'https://widget.dojah.io',
                html: `
                  <html>
                    <head>
                      <script type="application/javascript" src="https://widget.dojah.io/widget.js"></script>
                      <meta name="viewport" content="width=device-width">
                    </head>
                    <body>
                    </body>
                  </html>
                `,
            }}
            injectedJavaScript={injectJavascript(appId, publicKey, type, config, userData, metadata, location && location)}
            injectedJavaScriptBeforeContentLoadedForMainFrameOnly={true}
            cacheEnabled={false}
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            allowsInlineMediaPlayback={needsCamera}
            geolocationEnabled={needsLocation}
            onMessage={async (e) => {
                const data = JSON.parse(e.nativeEvent.data);
                if (data.type === 'success') {
                    const widgetData = data.data.data;

                    await AsyncStorage.setItem(
                        '@Dojah:SESSION_ID',
                        data.data.verificationId,
                    );

                    try {
                        if (widgetData.address) {
                            const addressLocation =
                                widgetData.address.data.location.addressLocation;
                            await AsyncStorage.setItem(
                                '@Dojah:LATITUDE',
                                addressLocation.latitude,
                            );
                            await AsyncStorage.setItem(
                                '@Dojah:LONGITUDE',
                                addressLocation.longitude,
                            );
                        }
                    } catch { }
                }

                response(data.type, data);
            }}
        />
    )
}

DojahWidget.hydrate = (appId: string, pKey: string) => {
    Geolocation.watchPosition(
        async (loc) => {
            const session = await AsyncStorage.getItem('@Dojah:SESSION_ID');
            if (!session) {
                return;
            }

            const addressLocation = {
                latitude: await AsyncStorage.getItem('@Dojah:LATITUDE'),
                longitude: await AsyncStorage.getItem('@Dojah:LONGITUDE'),
            };
            const userLocation = {
                ...loc,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
            // Submit the position
            await fetch('https://kyc.dojah.io/address', {
                method: 'POST',
                body: JSON.stringify({
                    location: userLocation,
                    baseLocation: addressLocation,
                    background: true,
                    appId,
                    pKey,
                    session,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        },
        (e) => {
            console.warn('Hydration Failed', e);
        },
        {
            distanceFilter: 10,
            enableHighAccuracy: true,
            showLocationDialog: true,
            forceRequestLocation: true,
            forceLocationManager: false,
            showsBackgroundLocationIndicator: false,
        },
    );
};


const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: '80%',
        height: '80%',
    },
    text: {
        color: 'black',
        textAlign: 'center',
        fontSize: 13,
    },
});

type DojahProps = {
    appId: string;
    type: string;
    publicKey: string;
    config: any;
    userData?: UserData;
    metadata?: Metadata;
    // widgetId?: string;
    response: (responseType: string, data?: any) => void;
}

export default DojahWidget