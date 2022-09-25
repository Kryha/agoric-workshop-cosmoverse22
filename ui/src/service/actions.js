import { E } from '@endo/eventual-send';
import { AmountMath } from '@agoric/ertp';

export const formOfferForNFT = (purses, nft) => ({
  want: {
    Asset: {
      pursePetname: purses.nft[0].pursePetname,
      value: nft,
    },
  },
  give: {
    Price: {
      pursePetname: purses.money[0].pursePetname,
      value: 10,
    },
  },
});

export const formOfferForCharacterAmount = (
  characterBrand,
  character,
  moneyBrand,
  price,
) => ({
  want: {
    Asset: AmountMath.make(characterBrand, [character]),
  },
  give: {
    Price: AmountMath.make(moneyBrand, price),
  },
});

export const mintNfts = async (service, nfts) => {
  const {
    agoric: { walletP },
    contracts: {
      nft: { publicFacet },
    },
    purses,
  } = service;
  if (
    !publicFacet ||
    !walletP ||
    !purses.money[0].pursePetname ||
    !purses.nft[0].pursePetname
  ) {
    console.error('Could not make bid for nft: undefined parameter');
    return;
  }

  const invitation = await E(publicFacet).makeMintInvitation();

  console.info('Invitation successful, sending to wallet for approval');

  const offerConfig = harden({
    id: `${Date.now()}`,
    invitation,
    proposalTemplate: {
      want: {
        Asset: {
          pursePetname:
            service.purses.nft[service.purses.nft.length - 1].pursePetname,
          value: nfts,
        },
      },
    },
    dappContext: true,
  });
  console.log(await E(walletP).addOffer(offerConfig));
};

// export const sellCharacter = async (service: AgoricState, character: CharacterBackend, price: bigint) => {
//   const {
//     contracts: {
//       characterBuilder: { publicFacet },
//     },
//     agoric: { walletP, board, zoe },
//     purses,
//   } = service;

//   if (!publicFacet) return;

//   const characterPurse = purses.character[purses.character.length - 1];
//   const moneyPurse = purses.money[purses.money.length - 1];

//   if (!characterPurse || !moneyPurse) return;

//   const sellAssetsInstallation = await E(board).getValue(dappConstants.SELL_ASSETS_INSTALLATION_BOARD_ID);
//   const characterIssuer = await E(publicFacet).getCharacterIssuer();
//   const { moneyIssuer } = await E(publicFacet).getConfig();

//   const issuerKeywordRecord = harden({
//     Items: characterIssuer,
//     Money: moneyIssuer,
//   });

//   const brandKeywordRecord = harden({
//     Items: characterPurse.brand,
//     Money: moneyPurse.brand,
//   });

//   const sellAssetsTerms = harden({
//     pricePerItem: { value: price, brand: moneyPurse.brand },
//     issuers: issuerKeywordRecord,
//     brands: brandKeywordRecord,
//   });

//   const {
//     creatorInvitation,
//     instance,
//     publicFacet: sellAssetsPublicFacet,
//   } = await E(zoe).startInstance(sellAssetsInstallation, issuerKeywordRecord, sellAssetsTerms);

//   await E(walletP).addOffer(
//     harden({
//       id: Date.now().toString(),
//       invitation: creatorInvitation,
//       proposalTemplate: {
//         want: {
//           Money: {
//             pursePetname: moneyPurse.pursePetname,
//             value: inter(price),
//           },
//         },
//         give: {
//           Items: {
//             pursePetname: characterPurse.pursePetname,
//             value: [character],
//           },
//         },
//         exit: { waived: null },
//       },
//       dappContext: true,
//     })
//   );

//   const characterInMarket = {
//     id: character.id,
//     character,
//     sell: { instance, publicFacet: sellAssetsPublicFacet, price },
//   };

//   return characterInMarket;
// };

// export const buyCharacter = async (service: AgoricState, characterInMarket: CharacterInMarketBackend) => {
//   const {
//     agoric: { walletP },
//     contracts: {
//       characterBuilder: { publicFacet },
//     },
//     purses,
//   } = service;

//   if (!publicFacet || !walletP) return;

//   const characterPurse = purses.character[purses.character.length - 1];
//   const moneyPurse = purses.money[purses.money.length - 1];

//   if (!characterPurse || !moneyPurse) return;

//   const { sell, character } = characterInMarket;

//   const invitation = await E(sell.publicFacet).makeBuyerInvitation();

//   await E(walletP).addOffer(
//     harden({
//       id: Date.now().toString(),
//       invitation,
//       proposalTemplate: {
//         want: {
//           Items: {
//             pursePetname: characterPurse.pursePetname,
//             value: [character],
//           },
//         },
//         give: {
//           Money: {
//             pursePetname: moneyPurse.pursePetname,
//             value: inter(sell.price),
//           },
//         },
//       },
//       dappContext: true,
//     })
//   );
// };
