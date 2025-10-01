import "@/styles/globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { NotificationProvider } from "@/components/notification-toast";
import { NotificationWatcher } from "@/components/notification-watcher";

/**
 * Main App Component
 * Wraps all pages with providers for Celo blockchain integration and notifications
 * NotificationWatcher polls for new notifications and displays them
 */
export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <NotificationProvider>
        <NotificationWatcher />
        <Component {...pageProps} />
      </NotificationProvider>
    </WalletProvider>
  );
}
