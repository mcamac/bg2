import firebase from 'firebase'
import 'firebase/firestore'

const config = {
  apiKey: 'AIzaSyBqm0PVWN4tLwfiO1C_PIQus43f_HjOD2Q',
  authDomain: 'mcamac-187221.firebaseapp.com',
  databaseURL: 'https://mcamac-187221.firebaseio.com',
  projectId: 'mcamac-187221',
  storageBucket: 'mcamac-187221.appspot.com',
  messagingSenderId: '526698847914',
}

firebase.initializeApp(config)

export const db = firebase.firestore()
