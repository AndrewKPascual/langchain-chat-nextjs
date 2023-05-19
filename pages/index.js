import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';

export default function Home() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { "message": "Hi there! How can I help?", "type": "apiMessage" }
  ]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState([]);
  
  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    // This will run only on the client side
    if (audioData.length > 0) {
      const url = URL.createObjectURL(new Blob(audioData));
      setAudioUrl(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioData]);

  const handleError = () => {
    setMessages((prevMessages) => [...prevMessages, { "message": "Oops! There seems to be an error. Please try again.", "type": "apiMessage" }]);
    setLoading(false);
    setUserInput("");
  }

  const handleSubmit = async () => {
    setLoading(true);
  
    const audioBlob = new Blob(audioData, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob);
  
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
  });

    if (!response.ok) {
      handleError();
      return;
    }

    const data = await response.json();
    setMessages((prevMessages) => [...prevMessages, { "message": data.transcript, "type": "userMessage" }]);
    setUserInput(data.transcript);

    const context = [...messages, { "message": userInput, "type": "userMessage" }];

    const chatResponse = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: context }),
    });

    if (!chatResponse.ok) {
      handleError();
      return;
    }

    const chatData = await chatResponse.json();
    setMessages((prevMessages) => [...prevMessages, { "message": chatData.result.success, "type": "apiMessage" }]);
    setLoading(false);
    setAudioData([]);
  };

  const startRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const mediaRecorder = new MediaRecorder(stream);
    setMediaRecorder(mediaRecorder);
    mediaRecorder.start();
    // Clear previous audio data when starting a new recording
    setAudioData([]);
    mediaRecorder.ondataavailable = (e) => {
      setAudioData(prevAudioData => [...prevAudioData, e.data]);
    };
  });
}

const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    // After stopping the recording, you can immediately send it to the server
    handleSubmit();
  }
}

const handleFormSubmit = (e) => {
  e.preventDefault();
  handleSubmit();
};



  return (
    <>
      <Head>
        <title>LangChain Chat</title>
        <meta name="description" content="LangChain documentation chatbot" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
      <div className = {styles.navlogo}>
    <a href="/">LangChain</a>
    </div>
    <div className = {styles.navlinks}>
    <a href="https://langchain.readthedocs.io/en/latest/" target="_blank">Docs</a>
    <a href="https://github.com/zahidkhawaja/langchain-chat-nextjs" target="_blank">GitHub</a>
    </div>
</div>
      <main className={styles.main}>
      <div className = {styles.cloud}>
        <div ref={messageListRef} className = {styles.messagelist}>
        {messages.map((message, index) => {
  return (
    <div key = {index} className = {message.type === "userMessage" && loading && index === messages.length - 1  ? styles.usermessagewaiting : message.type === "apiMessage" ? styles.apimessage : styles.usermessage}>
      {message.type === "apiMessage" ? <Image src = "/parroticon.png" alt = "AI" width = "30" height = "30" className = {styles.boticon} priority = {true} /> : <Image src = "/usericon.png" alt = "Me" width = "30" height = "30" className = {styles.usericon} priority = {true} />}
      <div className = {styles.markdownanswer}>
        <ReactMarkdown linkTarget = {"_blank"}>{message.message}</ReactMarkdown>
      </div>
    </div>
  )
})}

        </div>
            </div>
           <div className={styles.center}>
            
            <div className = {styles.cloudform}>
           <form onSubmit = {handleFormSubmit}>
          <textarea 
          disabled = {loading}
          ref = {textAreaRef}
          autoFocus = {false}
          rows = {1}
          maxLength = {512}
          type="text" 
          id="userInput" 
          name="userInput" 
          placeholder = {loading? "Waiting for response..." : "Type your question..."}  
          value = {userInput} 
          onChange = {e => setUserInput(e.target.value)} 
          className = {styles.textarea}
          />
            <button 
            type = "submit" 
            disabled = {loading}
            className = {styles.generatebutton}
            >
            {loading ? <div className = {styles.loadingwheel}><CircularProgress color="inherit" size = {20}/> </div> : 
            // Send icon SVG in input field
            <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
            <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
          </svg>}
            </button> 
            </form>
            </div>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            <audio src={audioUrl} controls />
            <div className = {styles.footer}>
            <p>Powered by <a href = "https://github.com/hwchase17/langchain" target="_blank">LangChain</a>. Built by <a href="https://twitter.com/chillzaza_" target="_blank">Zahid</a>.</p>
            </div>
        </div>
      </main>
    </>
  );
}
