import React from 'react';

const Header = ({ walletConnected, dappApproved }) => {
  const walletStatus = walletConnected ? 'Connected' : 'Disconnected';
  const dappStatus = dappApproved ? 'Approved' : 'Not approved';
  const green = { color: '#00FF5F' };
  const red = { color: '#ff0007' };

  return (
    <div style={{ marginBottom: '40px' }}>
      <h1 style={green}>NFT DAPP</h1>

      <div style={walletConnected ? green : red}>Wallet {walletStatus}</div>
      <div style={dappApproved ? green : red}>Dapp {dappStatus}</div>
    </div>
  );
};

export default Header;
