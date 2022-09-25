import React, { useState } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';
import Input from './components/input.jsx';
import { useAgoricContext } from './service/agoric.js';
import { mintNfts } from './service/actions.js';
import {
  buttonStyle,
  formContainer,
  imgStyle,
  mainContainer,
} from './app-styles';

function App() {
  const [agoric, agoricDispatch] = useAgoricContext();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  console.log(agoric.purses.nft[0].currentAmount.value[0].url);
  const handleName = (event) => {
    setName(event.currentTarget.value);
  };

  const handleUrl = (event) => {
    setUrl(event.currentTarget.value);
  };

  const handleSubmit = async () => {
    await mintNfts(agoric, [{ name, url }]);
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
      <div style={mainContainer}>
        <img
          style={imgStyle}
          src={agoric.purses.nft[0].currentAmount.value[0].url}
        />
      </div>
    </div>
  );
}

export default App;
