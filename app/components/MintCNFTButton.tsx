"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUmi } from "../../lib/useUmi";
import { useState } from "react";
import {
  createMerkleTree,
  createCollectionNFT,
  mintMultipleCNFTs,
} from "../../lib/cnftUtils";
import VerificationLinks from "./VerificationLinks";
import { Signer } from "@metaplex-foundation/umi";

interface MintInfo {
  merkleTree: Signer;
  collectionNft: Signer;
  assetIds: string[];
}

export default function MintCNFTButton() {
  const { publicKey: walletPublicKey } = useWallet();
  const umi = useUmi();
  const [isMinting, setIsMinting] = useState(false);
  const [mintInfo, setMintInfo] = useState<MintInfo | null>(null);
  const [mintStatus, setMintStatus] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const addresses = content
          .split("\n")
          .filter((address) => address.trim() !== "");
        setRecipients(addresses);
        setMintStatus(`Loaded ${addresses.length} recipient addresses`);
      };
      reader.readAsText(file);
    }
  };

  const handleMint = async () => {
    if (!umi || !walletPublicKey || recipients.length === 0) return;
    setIsMinting(true);
    setMintStatus("Preparing to mint...");
    try {
      const merkleTree = await createMerkleTree(umi);
      setMintStatus("Merkle tree created. Creating collection NFT...");

      const collectionNft = await createCollectionNFT(umi);
      setMintStatus(
        "Collection NFT created. Minting cNFTs... This may take a while."
      );

      const assetIds = await mintMultipleCNFTs(
        umi,
        merkleTree,
        collectionNft,
        recipients
      );

      setMintInfo({
        merkleTree,
        collectionNft,
        assetIds,
      });
      setMintStatus(`${assetIds.length} cNFTs minted successfully!`);
    } catch (error) {
      console.error("Error minting cNFTs:", error);
      setMintStatus("Minting failed. Please try again.");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".txt"
          className="mb-2"
        />
        <button
          onClick={handleMint}
          disabled={isMinting || recipients.length === 0}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        >
          {isMinting ? "Minting..." : `Mint ${recipients.length} Dakshie cNFTs`}
        </button>
      </div>
      {mintStatus && (
        <div className="bg-gray-100 p-4 rounded text-black">
          <p className="font-semibold">Status:</p>
          <p>{mintStatus}</p>
        </div>
      )}
      {mintInfo && <VerificationLinks mintInfo={mintInfo} />}
    </div>
  );
}
