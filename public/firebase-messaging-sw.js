importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDDvsFdGHBtRe3Q1byauV8UWQI1rvRUFA0',
  authDomain: 'casa-ciriani.firebaseapp.com',
  projectId: 'casa-ciriani',
  storageBucket: 'casa-ciriani.firebasestorage.app',
  messagingSenderId: '68565200855',
  appId: '1:68565200855:web:a971f354b5f931f294e592',
})

const messaging = firebase.messaging()