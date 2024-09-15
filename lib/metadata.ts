import { PublicKey } from "@metaplex-foundation/umi";

export const cNFTMetadata = (creatorPublicKey: PublicKey) => ({
  name: "Dakshie",
  symbol: "DUCK",
  uri: "https://gist.githubusercontent.com/Dksie09/de15513bdf5f9b01de828346d45914f5/raw/3838fbc35d1b03e1a1c91679618b3293327277dd/metadata.json",
  sellerFeeBasisPoints: 500, // This represents 5%
  creators: [{ address: creatorPublicKey, verified: true, share: 100 }],
  collection: {
    key: null as PublicKey | null,
    verified: false,
  },
});

export const collectionMetadata = {
  name: "Dakshie's cNFT Collection",
  symbol: "DUCKS",
  uri: "https://gist.githubusercontent.com/Dksie09/de15513bdf5f9b01de828346d45914f5/raw/3838fbc35d1b03e1a1c91679618b3293327277dd/collection-metadata.json",
  sellerFeeBasisPoints: 500, // This represents 5%
};
