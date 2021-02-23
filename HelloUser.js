import React, {useEffect, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import Parse from 'parse/react-native';
import {GoogleSignin} from '@react-native-community/google-signin';
import Styles from './Styles';

export const HelloUser = () => {
  // State variable that will hold username value
  const [username, setUsername] = useState('');

  // useEffect is called after the component is initially rendered and
  // after every other render
  useEffect(() => {
    // Since the async method Parse.User.currentAsync is needed to
    // retrieve the current user data, you need to declare an async
    // function here and call it afterwards
    async function getCurrentUser() {
      // This condition ensures that username is updated only if needed
      if (username === '') {
        const currentUser = await Parse.User.currentAsync();
        if (currentUser !== null) {
          setUsername(currentUser.getUsername());
        }
      }
    }
    getCurrentUser();
  }, [username]);

  const doUserLinkGoogle = async function () {
    try {
      // Check if your user can sign in using Google on his phone
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Retrieve user data from Google
      const userInfo = await GoogleSignin.signIn();
      const googleIdToken = userInfo.idToken;
      const googleUserId = userInfo.user.id;
      const authData = {
        id: googleUserId,
        id_token: googleIdToken,
      };
      let currentUser = await Parse.User.currentAsync();
      // Link user with his Google Credentials
      return await currentUser
        .linkWith('google', {
          authData: authData,
        })
        .then(async (loggedInUser) => {
          // logIn returns the corresponding ParseUser object
          Alert.alert(
            'Success!',
            `User ${loggedInUser.get(
              'username',
            )} has successfully linked his Google account!`,
          );
          // To verify that this is in fact the current user, currentAsync can be used
          currentUser = await Parse.User.currentAsync();
          console.log(loggedInUser === currentUser);
          return true;
        })
        .catch(async (error) => {
          // Error can be caused by wrong parameters or lack of Internet connection
          Alert.alert('Error!', error.message);
          return false;
        });
    } catch (error) {
      Alert.alert('Error!', error.code);
      return false;
    }
  };

  // Note the conditional operator here, so the "Hello" text is only
  // rendered if there is an username value
  return (
    <View style={Styles.login_wrapper}>
      <View style={Styles.form}>
        {username !== '' && <Text>{`Hello ${username}!`}</Text>}
      </View>
      <View style={Styles.login_social}>
        <View style={Styles.login_social_separator}>
          <View style={Styles.login_social_separator_line} />
          <Text style={Styles.login_social_separator_text}>
            {'Link your account to another auth provider'}
          </Text>
          <View style={Styles.login_social_separator_line} />
        </View>
        <View style={Styles.login_social_buttons}>
          <TouchableOpacity>
            <View
              style={[
                Styles.login_social_button,
                Styles.login_social_facebook,
              ]}>
              <Image
                style={Styles.login_social_icon}
                source={require('./assets/icon-facebook.png')}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => doUserLinkGoogle()}>
            <View style={Styles.login_social_button}>
              <Image
                style={Styles.login_social_icon}
                source={require('./assets/icon-google.png')}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <View style={Styles.login_social_button}>
              <Image
                style={Styles.login_social_icon}
                source={require('./assets/icon-apple.png')}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
