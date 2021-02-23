import React, {useState} from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Parse from 'parse/react-native';
import {useNavigation} from '@react-navigation/native';
import Styles from './Styles';
import {GoogleSignin} from '@react-native-community/google-signin';

export const UserLogIn = () => {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const doUserLogIn = async function () {
    // Note that this values come from state variables that we've declared before
    const usernameValue = username;
    const passwordValue = password;
    return await Parse.User.logIn(usernameValue, passwordValue)
      .then(async (loggedInUser) => {
        // logIn will throw an error if the user is not verified yet,
        // but it's safer to check again after login
        if (loggedInUser.get('emailVerified') === true) {
          Alert.alert(
            'Success!',
            `User ${loggedInUser.get('username')} has successfully signed in!`,
          );
          // Verify this is in fact the current user
          const currentUser = await Parse.User.currentAsync();
          console.log(loggedInUser === currentUser);
          // Navigation.navigate takes the user to the home screen
          navigation.navigate('Home');
          return true;
        } else {
          await Parse.User.logOut();
          return false;
        }
      })
      .catch((error) => {
        // Error can be caused by wrong parameters or lack of Internet connection.
        // A non-verified user will also cause an error
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  const doUserLogInGoogle = async function () {
    try {
      // Check if your user can sign in using Google on his phone
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Retrieve user data from Google
      const userInfo = await GoogleSignin.signIn();
      const googleIdToken = userInfo.idToken;
      const googleUserId = userInfo.user.id;
      const googleEmail = userInfo.user.email;
      const authData = {
        id: googleUserId,
        id_token: googleIdToken,
      };
      // Log in or sign up on Parse using this Google credentials
      let userToLogin = new Parse.User();
      // Set username and email to match google email
      userToLogin.set('username', googleEmail);
      userToLogin.set('email', googleEmail);
      return await userToLogin
        .linkWith('google', {
          authData: authData,
        })
        .then(async (loggedInUser) => {
          // logIn returns the corresponding ParseUser object
          Alert.alert(
            'Success!',
            `User ${loggedInUser.get('username')} has successfully signed in!`,
          );
          // To verify that this is in fact the current user, currentAsync can be used
          const currentUser = await Parse.User.currentAsync();
          console.log(loggedInUser === currentUser);
          // Navigation.navigate takes the user to the screen named after the one
          // passed as parameter
          navigation.navigate('Home');
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

  return (
    <View style={Styles.login_wrapper}>
      <View style={Styles.form}>
        <TextInput
          style={Styles.form_input}
          value={username}
          placeholder={'Username'}
          onChangeText={(text) => setUsername(text)}
          autoCapitalize={'none'}
          keyboardType={'email-address'}
        />
        <TextInput
          style={Styles.form_input}
          value={password}
          placeholder={'Password'}
          secureTextEntry
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity onPress={() => doUserLogIn()}>
          <View style={Styles.button}>
            <Text style={Styles.button_label}>{'Sign in'}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={Styles.login_social}>
        <View style={Styles.login_social_separator}>
          <View style={Styles.login_social_separator_line} />
          <Text style={Styles.login_social_separator_text}>{'or'}</Text>
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
          <TouchableOpacity onPress={() => doUserLogInGoogle()}>
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
      <>
        <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
          <Text style={Styles.login_footer_text}>
            {"Don't have an account? "}
            <Text style={Styles.login_footer_link}>{'Sign up'}</Text>
          </Text>
        </TouchableOpacity>
      </>
    </View>
  );
};
