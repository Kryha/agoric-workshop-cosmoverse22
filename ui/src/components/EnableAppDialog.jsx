import React from 'react';

import enableDappPng from '../assets/enable-dapp.png';

const EnableAppDialog = ({ open, handleClose }) => {
  if (!open) return <></>;
  return (
    <div>
      <h2>Enable the Dapp</h2>
      <div>
        <p id="alert-dialog-description">
          Before using the dapp, you must enable it. To enable the dapp, please
          open your wallet by using the `agoric open` command in your terminal.
          Then, under Dapps, enable CardStore.
          <img
            id="enable-dapp"
            src={enableDappPng}
            width="100%"
            alt="Enable dapp in wallet"
          />
        </p>
      </div>
      <div>
        <button onClick={handleClose} autoFocus>
          OK
        </button>
      </div>
    </div>
  );
};

export default EnableAppDialog;
