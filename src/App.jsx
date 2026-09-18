// import the necessary hooks from react
import { useEffect, useRef, useState } from "react"

// header component to display the title and Dev Mode button
const Header = ({changeMode,devMode}) => (
  <header className="header">
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></svg>
      </span>
      <div className="brand-text">
        <p className="heading">MindCare AI</p>
        <p className="online"><span className="online-dot" aria-hidden="true"></span>Online</p>
      </div>
    </div>
    <button
      onClick={changeMode}
      aria-pressed={devMode}
      className={devMode?"dev-mode-enabled":"dev-mode-disabled"}>
      Dev Mode
    </button>
  </header>
)

// ChatBubble component to display the messages and the additional information depending upon the devMode state variable
const ChatBubble = ({messages,devMode}) => (
  <div>
  {messages.map((msg,index) => (
    <div className="messages-container"
    key = {index}
    style={{justifyContent:msg.role=="user" ? 'flex-end':'flex-start'}}>
    <div
      className={`messages ${msg.role=="user"?'messages_user':'messages_assistant'}`}>
      {msg.content}
      {devMode && msg.role=="assistant"? (
        <div className="messages-intent">
          <span className="intent-chip">Intent · {msg.intent}</span>
          <span className="intent-chip">Confidence · {msg.confidence_score}</span>
        </div>
      ): null }
      </div>
    </div>
  )
  )}
  </div>
)

// Input component to take the input data sent by user and trigger handlesend function
const Input = ({handleSend,inputMessage,setInputMessage,isLoading}) => (
  <form className="composer" onSubmit={handleSend}>
    <input value={inputMessage}
      onChange={(e)=> setInputMessage(e.target.value)}
      placeholder="Type how you're feeling..."
      className="input-box"
      aria-label="Message"
      disabled = {isLoading} />

    <button className="button" aria-label="Send message" disabled={isLoading || !inputMessage.trim()}>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
    </button>
  </form>
)




// default export function for this file
export default function App(){
  const [inputMessage,setInputMessage] = useState('')
  const [messages,setMessages] = useState([])
  const [isLoading,setIsLoading] = useState(false)
  const [devMode,setDevMode] = useState(false)

  // function to get the saved sessionId from the browser's storage to continue the conversation else create a new one
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("mindCare")
    if(saved) return saved

    const newId = crypto.randomUUID();
    localStorage.setItem("mindCare",newId)
    return newId


  })

  // function to scroll the screen down whenever messages updates
  const messagesEndRef = useRef(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"})
  },[messages])

  // function to retrieve the history for specific session_id from backend
  useEffect(() => {
    async function fetchData(){
      const response = await fetch(`https://mindcare-backend-3bbw.onrender.com/history/${sessionId}`)
      const history = await response.json()


      setMessages(history)
       }
      fetchData()
     },[])

  // function to send the input to backend, recieve the response and update the messages state variable to render the updated messages
  const handleSend = async e => {

    e.preventDefault()
    const userMessage = inputMessage

    if(!inputMessage.trim()) return
    setMessages((prev) => [...prev,{
      "role":"user",
      "content":userMessage
    }])



    setInputMessage('')

    setIsLoading(true)

    try{
    const response = await fetch("https://mindcare-backend-3bbw.onrender.com/chat",{
      method : "POST",
      headers : {"content-type":"application/json"},
      body : JSON.stringify({user_message:userMessage,
              session_id:sessionId
      })
    })
    const backendData = await response.json()


    setMessages((prev) => [...prev,{
      "role":"assistant",
      "content":backendData.ai_message,
      "intent":backendData.intent,
      "confidence_score": backendData.confidence_score
    }])
  }
  catch(error){
    console.error("AI processing error:",error)
  }
  finally{
    setIsLoading(false)
  }

  }
  // function to toggle the devMode button
  const changeMode = e => {
    setDevMode(!devMode)
  }

// render the UI using the components and functions defined above
return (
  <div className="app-container">
    <Header changeMode = {changeMode} devMode={devMode}/>
    <div className="chat-container">
    {messages.length==0 ? (
      <div className="welcome">
        <p className="welcome-title">How are you feeling today?</p>
        <p className="welcome-subtitle">Share whatever is on your mind — this is a private space to think out loud.</p>
      </div>
    ): <div/>}
    <ChatBubble messages={messages} devMode={devMode}/>
    {isLoading ? (
      <div className="loading" role="status" aria-label="Thinking">
        <span></span><span></span><span></span>
      </div>
    ) : <div/> }
    <div ref={messagesEndRef}/>
    </div>
    <Input handleSend={handleSend} inputMessage={inputMessage} setInputMessage={setInputMessage} isLoading={isLoading} />
    </div>
)
}
