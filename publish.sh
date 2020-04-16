rm momocapture.apk
ionic cordova build android --prod --release
jarsigner -tsa http://timestamp.digicert.com -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../momocapture.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk momocapture.apk

rm momocapture.aab
ionic cordova build android
./platforms/android/gradlew bundle
jarsigner -tsa http://timestamp.digicert.com -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../momocapture.keystore platforms/android/app/build/outputs/bundle/release/app.aab alias_name
zipalign -v 4 platforms/android/app/build/outputs/bundle/release/app.aab momocapture.aab
