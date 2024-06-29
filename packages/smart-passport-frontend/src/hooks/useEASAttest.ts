import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { useEthersSigner } from "./useEthersSigner";
import { useCallback } from "react";
import { useAccount } from "wagmi";

export function useEASAttest() {
  const { address } = useAccount()
  const signer = useEthersSigner()

  const attest = useCallback(async (key: string, value: string) => {
    if (signer && address) {
      const eas = new EAS('0x4200000000000000000000000000000000000021');
      eas.connect(signer);
      
      // Initialize SchemaEncoder with the schema string
      const schemaEncoder = new SchemaEncoder("string smartPassportType, string smartPassportTarget");
      const encodedData = schemaEncoder.encodeData([
        { name: "smartPassportType", value: key, type: "string" },
        { name: "smartPassportTarget", value: value, type: "string" },
      ]);
      
      const schemaUID = "0x9bdc243f53074570900f7d6b6240389b0b4aff7ab73ac206622b88ea3defd6d8";
      
      const tx = await eas.attest({
        schema: schemaUID,
        data: {
          recipient: address,
          expirationTime: 0n,
          revocable: true, // Be aware that if your schema is not revocable, this MUST be false
          data: encodedData,
        },
      });
      
      const newAttestationUID = await tx.wait();
  
      return newAttestationUID
    }
  }, [signer, address])

  return attest
}