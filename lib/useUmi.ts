import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export function useUmi() {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  return useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    return createUmi(
      "https://mainnet.helius-rpc.com/?api-key=ef46a551-cbc3-433d-a20a-a80f19984ddb"
    )
      .use(
        walletAdapterIdentity({
          publicKey,
          signTransaction,
          signAllTransactions,
        })
      )
      .use(mplBubblegum())
      .use(mplTokenMetadata());
  }, [publicKey, signTransaction, signAllTransactions]);
}
