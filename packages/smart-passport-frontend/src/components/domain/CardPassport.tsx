import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { useSmartPassport } from "../providers/smart-passport";
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useEASAttest } from "src/hooks/useEASAttest";

export function CardPassport() {
  const [smartPassport] = useSmartPassport();
  const stripe = useStripe();
  const elements = useElements();
  const attest = useEASAttest();

  const subscribe = async () => {
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_API_ENDPOINT + "/create-checkout-session"
      );

      const result = await stripe?.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result?.error) {
        console.error(result.error.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={
        "bg-white h-auto rounded-xl p-6 flex flex-col gap-5 text-[#101828] border border-[#D0D5DD]"
      }
    >
      <div className="flex flex-col items-center justify-center">
        <div className="text-xl">Gitcoin Passport</div>
        <div
          className="my-2 text-4xl"
          style={{
            color:
              smartPassport.gitcoinPassportScore >= 20 ? "darkgreen" : "red",
          }}
        >
          {smartPassport.gitcoinPassportScore}
        </div>

        {smartPassport.gitcoinPassportScore >= 20 ? (
          <div className="flex" style={{ color: "darkgreen" }}>
            <CheckCircleFilled className="mr-1" /> <div>Trusted</div>
          </div>
        ) : (
          <div className="flex" style={{ color: "red" }}>
            <CloseCircleFilled className="mr-1" /> <div>Not Trusted</div>
          </div>
        )}

        <hr className="border-dashed border-[#D0D5DD] my-4 w-full" />

        <div className="text-xl">Coinbase Verification</div>

        <div className="mt-2">
          {smartPassport.coinbaseVerification ? (
            <div className="flex" style={{ color: "darkgreen" }}>
              <CheckCircleFilled className="mr-1" />{" "}
              <div>
                Coinbase KYC Verified{" "}
                {smartPassport.coinbaseCountry
                  ? `[${smartPassport.coinbaseCountry}]`
                  : ""}
              </div>
            </div>
          ) : (
            <div className="flex" style={{ color: "red" }}>
              <CloseCircleFilled className="mr-1" /> <div>Not Verified</div>
            </div>
          )}
        </div>

        {(smartPassport.ens) && (
          <>
            <hr className="border-dashed border-[#D0D5DD] my-4 w-full" />

            <div className="text-xl">ENS Subscription</div>
            <div>6$ / Year</div>

            <div className="text-xs text-center mt-1 text-gray-600">
              ENS requires a payment of 5$ annually with an extra gas fee
              included
            </div>

            <div
              className="px-5 py-3 bg-[#0052FF] rounded-lg text-white text-lg hover:cursor-pointer hover:scale-105 mt-4 transition"
              onClick={() => subscribe()}
            >
              Subscribe with Stripe
            </div>

            <div
              className="px-5 py-3 bg-[#0052FF] rounded-lg text-white text-lg hover:cursor-pointer hover:scale-105 mt-3 transition"
              onClick={() => attest('ens-subscription', smartPassport.ens)}
            >
              Subscribe with Smart Wallet
            </div>
          </>
        )}
      </div>
    </div>
  );
}
