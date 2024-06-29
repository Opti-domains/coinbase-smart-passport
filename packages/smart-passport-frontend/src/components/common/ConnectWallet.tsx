import { ConnectButton } from "@rainbow-me/rainbowkit";
import { BlueCreateWalletButton } from "../action-buttons/connect-wallet/BlueCreateWalletButton";

export const ConnectWallet = () => {
  return (
    <div className="items-center space-x-4 inline-flex connect-button">
      {/* <ConnectButton
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
      /> */}
      
      <BlueCreateWalletButton></BlueCreateWalletButton>
    </div>
  );
};
