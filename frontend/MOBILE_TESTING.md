# Mobile PWA Testing Guide

## Testing on iPhone 13 Pro Max

### Local Development Testing

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Access from iPhone:**
   - Find your computer's local IP address: `ifconfig | grep inet`
   - On iPhone Safari, visit: `http://YOUR_IP:3000`

3. **Install as PWA:**
   - Tap the Share button in Safari
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add" in the top right
   - The app icon will appear on your home screen

### Features Implemented

✅ **Mobile-First Design**
- Optimized for iPhone 13 Pro Max (428 x 926px)
- Safe area insets for notch and home indicator
- Touch-optimized interactions

✅ **Chatbot Demo**
- Non-interactive example showing NL Transaction Engine
- Example transactions:
  - "Send 100 cUSD to my brother"
  - "Swap my CELO for the best price on Ubeswap"
- Intent breakdown with transaction details

✅ **PWA Features**
- Standalone mode (no browser UI)
- Dark theme optimized for OLED
- Fast loading with offline capability (when service worker added)
- iOS status bar integration

✅ **UI Components Used (shadcn)**
- Avatar (with fallback)
- Badge (for status indicators)
- Card (chat container)
- ScrollArea (message list)
- Button (existing)

### What You'll See

1. **Header Section:**
   - "Natural Language Transactions" title

2. **Chat Demo:**
   - Bot avatar with online indicator
   - User messages (right-aligned, blue)
   - Bot responses (left-aligned, dark gray)
   - Intent cards showing transaction details

3. **How It Works:**
   - 3-step process explanation
   - Mobile-optimized cards

4. **Navigation:**
   - Your existing Navbar with wallet connection

### Next Steps

To make this a fully functional app:

1. **Add real chat functionality:**
   - Connect to OpenAI/Claude API for NL processing
   - Implement actual transaction signing
   - Add WebSocket for real-time updates

2. **Celo Integration:**
   - Connect to Celo wallet (already have WalletProvider)
   - Implement actual transaction sending
   - Add Ubeswap routing

3. **Service Worker:**
   - Add for offline capability
   - Cache static assets
   - Background sync

### Icons Needed

For a complete PWA, create these icon files in `/public`:
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

Use your project logo/branding for these icons.

### Testing Checklist

- [ ] App loads properly on mobile
- [ ] Chat demo displays correctly
- [ ] Animations are smooth
- [ ] Text is readable at mobile sizes
- [ ] Touch targets are easy to tap
- [ ] Wallet connection button works
- [ ] App installs as PWA
- [ ] Notch/home indicator areas are handled correctly
- [ ] Scrolling feels natural

