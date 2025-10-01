import "@/styles/globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { NotificationProvider } from "@/components/notification-toast";

/**
 * Main App Component
 * Wraps all pages with providers for Celo blockchain integration and notifications
 */
export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </WalletProvider>
  );
}
