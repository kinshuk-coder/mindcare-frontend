// import the necessary hooks from react
import { useEffect, useRef, useState } from "react"

// header component to display the title and Dev Mode button
const Header = ({changeMode,devMode}) => (
  
  <header className="header">
      <div className="header-left">
        <button onClick={changeMode} className={devMode?"dev-mode-enabled":"dev-mode-disabled"}>Dev Mode</button>
      </div>
      <div className="header-center">
    <p className="heading">MindCare AI</p>
    <p className="online">• Online</p>
    </div>
    <div className="header-right"></div>

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
      {devMode && msg.role=="assistant"? <div className="messages-intent">Intent : {msg.intent} | Confidence Score : {msg.confidence_score}</div>: null } 
      </div>
    </div>
  )
  )}
  </div>
)

// Input component to take the input data sent by user and trigger handlesend function
const Input = ({handleSend,inputMessage,setInputMessage,isLoading}) => (
  <form onSubmit={handleSend}>
    <input value={inputMessage}
      onChange={(e)=> setInputMessage(e.target.value)} 
      placeholder="Type how you're feeling..." 
      className="input-box" 
      disabled = {isLoading}>

    </input>
    <button className="button" disabled={isLoading}>
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send-icon lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
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
      const response = await fetch(`https://mindcare-backend-2cv2.onrender.com/history/${sessionId}`)
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
    const response = await fetch("https://mindcare-backend-2cv2.onrender.com/chat",{
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
    {messages.length==0 ? <div className="welcome">Please type in your first message!</div>: <div/>}  
    <ChatBubble messages={messages} devMode={devMode}/>
    {isLoading ? <p className="loading"><svg style={{marginRight:'8px'}} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-icon lucide-loader"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>Thinking...</p> : <div/> }
    <div ref={messagesEndRef}/>
    </div>
    <Input handleSend={handleSend} inputMessage={inputMessage} setInputMessage={setInputMessage} isLoading={isLoading} />
    </div>
)
}