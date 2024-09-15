import WalletConnectButton from "./components/WalletConnectButton";
import MintCNFTButton from "./components/MintCNFTButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Solana cNFT Minter</h1>
      <WalletConnectButton />
      <MintCNFTButton />
    </main>
  );
}
