// @ts-check
import '@agoric/zoe/exported';

import { AssetKind, AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';

/**
 * This contract mints non-fungible tokens (Nft) and creates a contract
 * instance to auction the Nft in exchange for some sort of money.
 *
 * @type {ContractStartFn}
 */
const start = async (zcf) => {
  const nftMint = await zcf.makeZCFMint('COSMOVERSE22', AssetKind.SET);
  const { issuer: nftIssuer, brand: nftBrand } = nftMint.getIssuerRecord();
  const { zcfSeat: contractSeat } = zcf.makeEmptySeatKit();

  const state = {
    count: 0,
    seat: contractSeat,
  };

  /**
   * Mints NFTs
   *
   * @param {object} nfts
   */
  const mintNftPrivate = async (nfts) => {
    state.count += 1;
    const nftsAmount = AmountMath.make(nftBrand, harden(nfts));
    nftMint.mintGains({ Nft: nftsAmount }, state.seat);
    return 'NFTs was minted successfully';
  };

  /**
   * Mints NFTs via mintGains
   *
   * @param {ZCFSeat} seat
   */
  const mintNftPublic = async (seat) => {
    const proposal = seat.getProposal();

    // @ts-ignore
    const nfts = proposal.want.Asset.value.map((nft) => {
      const id = state.count;
      return { ...nft, id };
    });

    state.count += 1;
    const nftsAmount = AmountMath.make(nftBrand, harden(nfts));
    nftMint.mintGains({ Nft: nftsAmount }, seat);

    seat.exit();

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
    getContractNfts: () => contractSeat.getCurrentAllocation(),
  });

  return harden({ creatorFacet, publicFacet });
};

harden(start);
export { start };
