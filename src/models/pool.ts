import { PublicKey } from "@solana/web3.js";
import { TokenAccount } from "./account";

export interface PoolInfo {
  pubkeys: {
    program: PublicKey;
    account: PublicKey;
    holdingAccounts: PublicKey[];
    holdingMints: PublicKey[];
    mint: PublicKey;
    feeAccount?: PublicKey;
  };
  legacy: boolean;
  raw: any;
}

export interface LiquidityComponent {
  amount: number;
  account?: TokenAccount;
  mintAddress: string;
}

export interface PoolConfig {
  constant_product_return_fee_numerator: number,
  constant_product_fixed_fee_numerator: number,
  stable_return_fee_numerator: number, 
  stable_fixed_fee_numerator: number,
  fee_denominator: number,
}
