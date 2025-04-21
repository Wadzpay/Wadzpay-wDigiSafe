
# Algorand Web Wallet

A secure web-based wallet application for managing Algorand blockchain assets, viewing transaction history, and sending tokens.

## Features

- **User Authentication** - Secure email/password authentication
- **Wallet Management** - Generate and recover Algorand wallets using mnemonics
- **Asset Tracking** - View and manage your Algorand assets
- **Transaction History** - Browse transaction history with filtering options
- **Token Transfers** - Send Algorand tokens to other addresses
- **Real-time Updates** - Get live balance updates via WebSocket
- **Secure Storage** - Encrypted storage of private keys
- **Mnemonic Backup** - Backup wallet with 25-word recovery phrase
- **Admin Dashboard** - Administrative interface with wallet analytics

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Blockchain**: Algorand via Tatum API
- **Build Tool**: Vite

## Prerequisites

- Node.js v18+ and npm
- Supabase account (free tier works)
- Tatum API key (for Algorand blockchain interactions)

## Getting Started

### 1. Clone Repository

```sh
git clone <YOUR_REPOSITORY_URL>
cd algorand-web-wallet
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)
2. Note your Supabase URL and anon key from the API settings
3. Run the database setup SQL scripts from the `supabase/functions` directory:
   - Create customers table
   - Create wallets table
   - Set up RLS policies
   - Create required database functions

### 4. Configure Supabase Edge Functions

1. Install the Supabase CLI
2. Deploy the Algorand edge function:
   ```sh
   supabase functions deploy algorand
   ```
3. Set up required secrets:
   ```sh
   supabase secrets set TATUM_API_KEY=your_tatum_api_key
   ```

### 5. Get Tatum API Key

1. Register at [https://tatum.io/](https://tatum.io/)
2. Create an API key from your dashboard
3. Add this key to your Supabase edge function secrets as shown above

### 6. Environment Configuration

The Supabase client setup is pre-configured in `src/integrations/supabase/client.ts`. No additional configuration is needed for the frontend to connect to Supabase.

### 7. Run Locally

```sh
npm run dev
```

The application will be available at http://localhost:8080

## User Flow

1. **Registration/Login** - User registers or logs in with email and password
2. **Wallet Creation** - First-time users get a new Algorand wallet automatically
3. **Mnemonic Backup** - User must backup their wallet mnemonic after registration
4. **Dashboard** - User can view balance and recent transactions
5. **Send** - User can send Algorand tokens to other addresses
6. **Transactions** - User can view detailed transaction history
7. **Admin Area** - Administrators can access the admin dashboard via `/admin/login`

## Admin Features

The administrative dashboard provides these capabilities:

- **Customer Overview** - View all customers with active wallets
- **Transaction Analytics** - Monitor deposit and withdrawal activities
- **Real-time Updates** - Refresh data on demand
- **Wallet Monitoring** - Track customer wallets and balances

## Deployment

### Build for Production

```sh
npm run build
```

### Deploy Options

1. **Netlify**:
   - Install Netlify CLI: `npm install -g netlify-cli`
   - Deploy: `netlify deploy --prod --dir=dist`

2. **Vercel**:
   - Install Vercel CLI: `npm install -g vercel`
   - Deploy: `vercel --prod`

3. **GitHub Pages**:
   - Configure `vite.config.ts` for your repository
   - Push to GitHub and enable GitHub Pages

### Custom Domain Setup

1. Purchase a domain from a registrar (Namecheap, GoDaddy, etc.)
2. Configure DNS settings according to your hosting provider's instructions
3. Set up SSL certificates (most hosting providers handle this automatically)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
