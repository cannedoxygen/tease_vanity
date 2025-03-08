# Tardi Tease Vanity Generator

A web application that generates Sui blockchain addresses with custom prefixes or suffixes. Find memorable addresses like 0xbabe..., 0xcafe..., or 0xbeef...

## Project Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   pnpm install
   ```
3. Create a folder named `public` in your project root
4. Save the background image as `background-image.jpg` in the public folder

3. Start the development server:
   ```
   npm run dev
   ```
   or
   ```
   pnpm dev
   ```

4. Open your browser to `http://localhost:1234`

## Features

- Generate Sui blockchain addresses with custom prefixes or suffixes
- Real-time statistics on generation speed and total keypairs checked
- Background worker for non-blocking UI experience
- Modern UI with custom background and theme

## How It Works

1. The application generates Ed25519 keypairs in a Web Worker to avoid blocking the main UI thread
2. Each generated keypair's address is checked against the user-provided criteria (begins with/ends with)
3. When a match is found, the keypair's address and secret key are displayed
4. The Web Worker is periodically restarted to prevent memory issues

## Technical Details

- Built with React and Vite
- Uses TailwindCSS for styling
- Uses Web Workers for non-blocking address generation
- Integrates with @mysten/sui for Sui blockchain functionality