// @ts-check
import '@agoric/zoe/exported';

import { AssetKind, AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';

/**
 * This contract mints non-fungible tokens (NFTs)
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  // TODO: Create asset mint, issuer, and brand
  const nftMint = await zcf.makeZCFMint('COSMOVERSE22', AssetKind.SET);
  const { issuer: nftIssuer, brand: nftBrand } = nftMint.getIssuerRecord();

  // TODO: Create contract seat
  const { zcfSeat: contractSeat } = zcf.makeEmptySeatKit();

  const state = {
    count: 0,
    seat: contractSeat,
  };

  /**
   * Mints NFTs to a contract seat
   *
   * @param {object[]} nfts
   */
  const mintNftPrivate = async (nfts) => {
    const adjustedNfts = nfts.map((nft) => {
      return { ...nft, event: 'COSMOVERSE22' };
    });
    // TODO: define NFT amount
    const nftsAmount = AmountMath.make(nftBrand, harden(adjustedNfts));
    nftMint.mintGains({ Nft: nftsAmount }, state.seat);

    state.count += 1;
    return 'NFTs was minted successfully';
  };

  /**
   * Mints NFTs to user seat via mintGains
   *
   * @param {ZCFSeat} seat
   */
  const mintNftPublic = async (seat) => {
    const proposal = seat.getProposal();

    // @ts-ignore
    const nfts = proposal.want.Asset.value.map((nft) => {
      return { ...nft, event: 'COSMOVERSE22' };
    });

    // TODO: define NFT amount
    const nftsAmount = AmountMath.make(nftBrand, harden(nfts));
    nftMint.mintGains({ Nft: nftsAmount }, seat);

    seat.exit();
    state.count += 1;

    return 'NFT was minted successfully';
  };

  const creatorFacet = Far('NFT Creator Facet', {
    mintNftPrivate,
    getIssuer: () => nftIssuer,
  });
  const publicFacet = Far('NFT Public Facet', {
    makeMintInvitation: () =>
      zcf.makeInvitation(
        mintNftPublic,
        "Mints an NFT via mintGains based on the proposal's want",
      ),
    getIssuer: () => nftIssuer,
    getContractNfts: () => state.seat.getCurrentAllocation(),
  });

  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
