import { Html, Head, Main, NextScript } from "next/document";

/**
 * Custom Document Component
 * Includes PWA meta tags optimized for iOS (iPhone 13 Pro Max)
 * Provides necessary viewport and theme configuration for mobile PWA
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google Fonts - Varela Round */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet" />
        
        {/* PWA Primary Color - Dark theme */}
        <meta name="theme-color" content="#000000" />
        
        {/* iOS PWA Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LeftAI" />
        
        {/* iOS Splash Screen - iPhone 13 Pro Max */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Viewport configuration for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
