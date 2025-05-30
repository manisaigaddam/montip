# Farcaster TipBot MiniApp

A modern, user-friendly web application for the Farcaster TipBot ecosystem. Built with Next.js, TypeScript, and Tailwind CSS, this miniapp provides an intuitive interface for managing your Monad Testnet wallet and tokens.

## Features

- 💼 Wallet Management
  - Create Smart wallet and manage your Monad Testnet wallet
  - View token balances
  - Deposit and withdraw tokens
- 🔔 Real-time notifications
- 🔗 Seamless Farcaster integration
- 📱 Mobile-first approach

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Farcaster SDK
- Wagmi (Web3 Integration)
- Viem (Ethereum Library)
- Alchemy API for token balances

## Prerequisites

- Node.js 18+
- Yarn or npm
- Farcaster Account
- Web3 wallet (MetaMask, etc.)

## Installation

1. Navigate to the miniapp directory:
```bash
cd montip
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Set up environment variables:

Create a `.env` file with:
```
NEXT_PUBLIC_FACTORY_ADDRESS=your_factory_contract_address
NEXT_PUBLIC_RPC_URL=your_monad_testnet_rpc_url
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_for_deploying_smart_wallets
ALCHEMY_KEY=your_alchemy_key
OWNER_PRIVATE_KEY=your_owner_private_key_for_witdhraw_user_funds
OWNER_ADDRESS=your_owner_address_for_withdraws
```

## Development

1. Start the development server:
```bash
yarn dev
# or
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
miniapp/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── Home/        # Main wallet interface
│   └── HelpButton/  # Help and support component
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and ABIs
├── public/          # Static assets
├── types/           # TypeScript type definitions
├── .next/           # Next.js build output
└── node_modules/    # Dependencies
```

## Key Features

### Wallet Management
- Create and manage your Monad Testnet wallet
- View token balances in real-time
- Deposit tokens to your wallet
- Withdraw tokens to external addresses
- Support for multiple tokens including:
  - MON (Native token)
  - USDC, USDT
  - Various community tokens (BEAN, BMONAD, CHOG, etc.)
  - Wrapped tokens (WBTC, WETH, WSOL)

### User Experience
- Responsive design
- Intuitive navigation
- Real-time balance updates
- Transaction status tracking
- Error handling and notifications

## Building for Production

```bash
yarn build
# or
npm run build
```

## Deployment

The app can be deployed to various platforms:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Custom server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## Support

For support, please:
- Open an issue in the repository

## Roadmap

- [ ] Enhanced analytics
- [ ] Additional social features
- [ ] Advanced tipping options
- [ ] Events for tips
