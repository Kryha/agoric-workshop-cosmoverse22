import React, { useState } from 'react';
import './App.css';
import { E } from '@endo/eventual-send';
import Header from './components/Header.jsx';
import EnableAppDialog from './components/EnableAppDialog.jsx';
import Input from './components/input.jsx';
import NFTCard from './components/NftCard.jsx';

import { useAgoricContext } from './service/agoric.js';
import { mintNfts } from './service/actions.js';
import {
  buttonStyle,
  formContainer,
  mainContainer,
  nftsContainer,
} from './app-styles.js';

function App() {
  const [agoric, agoricDispatch] = useAgoricContext();
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [showNftsSelect, setShowNftsSelect] = useState('My NFTs');

  const [contractNfts, setContractNfts] = useState([]);

  const handleName = (event) => {
    setName(event.currentTarget.value);
  };

  const handleUrl = (event) => {
    setUrl(event.currentTarget.value);
  };

  const handleSubmit = async () => {
    await mintNfts(agoric, [{ name, url }]);
  };

  const handleSelect = (e) => {
    setShowNftsSelect(e.target.value);
  };

  const getContrctNfts = async () => {
    const fetchedNfts = await E(
      agoric.contracts.nft.publicFacet,
    ).getContractNfts();
    setContractNfts(fetchedNfts.Nft.value);
  };

  return (
    <div className="App">
      <div
        style={{
          width: '100vw',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          style={{ ...buttonStyle, marginRight: '15px' }}
          onClick={getContrctNfts}
        >
          Get contract nfts
        </button>
      </div>
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
        <div>
          <select
            value={showNftsSelect}
            onChange={handleSelect}
            style={{ ...buttonStyle, width: '170px' }}
          >
            <option value="My NFTs">My NFTs</option>
            <option value="Contract NFTs">Contract NFTs</option>
          </select>
        </div>
        {showNftsSelect === 'My NFTs' ? (
          <div style={nftsContainer}>
            {agoric.purses.nft.length > 0
              ? agoric.purses.nft[0].currentAmount.value
                  .slice(0)
                  .reverse()
                  .map((nft) => {
                    return <NFTCard key={nft.id} nft={nft} />;
                  })
              : ''}
          </div>
        ) : (
          <div style={nftsContainer}>
            {contractNfts.length > 0
              ? contractNfts
                  .slice(0)
                  .reverse()
                  .map((nft, idx) => {
                    return <NFTCard key={idx} nft={nft} />;
                  })
              : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
