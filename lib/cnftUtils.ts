import {
  createTree,
  LeafSchema,
  mintToCollectionV1,
  parseLeafFromMintToCollectionV1Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  Umi,
  some,
  Signer,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { cNFTMetadata, collectionMetadata } from "./metadata";
import bs58 from "bs58";

export async function createMerkleTree(umi: Umi): Promise<Signer> {
  const merkleTree = generateSigner(umi);

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: 14,
    maxBufferSize: 64,
    public: false,
  });

  await builder.sendAndConfirm(umi);

  console.log("Merkle Tree created with address:", merkleTree.publicKey);
  return merkleTree;
}

export async function createCollectionNFT(umi: Umi): Promise<Signer> {
  console.log("Creating collection NFT...");
  const collectionNft = generateSigner(umi);
  console.log("Collection NFT created with address:", collectionNft.publicKey);

  const builder = await createNft(umi, {
    mint: collectionNft,
    name: collectionMetadata.name,
    symbol: collectionMetadata.symbol,
    uri: collectionMetadata.uri,
    sellerFeeBasisPoints: percentAmount(
      collectionMetadata.sellerFeeBasisPoints / 100,
      2
    ),
    isCollection: true,
  });

  await builder.sendAndConfirm(umi);

  console.log("Collection NFT created with address:", collectionNft.publicKey);
  return collectionNft;
}

function getSolanaExplorerUrl(
  signature: Uint8Array,
  cluster: string = "mainnet"
): string {
  const base58Signature = bs58.encode(signature);
  return `https://explorer.solana.com/tx/${base58Signature}?cluster=${cluster}`;
}

export async function mintCNFT(
  umi: Umi,
  merkleTree: Signer,
  collectionNft: Signer,
  leafOwner: string
): Promise<string> {
  const metadata = cNFTMetadata(publicKey(leafOwner));

  console.log("Minting cNFT...");
  console.log("Leaf Owner:", leafOwner);
  console.log("Merkle Tree:", merkleTree.publicKey.toString());
  console.log("Collection NFT:", collectionNft.publicKey.toString());

  const builder = await mintToCollectionV1(umi, {
    leafOwner: publicKey(leafOwner),
    merkleTree: merkleTree.publicKey,
    collectionMint: collectionNft.publicKey,
    metadata: {
      name: metadata.name,
      uri: metadata.uri,
      sellerFeeBasisPoints: 500,
      collection: some({ key: collectionNft.publicKey, verified: false }),
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          share: 100,
        },
      ],
    },
  });

  const result = await builder.sendAndConfirm(umi);
  console.log("Minting transaction result:", result);
  console.log(
    "Check minting transaction on Solana Explorer:",
    getSolanaExplorerUrl(result.signature)
  );

  const leaf = await parseLeafFromMintToCollectionV1Transaction(
    umi,
    result.signature
  );

  console.log("Leaf:", leaf.id);
  return leaf.id;
}

const INITIAL_BATCH_SIZE = 5;
const INITIAL_DELAY = 5000;
const MAX_RETRIES = 3;

export async function mintMultipleCNFTs(
  umi: Umi,
  merkleTree: Signer,
  collectionNft: Signer,
  recipients: string[]
): Promise<string[]> {
  const results: string[] = [];
  let batchSize = INITIAL_BATCH_SIZE;
  let delay = INITIAL_DELAY;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    let retries = 0;
    let batchResults: string[] = [];

    while (retries < MAX_RETRIES) {
      try {
        const batchPromises = batch.map((recipient) =>
          mintCNFT(umi, merkleTree, collectionNft, recipient)
        );
        batchResults = await Promise.all(batchPromises);
        break; // Success, exit retry loop
      } catch (error) {
        console.error(`Error minting batch (attempt ${retries + 1}):`, error);
        retries++;
        if (retries === MAX_RETRIES) {
          throw new Error(`Failed to mint batch after ${MAX_RETRIES} attempts`);
        }
        batchSize = Math.max(1, Math.floor(batchSize / 2));
        delay *= 2;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    results.push(...batchResults);
    console.log(
      `Minted ${batchResults.length} cNFTs. Total: ${results.length}/${recipients.length}`
    );

    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}
