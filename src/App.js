import logo from './logo.svg';
import './App.css';

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, orderBy, limit, serverTimestamp, addDoc } from 'firebase/firestore'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { useRef, useState } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyAI-vucYVSEB6cGjc2nTyAQFQmK9-wfMX8",
  authDomain: "chat-app-2-5d63b.firebaseapp.com",
  projectId: "chat-app-2-5d63b",
  storageBucket: "chat-app-2-5d63b.appspot.com",
  messagingSenderId: "715377225597",
  appId: "1:715377225597:web:5fee4c2c49acbeb7c8e614"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    // Sign in with pop up window
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
    .then((res) => {
      const u = res.user;
      console.log("Signed in: ", u);
    })
    .catch((err) => {
      alert("FUCKKKKK: ", err);
    });
  }
  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  console.log(auth.currentUser);
  // React hook. 
  const dummy = useRef();

  // Collect all msg from firebase storage
  const messagesRef = collection(db, 'messages');

  // Collect the msg query from msg ref, order by time sent
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));

  // Using hooks to retrieve data from a snapshot
  const [messages] = useCollectionData(messagesQuery, {idField: 'id'});

  // Set state for a new msg ready to be sent
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    
    // prevent form button to reload when submit
    e.preventDefault();
    const {uid, photoURL, displayName} = auth.currentUser;
    // Push requested data to the server
    if(formValue == '') return;
    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      displayName,
      uid,
      photoURL
      // Keep uid and photo img
    });
    // Reset tmp data, set the state to blank
    setFormValue('');
    // scroll
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        <div ref={dummy}></div>

      </main>
      <header>
        <h1>⚛️🗣🔥CE01's Superchat🔥</h1>
        <SignOut />
      </header>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">
          Send
        </button>
      </form>
    </>
  )

}

function ChatMessage(props){
  const {text, uid, photoURL, displayName} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <div className='flex-col'>
        {(uid !== auth.currentUser.uid) ? <ShowName uname={displayName} /> : <></>}
        <div className={`user-message ${messageClass}`}>
          <img src={photoURL}/>
          <p>{text}</p>        
        </div>
      </div>
    </div>
  )
}

function ShowName(props){
  return(<div className='user-name'><span>{props.uname}</span></div>);
}

export default App;