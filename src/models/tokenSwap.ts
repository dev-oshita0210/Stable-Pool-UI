import { u64 } from "@solana/spl-token";
import { Numberu64 } from "@solana/spl-token-swap";
import { PublicKey, Account, TransactionInstruction, FeeCalculator, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import * as BufferLayout from "buffer-layout";

export { TokenSwap } from "@solana/spl-token-swap";

/**
 * Layout for a public key
 */
export const publicKey = (property: string = "publicKey"): Object => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property: string = "uint64"): Object => {
  return BufferLayout.blob(8, property);
};

export const TokenSwapLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    BufferLayout.u8('version'),
    BufferLayout.u8('isInitialized'),
    BufferLayout.u8('nonce'),
    publicKey('tokenProgramId'),
    publicKey('tokenAccountA'),
    publicKey('tokenAccountB'),
    publicKey('tokenPool'),
    publicKey('mintA'),
    publicKey('mintB'),
    BufferLayout.u8('curveType'),
    BufferLayout.blob(32, 'curveParameters'),
  ]
);

export const setGlobalStateInstruction = (
  programId: PublicKey,
  swapProgramId:PublicKey,
  owner:PublicKey,
  fee_owner:PublicKey,
  initial_supply:number,
  constant_product_return_fee_numerator:number,
  constant_product_fixed_fee_numerator:number,
  stable_return_fee_numerator:number,
  stable_fixed_fee_numerator:number,
  fee_denominator:number,
  decimal:number,
) : TransactionInstruction => {

  const keys = [
    { pubkey: programId, isSigner: false, isWritable: true},  // state info needs to be added
    { pubkey: owner, isSigner: false, isWritable: true},  // current info
    { pubkey: new PublicKey("11111111111111111111111111111111"),isSigner: false, isWritable: true},  // system info
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: true},  // rent info
  ];

  const configDataLayout = BufferLayout.struct([
    BufferLayout.u8("instruction"),
    BufferLayout.blob(32, "owner"),
    BufferLayout.blob(32, "feeOwner"),
    BufferLayout.nu64("initialSupply"),
    BufferLayout.u8("lpDecimal"),
    BufferLayout.nu64("constant_product_return_fee_numerator"),
    BufferLayout.nu64("constant_product_fixed_fee_numerator"),
    BufferLayout.nu64("stable_return_fee_numerator"),
    BufferLayout.nu64("stable_fixed_fee_numerator"),
    BufferLayout.nu64("fee_denominator")
  ]);

  let data = Buffer.alloc(1024);
  {
    const encodeLength = configDataLayout.encode({
        instruction:4,
        owner:owner.toBuffer(),
        feeOwner:fee_owner.toBuffer(),
        initialSupply:initial_supply,
        lpDecimal:decimal,
        constant_product_return_fee_numerator:constant_product_return_fee_numerator,
        constant_product_fixed_fee_numerator:constant_product_fixed_fee_numerator,
        stable_return_fee_numerator:stable_return_fee_numerator,
        stable_fixed_fee_numerator:stable_fixed_fee_numerator,
        fee_denominator:fee_denominator,
      },
      data
    );
    data = data.slice(0, encodeLength);
  }
  return new TransactionInstruction({ keys, programId: swapProgramId, data,});
}

export const createInitSwapInstruction = (
  global_state_key:PublicKey,
  tokenSwapAccount: Account,
  authority: PublicKey,
  tokenAccountA: PublicKey,
  tokenAccountB: PublicKey,
  tokenPool: PublicKey,
  tokenAccountPool: PublicKey,
  tokenProgramId: PublicKey,
  swapProgramId: PublicKey,
  nonce: number,
  curveType:number,
): TransactionInstruction => {
  const keys = [
    { pubkey: tokenSwapAccount.publicKey, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: global_state_key, isSigner: false, isWritable: false },
    { pubkey: tokenAccountA, isSigner: false, isWritable: false },
    { pubkey: tokenAccountB, isSigner: false, isWritable: false },
    { pubkey: tokenPool, isSigner: false, isWritable: true },
    { pubkey: tokenAccountPool, isSigner: false, isWritable: true },
    { pubkey: tokenProgramId, isSigner: false, isWritable: false },
  ];

  const commandDataLayout = BufferLayout.struct([
    BufferLayout.u8("instruction"),
    BufferLayout.u8("nonce"),
    BufferLayout.u8("curveType"),
    BufferLayout.blob(32, 'curveParameters'),
  ]);
  let data = Buffer.alloc(1024);
  {
    const encodeLength = commandDataLayout.encode({
        instruction: 0, 
        nonce, 
        curveType:curveType,
      },data
    );
    data = data.slice(0, encodeLength);
  }
  return new TransactionInstruction({ keys, programId: swapProgramId, data, });
};

