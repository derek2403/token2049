"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

/**
 * Connect Button Component
 * Displays wallet connection button, but hides it when running in MiniPay
 * MiniPay auto-connects, so manual connect button is not needed
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

  return <RainbowKitConnectButton />;
}

