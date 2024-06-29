import { useContext } from "react";
import { useAccount } from "wagmi";

export default function useAccountSiwe() {
  const account = useAccount();
  console.log(account.address)

  return account
}