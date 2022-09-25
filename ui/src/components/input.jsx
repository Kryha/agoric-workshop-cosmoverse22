import React from 'react';

const inputContainer = {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignContent: 'flex-start',
};
const textInput = {
  // display: 'flex',
  width: '100%',
  height: '20px',
  borderRadius: '4px',
  marginBottom: '10px',
  background: 'transparent',
  border: '2px solid #00FF5F',
  color: '#00FF5F',

  // background: '#22',
  // flexDirection: 'column',
};
const inputHeader = {
  height: '20px',
  marginBottom: '15px',
  alignSelf: 'flex-start',
  color: '#00FF5F',
  textTransform: 'uppercase',
  // background: '#22',
};

const Input = ({ name, textValue, inputHandler }) => {
  return (
    <div style={inputContainer}>
      <h4 style={inputHeader}>{name}:</h4>
      <input
        type="text"
        style={textInput}
        onChange={inputHandler}
        value={textValue}
      />
    </div>
  );
};

export default Input;
