"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Custom Connect Button Component
 * Styled to match app theme with gradient effects and dark mode
 * Hides when running in MiniPay (auto-connects)
 */
export function ConnectButton() {
  const [isMinipay, setIsMinipay] = useState(false);

  useEffect(() => {
    // Check if running inside MiniPay wallet
    if (typeof window !== "undefined" && window.ethereum?.isMiniPay) {
      setIsMinipay(true);
    }
  }, []);

  // Don't show connect button in MiniPay (it auto-connects)
  if (isMinipay) {
    return null;
  }

  return (
    <RainbowKitConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Wait for mount and auth to complete
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              // Not connected - show connect button with gradient
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 text-neutral-100 border border-neutral-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              // Wrong network - show warning
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    className="bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/50"
                  >
                    Wrong Network
                  </Button>
                );
              }

              // Connected - show account info with gradient
              return (
                <div className="flex items-center gap-2">
                  {/* Chain selector button */}
                  <Button
                    onClick={openChainModal}
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex items-center gap-2 bg-neutral-900/50 hover:bg-neutral-800/50 text-neutral-300 border border-neutral-800/50 backdrop-blur-sm"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-4 h-4 rounded-full overflow-hidden"
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-sm">{chain.name}</span>
                  </Button>

                  {/* Account button with gradient */}
                  <Button
                    onClick={openAccountModal}
                    className="bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 text-neutral-100 border border-neutral-700/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                      {account.displayName}
                    </span>
                    {account.displayBalance && (
                      <span className="ml-2 text-neutral-400 text-sm hidden md:inline">
                        {account.displayBalance}
                      </span>
                    )}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}

