import React, { useEffect, useRef } from 'react';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/javascript/javascript.js';
import Action from '../Action';

const Editor = ({socketRef,roomId,onCodeChange}) => {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(
      document.getElementById('realtimeEditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
      });
      
      editorRef.current.on('change',(instance,changes)=>{
        const {origin} = changes;
        const code = instance.getValue();
        onCodeChange(code); // Call the provided function to update the code state
        if(origin!=='setValue'){
          // Send the updated code to your server or any other backend service
          socketRef.current.emit(Action.CODE_CHANGE,{
            roomId,
            code
          });
          console.log(code);
        }
      });
    }

    init(); // Call the init function to initialize the editor
  }, []);
  useEffect(()=>{
    if(socketRef.current){
      socketRef.current.on(Action.CODE_CHANGE,({code})=>{
        if(code!==null){
          editorRef.current.setValue(code);
        }
      })
    }
    return () => {
      socketRef.current.off(Action.CODE_CHANGE);
    }
  },[socketRef.current])

  return <textarea id="realtimeEditor">console.log("Write your js Code here");</textarea>;
};

export default Editor;
