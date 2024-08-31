import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId]=useState('');
  const [username, setusername]=useState('');

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id);
    toast.success('Created a new room')
  }

  const joinRoom=()=>{
    if(!roomId || !username){
      toast.error('ROOM ID & username is required');
      return;
    }

    //redirect
    navigate(`/editor/${roomId}`,{
      state:{
        username,
        roomId
      }
    })
  };

  const handelInputEnter=(e)=>{
    if(e.code === 'Enter'){
      joinRoom();
    }
  }
  return (
    <div className='homePageWrapper'>
       <div className='formWrpaper'>
          <div className='LogoType'>
            <img src='https://shorturl.at/MF9qM' alt='code' className='img'/>&nbsp;
            <p className='sz'><b>Code With Deva</b></p>

          </div>
           <h4 className='mainLable'>Paste invitation Room ID</h4>
           <div className='inputGroup'>
            <input 
              type="text" 
              className='inputbox' 
              placeholder='ROOM ID' 
              value={roomId } 
              onChange={(e)=>setRoomId(e.target.value)}
              onKeyUp={handelInputEnter}
            />
            <input 
              type="text" 
              className='inputbox' 
              placeholder='USERNAME'
              onChange={(e)=>setusername(e.target.value)}
              value={username } 
              onKeyUp={handelInputEnter}
            />
            <button className='btn joinBtn' onClick={joinRoom}>Join</button>
            <span className='createInfo'>
              If you dont't have an invite then create &nbsp;
              <a href='' target='_blank' onClick={createNewRoom} className='createNewBtn'>new room</a> &nbsp;
            </span>
           </div>
       </div>
       <footer>
        <h4>Built by Deva</h4>
       </footer>
    </div>
  )
}

export default Home