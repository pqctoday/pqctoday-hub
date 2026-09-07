---
generated: 2026-09-07
category: Certification Schemes
document_count: 7
requirement_count: 45
---

## BSI-BSZ-METHOD
- **Source**: BSI BSZ — Accelerated Security Certification Evaluation Process (v2.1)
- **URL**: https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/BSZ/BSZ-Evaluation.pdf?__blob=publicationFile&v=5
- **Requirement count**: 7
- **Assurance / FIPS**:
    - _T3 Repeatable · all_: Conduct compliance and penetration tests during the evaluation phase and document results in an Evaluation Technical Report (ETR) submitted to the Certification Body.
    - _T3 Repeatable · all_: The Certification Body must critically evaluate results, strategies, and expert selection, and may reconstruct individual testing steps at random to verify findings.
- **Governance**:
    - _T3 Repeatable · all_: Establish formal contracts between manufacturers and ITSEFs, and between ITSEFs and the Certification Body, to define roles and responsibilities for the evaluation process.
    - _T3 Repeatable · all_: Formally evaluate the independence and impartiality of the ITSEF and the application content prior to proceeding with the certification process.
- **Inventory**:
    - _T3 Repeatable · all_: Compile and provide cryptographic documents and a Statement of Security (ST) to define the Target of Evaluation (TOE) scope and configuration.
- **Lifecycle / CLM**:
    - _T3 Repeatable · all_: For re-evaluations or recertifications, assess Impact Analysis Reports (IAR) to determine the scope of required testing and effort.
- **Observability**:
    - _T3 Repeatable · all_: Implement an Extended Follow-Up Evaluation process to assess change requirements, estimate effort, and verify updates to the TOE and documentation.

## COMMON-CRITERIA
- **Source**: Common Criteria for Information Technology Security Evaluation, CC:2022 Release 1, Part 1
- **URL**: https://www.commoncriteriaportal.org/files/ccfiles/CC2022PART1R1.pdf
- **Requirement count**: 5
- **Assurance / FIPS**:
    - _T3 Repeatable · all_: Conduct independent security evaluations of the TOE against a Security Target to establish confidence that security functionality and assurance measures meet specified requirements.
    - _T3 Repeatable · all_: Ensure evaluations adhere to strict conformance claims, prohibiting the evaluation scope from exceeding the defined conformance boundaries of the Protection Profile or Security Target.
- **Governance**:
    - _T2 Risk-Informed · all_: Establish documented Security Targets (STs) that define the security objectives and requirements for the TOE, serving as the formal basis for evaluation and conformance claims.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Manage the composition of assurance for composite products by defining composition models (layered, network, embedded) and re-using evaluation results where applicable.
- **Observability**:
    - _T2 Risk-Informed · all_: Document and verify evaluation results for PP, PP-Configuration, and ST/TOE evaluations to provide evidence of compliance and security posture.

