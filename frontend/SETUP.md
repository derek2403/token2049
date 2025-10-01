# LeftAI - Celo Integration Setup

## Environment Configuration

You need to create a `.env.local` file in the frontend directory with the following content:

```bash
# WalletConnect Project ID
# Get your project ID from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id_here
```

## Getting a WalletConnect Project ID

1. Visit https://cloud.walletconnect.com/
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID
5. Paste it into your `.env.local` file

## Features Integrated from celominiapp

### 1. **Wallet Provider** (`components/wallet-provider.js`)
   - Configures Wagmi with Celo networks (mainnet and Alfajores testnet)
   - Sets up RainbowKit for wallet connection UI
   - Auto-connects when running in MiniPay wallet

### 2. **Connect Button** (`components/connect-button.js`)
   - Displays wallet connection button
   - Hides automatically when running in MiniPay (which auto-connects)

### 3. **Navbar** (`components/navbar.js`)
   - Sticky navigation bar with wallet integration
   - Responsive mobile menu
   - Navigation links for Home and Chat

### 4. **UI Components**
   - `button.js` - Reusable button component with multiple variants
   - `card.js` - Card container for displaying grouped content
   - `sheet.js` - Slide-in panel for mobile menu

## Running the App

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

## Testing the Integration

1. **Without Wallet**: The app will display normally with a "Connect Wallet" button in the navbar
2. **With Wallet Connected**: 
   - The navbar shows your wallet address
   - The home page displays your token balances
   - You can disconnect/switch wallets

## Celo Networks

- **Mainnet (Celo)**: Production network
- **Alfajores**: Testnet for development

The app supports both networks automatically.

