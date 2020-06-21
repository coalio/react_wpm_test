import React from 'react';
import './Keybox.css';

const Keybox = props => {
  let classes = ['none', 'wrong', 'correct']

  let className = classes[props.classify]
  return (
   <div className={'key_box ' + className}>
     {props.children}
   </div> 
  )
}

export default Keybox;