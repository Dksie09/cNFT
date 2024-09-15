import React from "react";
import { Signer } from "@metaplex-foundation/umi";

interface VerificationLinksProps {
  mintInfo: {
    merkleTree: Signer;
    collectionNft: Signer;
    assetId?: string;
  };
}

export default function VerificationLinks({
  mintInfo,
}: VerificationLinksProps) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold">Verification Links:</h3>
      <ul className="list-disc pl-5">
        <li>
          <a
            href={`https://explorer.solana.com/address/${mintInfo.merkleTree.publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Merkle Tree on Solana Explorer
          </a>
        </li>
        <li>
          <a
            href={`https://explorer.solana.com/address/${mintInfo.collectionNft.publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Collection NFT on Solana Explorer
          </a>
        </li>
        {mintInfo.assetId && (
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View cNFT Asset on Solana Explorer
            </a>
          </li>
        )}
        <li>
          <a
            href="https://gist.githubusercontent.com/Dksie09/de15513bdf5f9b01de828346d45914f5/raw/3838fbc35d1b03e1a1c91679618b3293327277dd/metadata.json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View NFT Metadata
          </a>
        </li>
      </ul>
      <p className="mt-4">
        Your cNFT has been minted successfully. Use the links above to verify
        the Merkle Tree, Collection NFT, and metadata associated with your cNFT.
      </p>
    </div>
  );
}
