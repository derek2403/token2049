import "@/styles/globals.css";
import { WalletProvider } from "@/components/wallet-provider";

/**
 * Main App Component
 * Wraps all pages with the WalletProvider for Celo blockchain integration
 */
export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
