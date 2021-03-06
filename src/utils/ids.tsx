import { PublicKey } from "@solana/web3.js";

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
let TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

let SWAP_PROGRAM_ID: PublicKey;
let SWAP_PROGRAM_LEGACY_IDS: PublicKey[];

export const SWAP_HOST_FEE_ADDRESS = process.env.REACT_APP_SWAP_HOST_FEE_ADDRESS
  ? new PublicKey(`${process.env.REACT_APP_SWAP_HOST_FEE_ADDRESS}`)
  // : 'undefined;
  : new PublicKey('611ao5XkdvZRCSjAqWdE1xc5CJj7ydJRQAgndANsHKCy')
export const SWAP_PROGRAM_OWNER_FEE_ADDRESS = new PublicKey(
  "HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN"
);

console.log(`Host address: ${SWAP_HOST_FEE_ADDRESS?.toBase58()}`);
console.log(`Owner address: ${SWAP_PROGRAM_OWNER_FEE_ADDRESS?.toBase58()}`);

// legacy pools are used to show users contributions in those pools to allow for withdrawals of funds
export const PROGRAM_IDS = [
  {
    name: "mainnet-beta",
    swap: () => ({
      current: new PublicKey("2E5cDaVrPPMp1a6Q7PNookgd48yUidJKgrf9as5ezWwF"),
      legacy: [],
    }),
  },
  {
    name: "testnet",
    swap: () => ({
      current: new PublicKey("2n2dsFSgmPcZ8jkmBZLGUM2nzuFqcBGQ3JEEj6RJJcEg"),
      legacy: [
        new PublicKey("9tdctNJuFsYZ6VrKfKEuwwbPp4SFdFw3jYBZU8QUtzeX"),
        new PublicKey("CrRvVBS4Hmj47TPU3cMukurpmCUYUrdHYxTQBxncBGqw"),
      ],
    }),
  },
  {
    name: "devnet",
    swap: () => ({  //5cFkDdCVEoy1QUjhjWKNBX8Ec6Cj6M6KvcSrHNLXeQ5Y, ELyuhy9GRwQkMw3oMACY6vT83JTkMPi2wbKUFgemiyTD
      current: new PublicKey("A99cuG4QD1yYtaXGSFHk2tZg2NMFpPAfa36182MiAUDh"),
      legacy: [],
    }),
  },
  {
    name: "localnet",
    swap: () => ({
      current: new PublicKey("HVCUKLWhYvkzuC2Zk24o1N4esdM9mfUJQp64sY32tEQj "), // 3hB2ZnB93TyrdmkuU4wp3hJD8EZUyaNiD6Dak7bbVMZB
      legacy: [],
    }),
  },
];

export const setProgramIds = (envName: string) => {
  let instance = PROGRAM_IDS.find((env) => env.name === envName);
  if (!instance) {
    return;
  }

  let swap = instance.swap();

  SWAP_PROGRAM_ID = swap.current;
  SWAP_PROGRAM_LEGACY_IDS = swap.legacy;
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
    swap: SWAP_PROGRAM_ID,
    swap_legacy: SWAP_PROGRAM_LEGACY_IDS,
  };
};