## NIAP-CCEVS-MANUAL
- **Source**: NIAP CCEVS Quality Manual (Scheme Publication #2)
- **URL**: https://www.niap-ccevs.org/Documents_and_Guidance/ccevs/scheme-pub-2.pdf
- **Requirement count**: 8
- **Assurance / FIPS**:
    - _T3 Repeatable · all_: Administer Common Criteria Testing Laboratories (CCTLs) through accreditation, proficiency testing, and audit records.
    - _T3 Repeatable · certificates_: Conduct internal audits and management reviews to verify the quality and integrity of the validation process and records.
- **Governance**:
    - _T3 Repeatable · all_: Define and enforce roles and responsibilities for NIAP personnel, including the Quality Manager, to ensure scheme integrity.
    - _T3 Repeatable · certificates_: Maintain a Product Compliant List (PCL) to track validated products and their current certification status within the scheme.
    - _T3 Repeatable · certificates_: Monitor the use of certificates to ensure they are not misused or applied to non-compliant configurations.
    - _T3 Repeatable · certificates_: Establish procedures for the withdrawal of certificates when products no longer meet scheme requirements or compliance is violated.
- **Lifecycle / CLM**:
    - _T3 Repeatable · certificates_: Manage the lifecycle of certificates through defined processes for issuance, recognition of partner certificates, and maintenance.
- **Observability**:
    - _T3 Repeatable · certificates_: Maintain detailed records of certificate issuance, maintenance, and withdrawal to support audit trails and status verification.

## NIAP-CCEVS-POLICY
- **Source**: NIAP CCEVS Policy Letter 26
- **URL**: https://www.niap-ccevs.org/Documents_and_Guidance/ccevs/policy-ltr-26.pdf
- **Requirement count**: 3
- **Governance**:
    - _T2 Risk-Informed · all_: Establish policy to exclude products prohibited by statute or executive order from NIAP evaluation and certification for NSS use.
    - _T2 Risk-Informed · all_: Define authority for NIAP to refuse evaluation and certification of products subject to acquisition prohibitions for NSS.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Mandate vendor consultation with NIAP prior to contracting for evaluation if product may be affected by supply chain prohibitions.

## NIST-FIPS140-3-IG-PQC
- **Source**: Implementation Guidance for FIPS 140-3 and the Cryptographic Module Validation Program
- **URL**: https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/FIPS%20140-3%20IG.pdf
- **Requirement count**: 10
- **Assurance / FIPS**:
    - _T3 Repeatable · all_: Maintain validated cryptographic modules by tracking Component Validation List (CVL) status and ensuring conformance to FIPS 140-3 derived test requirements.
    - _T3 Repeatable · all_: Ensure entropy sources comply with SP 800-90B requirements for estimation and compliance to guarantee valid random number generation.
    - _T3 Repeatable · all_: Validate the use of non-approved security functions only if explicitly defined and justified within the module's security policy and documentation.
    - _T3 Repeatable · libraries_: Validate cryptographic algorithm implementations through the Cryptographic Algorithm Validation Program (CAVP) to ensure approved security functions.
- **Governance**:
    - _T2 Risk-Informed · all_: Define and document the security policy for the cryptographic module, including roles, services, and authentication mechanisms, as required for validation.
- **Inventory**:
    - _T3 Repeatable · all_: Track and maintain the Component Validation List (CVL) to identify all validated components and their status within the cryptographic module.
- **Lifecycle / CLM**:
    - _T3 Repeatable · all_: Manage Common Vulnerabilities and Exposures (CVEs) affecting validated cryptographic modules to maintain security posture throughout the module lifecycle.
- **Observability**:
    - _T3 Repeatable · all_: Implement error logging for self-tests to detect and record failures in cryptographic module operations and integrity checks.
    - _T3 Repeatable · all_: Execute periodic self-tests to continuously verify the operational integrity of cryptographic algorithms and module health.
    - _T3 Repeatable · all_: Implement an Approved Security Service Indicator to signal the operational status and validity of cryptographic services provided by the module.

## NIST-SP-800-90A-R1
- **Source**: SP 800-90A Rev. 1: Recommendation for Random Number Generation Using Deterministic Random Bit Generators
- **URL**: https://csrc.nist.gov/pubs/sp/800/90/a/r1/final
- **Requirement count**: 8
- **Assurance / FIPS**:
    - _T3 Repeatable · libraries_: Validate DRBG implementations against NIST SP 800-90A specifications to ensure conformance with deterministic random bit generation standards.
    - _T3 Repeatable · libraries_: Perform implementation validation testing to verify that the DRBG mechanism functions correctly according to the specified algorithm.
    - _T3 Repeatable · libraries_: Ensure entropy input meets minimum entropy requirements for seed construction to guarantee cryptographic security strength.
- **Lifecycle / CLM**:
    - _T3 Repeatable · libraries_: Enforce reseed operations at the end of the seedlife to maintain the security strength of the DRBG instantiation.
    - _T3 Repeatable · libraries_: Remove DRBG instantiations securely when no longer needed to prevent state compromise.
- **Observability**:
    - _T3 Repeatable · libraries_: Implement health tests for Instantiate, Generate, Reseed, and Uninstantiate functions to detect failures in random number generation.
    - _T3 Repeatable · libraries_: Conduct known answer testing as part of health testing to ensure the DRBG produces expected outputs for specific inputs.
    - _T3 Repeatable · libraries_: Handle errors encountered during health testing by ceeding operation and alerting administrators to potential RNG failure.

## NIST-SP-800-90C
- **Source**: SP 800-90C: Recommendation for Random Bit Generator (RBG) Constructions
- **URL**: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90C.pdf
- **Requirement count**: 4
- **Assurance / FIPS**:
    - _T3 Repeatable · libraries_: Validate RBG constructions against SP 800-90C via CMVP/CAVP to prove compliance with approved DRBG and entropy source requirements.
- **Governance**:
    - _T2 Risk-Informed · all_: Adhere to 'must' requirements for system administrators regarding RBG deployment, verified via documentation review by CMVP.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · libraries_: Ensure RBG constructions use validated randomness sources (SP 800-90B or SP 800-90C compliant) for initialization and reseeding.
- **Observability**:
    - _T3 Repeatable · libraries_: Implement and monitor health tests for RBG constructions to detect failures in entropy sources or DRBG operations as specified in Section 8.
