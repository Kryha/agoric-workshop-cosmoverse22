// @ts-check
/* global process */

// Agoric Dapp api deployment script

import fs from 'fs';
import { E } from '@endo/eventual-send';
import '@agoric/zoe/exported.js';
import { AmountMath } from '@agoric/ertp';

import installationConstants from '../ui/src/conf/installationConstants.js';

import { nfts } from './nfts.js';

const PRICE_PER_CARD_IN_MONEY_UNITS = 1n;

// deploy.js runs in an ephemeral Node.js outside of swingset. The
// spawner runs within ag-solo, so is persistent.  Once the deploy.js
// script ends, connections to any of its objects are severed.

/**
 * @typedef {object} DeployPowers The special powers that `agoric deploy` gives us
 * @property {(path: string) => Promise<{ moduleFormat: string, source: string }>} bundleSource
 * @property {(path: string) => string} pathResolve
 * @property {(path: string, opts?: any) => Promise<any>} installUnsafePlugin
 * @typedef {object} Board
 * @property {(id: string) => any} getValue
 * @property {(value: any) => string} getId
 * @property {(value: any) => boolean} has
 * @property {() => [string]} ids
 */

const API_PORT = process.env.API_PORT || '8000';

/**
 * @typedef {{ zoe: ZoeService, board: Board, spawner, wallet,
 * uploads, http, agoricNames, chainTimerService }} Home
 * @param {Promise<Home>} homePromise
 * A promise for the references available from REPL home
 * @param {DeployPowers} powers
 */
export default async function deployApi(
  homePromise,
  { bundleSource, pathResolve },
) {
  // Let's wait for the promise to resolve.
  const home = await homePromise;

  // Unpack the references.
  const {
    // *** ON-CHAIN REFERENCES ***
    chainTimerService: chainTimerServiceP,

    // Zoe lives on-chain and is shared by everyone who has access to
    // the chain. In this demo, that's just you, but on our testnet,
    // everyone has access to the same Zoe.
    zoe,

    // The board is an on-chain object that is used to make private
    // on-chain objects public to everyone else on-chain. These
    // objects get assigned a unique string id. Given the id, other
    // people can access the object through the board. Ids and values
    // have a one-to-one bidirectional mapping. If a value is added a
    // second time, the original id is just returned.
    board,
  } = home;

  // To get the backend of our dapp up and running, first we need to
  // grab the installation that our contract deploy script put
  // in the public board.
  const { INSTALLATION_BOARD_ID, CONTRACT_NAME } = installationConstants;
  const installation = await E(board).getValue(INSTALLATION_BOARD_ID);

  // Second, we can use the installation to create a new instance of
  // our contract code on Zoe. A contract instance is a running
  // program that can take offers through Zoe. Making an instance will
  // give us a `creatorFacet` that will let us make invitations we can
  // send to users.

  const {
    creatorFacet: nftCreatorFacet,
    publicFacet: nftPublicFacet,
    instance,
  } = await E(zoe).startInstance(installation);

  /**
   * @type {ERef<Issuer>}
   */
  const moneyIssuerP = E(home.agoricNames).lookup('issuer', 'RUN');

  const moneyBrandP = E(moneyIssuerP).getBrand();
  const [moneyIssuer, moneyBrand, { decimalPlaces = 0 }] = await Promise.all([
    moneyIssuerP,
    moneyBrandP,
    E(moneyBrandP).getDisplayInfo(),
  ]);

  console.log('- SUCCESS! contract instance is running on Zoe');

  console.log('Retrieving Board IDs for issuers and brands');
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const invitationBrandP = E(invitationIssuerP).getBrand();

  const nftIssuerP = E(nftPublicFacet).getIssuer();
  const mint = E(nftCreatorFacet).mintNftPrivate(nfts);
  console.log(mint);

  const [nftIssuer, nftBrand, invitationIssuer, invitationBrand] =
    await Promise.all([
      nftIssuerP,
      E(nftIssuerP).getBrand(),
      invitationIssuerP,
      invitationBrandP,
    ]);

  const [
    INSTANCE_BOARD_ID,
    NFT_ISSUER_BOARD_ID,
    NFT_BRAND_BOARD_ID,
    MONEY_BRAND_BOARD_ID,
    MONEY_ISSUER_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
  ] = await Promise.all([
    E(board).getId(instance),
    E(board).getId(nftIssuer),
    E(board).getId(nftBrand),
    E(board).getId(moneyBrand),
    E(board).getId(moneyIssuer),
    E(board).getId(invitationBrand),
  ]);

  console.log(`-- Contract Name: ${CONTRACT_NAME}`);
  console.log(`-- INSTANCE_BOARD_ID: ${INSTANCE_BOARD_ID}`);
  console.log(`-- NFT_ISSUER_BOARD_ID: ${NFT_ISSUER_BOARD_ID}`);
  console.log(`-- NFT: ${NFT_BRAND_BOARD_ID}`);

  const API_URL = process.env.API_URL || `http://127.0.0.1:${API_PORT || 8000}`;

  // Re-save the constants somewhere where the UI and api can find it.
  const dappConstants = {
    INSTANCE_BOARD_ID,
    INSTALLATION_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
    BRIDGE_URL: 'agoric-lookup:https://local.agoric.com?append=/bridge',
    brandBoardIds: {
      Nft: NFT_BRAND_BOARD_ID,
      Money: MONEY_BRAND_BOARD_ID,
    },
    issuerBoardIds: {
      Nft: NFT_ISSUER_BOARD_ID,
      Money: MONEY_ISSUER_BOARD_ID,
    },
    // minBidPerCard: Number(moneyValue),
    API_URL,
    CONTRACT_NAME,
  };
  const defaultsFile = pathResolve(`../ui/src/conf/defaults.js`);
  console.log('writing', defaultsFile);
  const defaultsContents = `\
// GENERATED FROM ${pathResolve('./deployAsset.js')}
export default ${JSON.stringify(dappConstants, undefined, 2)};
`;
  await fs.promises.writeFile(defaultsFile, defaultsContents);
}
