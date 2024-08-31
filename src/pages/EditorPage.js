import React, { useEffect, useRef, useState } from 'react'
import Client from '../commponets/Client';
import Editor from '../commponets/Editor';
import { initSocket } from '../socket';
import Action from '../Action';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';



const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId}= useParams();
  const [client, setClients] = useState([]);
  useEffect(()=>{
    const init = async()=>{
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err)=>handleError(err));
      socketRef.current.on('connect_failed', (err)=>handleError(err));
     
      function handleError(e){
        console.log('socket error', e.message);
        toast.error('Socket connection failed,try again later.');
        reactNavigator('/');
      }
      socketRef.current.emit(Action.JOIN,{
        roomId,
        username: location.state?.username,
      });
      // lising for jined event
      socketRef.current.on(Action.JOINED,({clients,username,socketId})=>{
        if(username !== location.state.username){
          toast.success(`${username} joined the room`);
        }
        setClients(clients);
        socketRef.current.emit(Action.SYNC_CODE,{
          code: codeRef.current,
          socketId
        })
      });

      //listening for disconnected
      socketRef.current.on(Action.DISCONNECTED,({socketId,username})=>{
        toast.success(`${username} left the room`);
        setClients((prev)=>prev.filter((client)=>client.socketId !== socketId));
      })
    }
    init();
    return ()=>{
      socketRef.current.disconnect();
      socketRef.current.off(Action.JOINED)
      socketRef.current.off(Action.DISCONNECTED)
    }
  },[])
  
  const copyRoomId = async()=>{
    try{
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    }
    catch(err){
      toast.error('Failed to copy Room ID');
      console.error('Error copying Room ID',err);
    }
  }
  
  const leaveRoom = ()=>{
    reactNavigator('/');
  }
  
  if(!location.state){
    return <Navigate to="/" />
  }
  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
          <div className='logo'>
            <img src='https://shorturl.at/MF9qM' alt='logo' className='imgEdiorpage'/>
            <h1 className='sz'>CodeEditor</h1>
          </div>
          <h3>Connected</h3>
          <div className='clientsList'>
            {
              client.map((client)=>(
                <Client key={client.socketId} username={client.username}/>
              ))
            }
          </div>
        </div>
        <div className='butonarjest'>
          <button className='copybtn' onClick={copyRoomId}>
            Copy Room ID
          </button>
          <button className='leavebtn' onClick={leaveRoom}>Leave</button>
        </div>
      </div>
      {/* <div className='editorWrap'> */}
        <Editor 
          socketRef={socketRef} 
          roomId={roomId} 
          onCodeChange={(code)=>{
            codeRef.current=code
            }}
        />
      {/* </div> */}
    </div>
  )
}

export default EditorPage;