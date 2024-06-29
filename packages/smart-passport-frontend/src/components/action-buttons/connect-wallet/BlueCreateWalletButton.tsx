import React, { useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { CoinbaseWalletLogo } from './CoinbaseWalletLogo';
import { addrParse } from 'src/utils/common';
 
const buttonStyles = {
  background: 'transparent',
  border: '1px solid transparent',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  fontSize: 18,
  backgroundColor: '#0052FF',
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 8,
  paddingBottom: 8,
  borderRadius: 10,
} as const;
 
export function BlueCreateWalletButton() {
  const { connectors, connect, data } = useConnect();
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
 
  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    );

    if (address && isConnected) {
      if (window.confirm('Disconnect Smart Wallet?')) {
        disconnect()
      }
    } else if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect, address, isConnected]);

  return (
    <button style={buttonStyles} onClick={createWallet}>
      <CoinbaseWalletLogo />
      <span className="pl-2">{address && isConnected ? addrParse(address) : "Connect Wallet"}</span>
    </button>
  );
}