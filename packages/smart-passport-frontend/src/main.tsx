import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import App from "./App.tsx";

import "@rainbow-me/rainbowkit/styles.css";

import "./index.css";
import "./preflight.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

import { WalletProvider as SuiWalletProvider } from "@suiet/wallet-kit";

import { ConfigProvider, theme } from "antd";
import { base, baseGoerli, baseSepolia, optimism, optimismGoerli } from "viem/chains";
import { AntdAlertProvider } from "./components/providers/antd-alert.tsx";
import { AptosProvider } from "./components/providers/aptos-adapter.tsx";
import PrimaryDomainProvider from "./components/providers/primary-domain.tsx";
import SocialOracleCallback from "./social-oracle-callback.tsx";
// import { SolanaProvider } from "./components/providers/solana-adapter.tsx";

import "./polyfills.ts";

import * as Sentry from "@sentry/react";
import ClaimDomain from "./pages/claim-domain.tsx";
import ExplorerPage from "./pages/explorer.tsx";
import { coinbaseWallet } from "wagmi/connectors";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({ appName: 'Create Wagmi', preference: 'smartWalletOnly' }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <ClaimDomain />,
  },
  {
    path: "/explorer",
    element: <ExplorerPage />,
  },
  {
    path: "/social-oracle-callback",
    element: <SocialOracleCallback />,
  },
  {
    path: "/claim",
    element: <ClaimDomain />,
  },
]);

Sentry.init({
  dsn: "https://242d0e9ee40b9cd9d1a3943b9664c7eb@o4505696313802752.ingest.sentry.io/4505696315441152",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "localhost",
        "127.0.0.1",
        /^https:\/\/social-oracle(.*)\.opti\.domains/,
      ],
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <AptosProvider>
              <SuiWalletProvider autoConnect={false}>
                {/* <SolanaProvider> */}
                <AntdAlertProvider>
                  <PrimaryDomainProvider>
                    <div id="app">
                      <Elements stripe={stripePromise}>
                        <RouterProvider router={router} />
                      </Elements>
                    </div>
                  </PrimaryDomainProvider>
                </AntdAlertProvider>
                {/* </SolanaProvider> */}
              </SuiWalletProvider>
            </AptosProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ConfigProvider>
  </React.StrictMode>
);
