import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';
import Input from './components/input.jsx';

import { useAgoricContext } from './service/agoric.js';
import { mintNfts } from './service/actions.js';

const mainContainer = {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '30vh',
  alignItems: 'center',
  borderRadius: '6px',
};

const formContainer = {
  ...mainContainer,
  width: '450px',
  background: 'transparent',
  padding: '40px',
  border: '2px solid #00FF5F',
};

const buttonStyle = {
  borderRadius: '4px',
  padding: '6px 35px',
  marginTop: '30px',
  alignSelf: 'flex-end',
  background: 'transparent',
  color: '#00FF5F',
  cursor: 'pointer',
  border: '2px solid #00FF5F',
  textTransform: 'uppercase',
  fontWeight: 'bold',
};

function App() {
  // useEffect(() => {}, []);
  const [agoric, agoricDispatch] = useAgoricContext();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const handleName = (event) => {
    setName(event.currentTarget.value);
  };

  const handleUrl = (event) => {
    setUrl(event.currentTarget.value);
  };

  const handleSubmit = async () => {
    console.log('fuck yeah boyyyy', name, url);
    console.log(await mintNfts(agoric, [{ name, url }]));
  };

  return (
    <div className="App">
      <Header
        walletConnected={agoric.status.walletConnected}
        dappApproved={agoric.status.dappApproved}
      />
      <EnableAppDialog
        open={agoric.showApproveDappModal}
        handleClose={() =>
          agoricDispatch({
            type: 'SET_SHOW_APPROVE_DAPP_MODAL',
            payload: false,
          })
        }
      />
      <div style={mainContainer}>
        <div style={formContainer}>
          <Input name="name" textValue={name} inputHandler={handleName} />
          <Input name="url" textValue={url} inputHandler={handleUrl} />
          <button style={buttonStyle} onClick={handleSubmit}>
            Mint NFT
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
