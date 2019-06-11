import React from 'react';
import ReactDOM from 'react-dom';

import * as firebase from 'firebase/app';
import 'firebase/auth';

import App from './App';
import './util';

import './index.css';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
});

ReactDOM.render(<App />, document.getElementById('root'));
