// Fetch asset data from purses in the wallet
export const processPurses = async (purses, agoricDispatch, brandToCheck) => {
  // Load Purses
  const newMoneyPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandToCheck.money,
  );
  const newNftPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandToCheck.nft,
  );
  agoricDispatch({ type: 'SET_MONEY_PURSES', payload: newMoneyPurses });
  agoricDispatch({ type: 'SET_NFT_PURSES', payload: newNftPurses });

  // Load Characters
  const ownedNfts = newNftPurses.flatMap((purse) => {
    return purse.value;
  });

  console.info(
    '👛 Money purses found:',
    newMoneyPurses.map((purse) => purse.displayInfo),
  );
  console.info(
    '👛 NFT purses found:',
    newNftPurses.map((purse) => purse.displayInfo),
  );
  if (ownedNfts.length) {
    console.info(`📦 Found the following NFTs ${ownedNfts.length}`);
  }
};

export const processOffers = async (offers, agoricDispatch) => {
  if (!offers.length) return;
  agoricDispatch({ type: 'SET_OFFERS', payload: offers });
};