export const depositInstruction = (
  global_state_key:PublicKey,
  tokenSwap: PublicKey,
  authority: PublicKey,
  userTransferAuthority: PublicKey,
  sourceA: PublicKey,
  sourceB: PublicKey,
  intoA: PublicKey,
  intoB: PublicKey,
  poolToken: PublicKey,
  poolAccount: PublicKey,
  swapProgramId: PublicKey,
  tokenProgramId: PublicKey,
  maximumTokenA: number | Numberu64,
  maximumTokenB: number | Numberu64,
  poolAmount: number | Numberu64,
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8("instruction"),
    uint64("poolTokenAmount"),
    uint64("maximumTokenA"),
    uint64("maximumTokenB"),
  ]);
  console.log(global_state_key.toBase58());
  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 2, // Deposit instruction
      poolTokenAmount: new Numberu64(poolAmount).toBuffer(),
      maximumTokenA: new Numberu64(maximumTokenA).toBuffer(),
      maximumTokenB: new Numberu64(maximumTokenB).toBuffer(),
    },
    data
  );

  const keys = [
    { pubkey: tokenSwap, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: global_state_key, isSigner: false, isWritable: false }, // state info needs to be added
    { pubkey: userTransferAuthority, isSigner: true, isWritable: false },
    { pubkey: sourceA, isSigner: false, isWritable: true },
    { pubkey: sourceB, isSigner: false, isWritable: true },
    { pubkey: intoA, isSigner: false, isWritable: true },
    { pubkey: intoB, isSigner: false, isWritable: true },
    { pubkey: poolToken, isSigner: false, isWritable: true },
    { pubkey: poolAccount, isSigner: false, isWritable: true },
    { pubkey: tokenProgramId, isSigner: false, isWritable: false },
  ];
  console.log(keys);
  return new TransactionInstruction({
    keys,
    programId: swapProgramId,
    data,
  });
};

export const withdrawInstruction = (
  global_state_key:PublicKey,
  tokenSwap: PublicKey,
  authority: PublicKey,
  poolMint: PublicKey,
  // feeAccount: PublicKey | undefined,
  sourcePoolAccount: PublicKey,
  fromA: PublicKey,
  fromB: PublicKey,
  userAccountA: PublicKey,
  userAccountB: PublicKey,
  swapProgramId: PublicKey,
  tokenProgramId: PublicKey,
  poolTokenAmount: number | Numberu64,
  minimumTokenA: number | Numberu64,
  minimumTokenB: number | Numberu64
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8("instruction"),
    uint64("poolTokenAmount"),
    uint64("minimumTokenA"),
    uint64("minimumTokenB"),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 3, // Withdraw instruction
      poolTokenAmount: new Numberu64(poolTokenAmount).toBuffer(),
      minimumTokenA: new Numberu64(minimumTokenA).toBuffer(),
      minimumTokenB: new Numberu64(minimumTokenB).toBuffer(),
    },
    data
  );

  const keys = [
    { pubkey: tokenSwap, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: global_state_key, isSigner: false, isWritable: false }, // state info needs to be added
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: poolMint, isSigner: false, isWritable: true },
    { pubkey: sourcePoolAccount, isSigner: false, isWritable: true },
    { pubkey: fromA, isSigner: false, isWritable: true },
    { pubkey: fromB, isSigner: false, isWritable: true },
    { pubkey: userAccountA, isSigner: false, isWritable: true },
    { pubkey: userAccountB, isSigner: false, isWritable: true },
    { pubkey: tokenProgramId, isSigner: false, isWritable: true },
  ];

  // if (feeAccount) {
  //   keys.push({ pubkey: feeAccount, isSigner: false, isWritable: true });
  // }
  // keys.push({ pubkey: tokenProgramId, isSigner: false, isWritable: false });

  return new TransactionInstruction({
    keys,
    programId: swapProgramId,
    data,
  });
};

export const swapInstruction = (
  global_state_key:PublicKey,
  tokenSwap: PublicKey,
  authority: PublicKey,
  userTransferAuthority: PublicKey,
  userSource: PublicKey,
  poolSource: PublicKey,
  poolDestination: PublicKey,
  userDestination: PublicKey,
  poolMint: PublicKey,
  // feeAccount: PublicKey,
  swapProgramId: PublicKey,
  tokenProgramId: PublicKey,
  amountIn: number | Numberu64,
  minimumAmountOut: number | Numberu64,
  programOwner?: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8("instruction"),
    uint64("amountIn"),
    uint64("minimumAmountOut"),
  ]);

  const keys = [
    { pubkey: tokenSwap, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: userTransferAuthority, isSigner: true, isWritable: false },
    { pubkey: global_state_key, isSigner: false, isWritable: false },  // state added
    { pubkey: userSource, isSigner: false, isWritable: true },
    { pubkey: poolSource, isSigner: false, isWritable: true },
    { pubkey: poolDestination, isSigner: false, isWritable: true },
    { pubkey: userDestination, isSigner: false, isWritable: true },
    { pubkey: poolMint, isSigner: false, isWritable: true },
    // { pubkey: feeAccount, isSigner: false, isWritable: true },
    { pubkey: tokenProgramId, isSigner: false, isWritable: false },
  ];

  // optional depending on the build of token-swap program
  if (programOwner) {
    keys.push({ pubkey: programOwner, isSigner: false, isWritable: true });
  }

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 1, // Swap instruction
      amountIn: new Numberu64(amountIn).toBuffer(),
      minimumAmountOut: new Numberu64(minimumAmountOut).toBuffer(),
    },
    data
  );

  return new TransactionInstruction({
    keys,
    programId: swapProgramId,
    data,
  });
};
