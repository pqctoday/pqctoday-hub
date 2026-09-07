---
generated: 2026-09-07
category: Technical Standards
document_count: 4
requirement_count: 14
---

## BIP-39
- **Source**: BIP-39: Mnemonic Code for Generating Deterministic Keys
- **URL**: https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039.mediawiki
- **Requirement count**: 2
- **Assurance / FIPS**:
    - _T2 Risk-Informed · keys_: Discourage use of non-English wordlists for generating mnemonic sentences.
    - _T3 Repeatable · software_: Compute checksum for mnemonic sentence using wordlist and issue warning if invalid.

## BIP-44
- **Source**: BIP-44: Multi-Account Hierarchy for Deterministic Wallets
- **URL**: https://raw.githubusercontent.com/bitcoin/bips/master/bip-0044.mediawiki
- **Requirement count**: 3
- **Inventory**:
    - _T3 Repeatable · keys_: Prevent creation of new accounts if the previous account lacks transaction history to ensure sequential key usage.
    - _T3 Repeatable · keys_: Discover all used accounts by scanning external chains when importing a seed from an external source.
- **Observability**:
    - _T3 Repeatable · keys_: Warn users when attempting to generate a new address that would exceed the defined gap limit on an external chain.

## BIS-Paper-158
- **Source**: BIS Paper 158 — Quantum-Readiness Roadmap for Financial Systems
- **URL**: https://www.bis.org/publ/bppdf/bispap158.pdf
- **Requirement count**: 2
- **Governance**:
    - _T2 Risk-Informed · all_: Implement robust governance structures to support the transition to quantum-safe cryptographic infrastructures.
- **Inventory**:
    - _T2 Risk-Informed · all_: Maintain comprehensive cryptographic inventories as a critical foundation for quantum-readiness.

## Ethereum-EIP4337-AA
- **Source**: EIP-4337: Account Abstraction Using Alt Mempool
- **URL**: https://eips.ethereum.org/EIPS/eip-4337
- **Requirement count**: 7
- **Assurance / FIPS**:
    - _T3 Repeatable · software_: Smart Contract Accounts must validate that the caller is a trusted EntryPoint contract before processing operations.
    - _T3 Repeatable · software_: Smart Contract Accounts must validate that the signature is a valid signature of the userOpHash.
    - _T3 Repeatable · software_: UserOperation signatures must depend on chainid and the EntryPoint address to prevent replay attacks.
    - _T3 Repeatable · software_: Smart Contract Accounts must pay the EntryPoint at least the missingAccountFunds to cover gas costs.
    - _T3 Repeatable · software_: The return value from validation must be packed with aggregator/authorizer, validUntil, and validAfter timestamps.
    - _T3 Repeatable · software_: If the factory address is 0x7702, the sender must be an EOA with an EIP-7702 authorization designation.
    - _T3 Repeatable · software_: For classic sequential nonce enforcement, the validation function must require the nonce to be less than the max uint64 value.
