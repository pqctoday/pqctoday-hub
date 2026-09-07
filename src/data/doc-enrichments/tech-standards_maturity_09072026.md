---
generated: 2026-09-07
category: Technical Standards
document_count: 3
requirement_count: 14
---

## FIPS 186-5
- **Source**: Digital Signature Standard (DSS)
- **URL**: https://csrc.nist.gov/pubs/fips/186-5/final
- **Requirement count**: 5
- **Assurance / FIPS**:
    - _T3 Repeatable · software_: Use only cryptographic modules and algorithms approved for protecting Federal Government-sensitive information.
    - _T3 Repeatable · software_: Ensure any module implementing digital signature capability is designed and built in a secure manner.
- **Governance**:
    - _T2 Risk-Informed · all_: Designate a responsible authority to ensure the overall implementation provides an acceptable level of security.
    - _T2 Risk-Informed · keys_: Restrict digital signature key pairs from being used for other purposes.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · keys_: Guard against the disclosure of private keys to maintain the security of the digital signature system.

## FIPS 205
- **Source**: Stateless Hash-Based Digital Signature Standard (SLH-DSA)
- **URL**: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf
- **Requirement count**: 5
- **Assurance / FIPS**:
    - _T3 Repeatable · software_: Ensure cryptographic modules implementing this standard are validated for conformance via the NIST validation program.
    - _T3 Repeatable · software_: Employ only cryptographic algorithms approved for protecting Federal Government-sensitive information in implementations.
- **Governance**:
    - _T2 Risk-Informed · keys_: Assign a responsible authority to ensure the overall implementation provides an acceptable level of security.
    - _T2 Risk-Informed · keys_: Prohibit the use of digital signature key pairs for purposes other than digital signatures.
    - _T2 Risk-Informed · keys_: Guard against the disclosure of private keys to maintain the security of the digital signature system.

## draft-ietf-tls-mlkem-07
- **Source**: ML-KEM Post-Quantum Key Agreement for TLS 1.3
- **URL**: https://datatracker.ietf.org/doc/draft-ietf-tls-mlkem/
- **Requirement count**: 4
- **Assurance / FIPS**:
    - _T3 Repeatable · libraries_: Use implementations resistant to side-channel attacks, particularly those applicable by remote attackers, as per NIST SP 800-227 guidelines.
    - _T3 Repeatable · software_: Follow RNG guidance from FIPS 203 and RFC 9846 to prevent disclosure of encapsulation randomness; consider RFC 8937 mechanisms for cross-session protection.
- **Governance**:
    - _T2 Risk-Informed · all_: Evaluate specific security, performance, and operational constraints to decide between standalone ML-KEM or hybrid construction deployment.
    - _T2 Risk-Informed · all_: Adhere to IETF guidance in the TLS Supported Groups registry regarding the recommended use of ML-KEM algorithms for general purposes.
