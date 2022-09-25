import React from 'react';

const nftContainer = {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignContent: 'flex-start',
};

const inputHeader = {
  height: '20px',
  marginBottom: '15px',
  alignSelf: 'flex-start',
  color: '#00FF5F',
  textTransform: 'uppercase',
};

const NFTCard = ({ nft }) => {
  return (
    <div style={nftContainer}>
      <h4 style={inputHeader}>{nft.name}:</h4>
      <img url={nft.url} />
    </div>
  );
};

export default NFTCard;
