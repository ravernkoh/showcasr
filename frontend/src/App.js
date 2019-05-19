import React, {Component} from 'react';

import firebase from 'firebase/app';

import axios from './axios';

import Display from './components/Display';
import Loading from './components/Loading';
import Login from './components/Login';

import './App.css';

const SCREEN_LOADING = 'LOADING';
const SCREEN_LOGIN = 'LOGIN';
const SCREEN_DISPLAY = 'DISPLAY';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentScreen: SCREEN_LOADING,
    };
  }

  componentDidMount() {
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        this.registerFirebaseAuthStateObserver();
      })
      .catch(console.error);
  }

  registerFirebaseAuthStateObserver() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // Set user token within the `Authorization` header.
        firebase
          .auth()
          .currentUser.getIdToken()
          .then(idToken => {
            axios.defaults.headers.common.Authorization = `Bearer ${idToken}`;
            this.setState({currentScreen: SCREEN_DISPLAY});
          });
      } else {
        this.setState({currentScreen: SCREEN_LOGIN});
      }
    });
  }

  render() {
    switch (this.state.currentScreen) {
      case SCREEN_LOADING:
        return <Loading />;
      case SCREEN_DISPLAY:
        return <Display />;
      case SCREEN_LOGIN:
        return <Login />;
      default:
        break;
    }
  }
}

export default App;
