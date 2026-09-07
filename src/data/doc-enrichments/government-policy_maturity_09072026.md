---
generated: 2026-09-07
category: Compliance Frameworks
document_count: 7
requirement_count: 63
---

## DoD-CIO-PQC-Memo-2025
- **Source**: DoD CIO Memorandum — Preparing for Migration to Post Quantum Cryptography
- **URL**: https://dodcio.defense.gov/Portals/0/Documents/Library/PreparingForMigrationPQC.pdf
- **Requirement count**: 11
- **Assurance / FIPS**:
    - _T3 Repeatable · all_: Do not use Quantum Confidentiality or Keying Technologies (e.g., QKD) for confidentiality, authenticity, or integrity unless an exception is granted.
- **Governance**:
    - _T3 Repeatable · all_: Identify and report PQC migration leads for every Component and subordinate organization within 20 days, maintaining annual updated lists.
    - _T3 Repeatable · all_: Submit test plans, results, and risk mitigations to DoD CIO PQC Directorate immediately for review before any PQC engagement or acquisition.
    - _T3 Repeatable · all_: Obtain cryptographic intake approval from DoD CIO PQC Director before testing, evaluating, piloting, or acquiring any PQC-related technology.
    - _T3 Repeatable · all_: Obtain cryptographic deployment approval from DoD CIO PQC Director before deploying any PQC-enabling or PQC-related technology.
    - _T3 Repeatable · all_: Immediately cease tests, pilots, or use of PQC technology if security issues are identified by the DoD CIO PQC Director.
- **Inventory**:
    - _T3 Repeatable · all_: Identify, inventory, and report all cryptography used in any DoD information system, regardless of classification, location, or type.
- **Lifecycle / CLM**:
    - _T3 Repeatable · keys_: Phase out and replace cryptographic pre-shared keys (PSK) not provisioned through NSA KMI with NIST-approved asymmetric PQC algorithms by Dec 31, 2030.
    - _T3 Repeatable · keys_: Phase out and replace symmetric key establishment, agreement, and distribution protocols by Dec 31, 2030 (or 2031 for NSA CSfC registered solutions).
    - _T3 Repeatable · software_: Do not test, pilot, use, or procure commercial PSK-based solutions for quantum resistance effective immediately.
    - _T3 Repeatable · software_: Do not test, pilot, use, or procure commercial symmetric key establishment, agreement, or distribution protocols for quantum resistance effective immediately.

## ETSI-EN-319-411
- **Source**: ETSI EN 319 411-1 V1.5.1 (2025-04)
- **URL**: https://www.etsi.org/deliver/etsi_en/319400_319499/31941101/01.05.01_60/en_31941101v010501p.pdf
- **Requirement count**: 10
- **Assurance / FIPS**:
    - _T3 Repeatable · certificates_: Undergo regular compliance audits and assessments to verify adherence to the CPS, CP, and relevant standards.
- **Governance**:
    - _T3 Repeatable · all_: Define and enforce physical, procedural, and personnel security controls to protect the trust service infrastructure.
    - _T3 Repeatable · certificates_: Maintain and publish a Certification Practice Statement (CPS) detailing operational procedures, security controls, and roles for certificate issuance and management.
    - _T3 Repeatable · certificates_: Define and enforce a Certificate Policy (CP) that specifies the applicability of certificates, usage constraints, and compliance with relevant standards.
    - _T3 Repeatable · certificates_: Establish clear identification and authentication procedures for subscribers and subjects before certificate issuance.
- **Lifecycle / CLM**:
    - _T3 Repeatable · certificates_: Implement defined processes for certificate application, processing, issuance, renewal, re-keying, modification, and revocation.
    - _T3 Repeatable · keys_: Manage key pair generation, installation, protection, and changeover according to strict technical security controls.
    - _T3 Repeatable · keys_: Implement key escrow and recovery procedures to ensure access to private keys in case of compromise or loss, while maintaining security.
- **Observability**:
    - _T3 Repeatable · all_: Maintain audit logs of all significant security events and certificate lifecycle operations for forensic analysis and accountability.
    - _T3 Repeatable · certificates_: Provide certificate status services (CRL/OCSP) to allow real-time verification of certificate validity and revocation status.

## GSA-PQC-Buyers-Guide-2025
- **Source**: GSA Post-Quantum Cryptography Buyer's Guide
- **URL**: https://buy.gsa.gov/api/system/files/documents/final-508c-pqc_buyer-s_guide_2025.pdf
- **Requirement count**: 7
- **Assurance / FIPS**:
    - _T2 Risk-Informed · all_: Identify tools or methods to demonstrate conformance with secure encryption practices and PQC standards.
- **Inventory**:
    - _T3 Repeatable · all_: Submit comprehensive, centralized inventory of CRQC-vulnerable systems, applications, databases, and cryptographic assets to ONCD and CISA via CyberScope.
    - _T3 Repeatable · all_: Include in inventory high-impact systems, High Value Assets, systems with data sensitive until 2035, and asymmetric encryption-based access controls.
    - _T3 Repeatable · all_: Document lifecycle characteristics of data, including types, protection duration, and systems unable to migrate quickly to PQC.
    - _T3 Repeatable · all_: Submit annual updates of the cryptographic inventory and associated funding assessments for PQC migration.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Develop a timeline and plan to transition from quantum-vulnerable cryptography to quantum-resistant standards as mandated by NSM-10.
    - _T2 Risk-Informed · all_: Develop new standards, tools, and best practices for complying with PQC criteria, including evaluation of software security and supplier practices.

## IN-TEC-PQC-Migration-Report-2025
- **Source**: India TEC Technical Report TEC 910018:2025 — Migration to Post-Quantum Cryptography
- **URL**: https://www.tec.gov.in/pdf/TR/Final%20technical%20report%20on%20migration%20to%20PQC%2028-03-25.pdf
- **Requirement count**: 6
- **Assurance / FIPS**:
    - _T2 Risk-Informed · all_: Validate PQC implementation through proof of concept, pilots, and testing to ensure effectiveness against quantum threats.
- **Governance**:
    - _T2 Risk-Informed · all_: Identify critical digital infrastructure, data, and applications affected by quantum threats to enable proactive investment and migration planning.
    - _T2 Risk-Informed · all_: Conduct risk assessments to evaluate quantum readiness and define post-quantum requirements for vendors and OEMs.
- **Inventory**:
    - _T2 Risk-Informed · all_: Identify critical digital infrastructure, data, and applications that will be affected by the deployment of cryptographically relevant quantum computers.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Prepare a migration plan to transition from current cryptographic standards to quantum-safe cryptography before quantum computers break existing encryption.
    - _T2 Risk-Informed · all_: Implement hybrid solutions during migration to mitigate short-term risks and ensure trust management while transitioning to PQC.

## PQCC-Migration-Roadmap-2025
- **Source**: Post-Quantum Cryptography Coalition (PQCC) PQC Migration Roadmap
- **URL**: https://pqcc.org/post-quantum-cryptography-migration-roadmap/
- **Requirement count**: 9
- **Governance**:
    - _T2 Risk-Informed · all_: Appoint a designated migration lead or team responsible for monitoring and progressing the organization's PQC migration efforts.
    - _T2 Risk-Informed · all_: Define the specific role, responsibilities, and expected outcomes for the appointed PQC migration lead.
    - _T2 Risk-Informed · all_: Identify key stakeholders and develop a strategic communications plan to align leadership and stakeholders with PQC migration goals.
- **Inventory**:
    - _T2 Risk-Informed · all_: Evaluate and document existing inventories, risk assessments, and Cryptographic Bills of Materials (CBOMs) to establish a baseline understanding.
    - _T2 Risk-Informed · all_: Build a comprehensive inventory of cryptographic assets, collecting and categorizing information on their location, ownership, and usage.
    - _T2 Risk-Informed · all_: Prioritize critical assets for migration based on data sensitivity, shelf-life, and threat timelines.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Establish a migration plan and budget, identifying solutions through vendor engagement or internal development.
- **Observability**:
    - _T2 Risk-Informed · all_: Create measures to track PQC migration success and validate proper implementation against industry standards.
    - _T2 Risk-Informed · all_: Implement continuous monitoring and updating processes to reassess cryptographic security as quantum capabilities evolve.

## UK-NCSC-Migration-Timelines-2025
- **Source**: NCSC PQC Migration Timelines Guidance
- **URL**: https://www.ncsc.gov.uk/guidance/pqc-migration-timelines
- **Requirement count**: 12
- **Governance**:
    - _T2 Risk-Informed · all_: Define migration goals and build an initial plan for migration by 2028, considering sector-specific risks and regulatory requirements.
    - _T2 Risk-Informed · all_: Refine the migration plan into a thorough roadmap for completing migration by 2031.
    - _T2 Risk-Informed · all_: Ensure managed service providers carry out assessment activities for all services they provide, as they likely deliver most IT capability.
- **Inventory**:
    - _T2 Risk-Informed · all_: Carry out a full discovery exercise to assess the estate and identify services and infrastructure depending on cryptography that need upgrading to PQC.
    - _T2 Risk-Informed · all_: Build a clear understanding of the current estate, including key services, data records, protection methods, and system mappings.
    - _T2 Risk-Informed · all_: Ensure processes exist for identifying and managing assets (software and hardware) effectively, including version information and patch levels.
    - _T2 Risk-Informed · all_: Identify dependencies between components of systems and services to determine migration complexity and provider responsibilities.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Complete migration to PQC of all systems, services, and products by 2035.
    - _T2 Risk-Informed · all_: Develop a migration plan with timelines for each step, including research, procurement, testing, and rollout, accounting for business continuity.
    - _T2 Risk-Informed · all_: Select a migration strategy (in-place, re-platform, retire, run until EOL, or tolerate risk) for each system, service, or product.
    - _T2 Risk-Informed · all_: Ensure cryptographic agility to support co-existence of traditional PKC and PQC during migration, and define criteria for ending support for traditional algorithms.
    - _T2 Risk-Informed · certificates_: Assess security implications of enterprise PKI migration approaches on a case-by-case basis, considering parallel PKI or cross-signing models.

## UK-NCSC-PQC-Whitepaper-2024
- **Source**: NCSC White Paper — Next Steps in Preparing for Post-Quantum Cryptography
- **URL**: https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography
- **Requirement count**: 8
- **Assurance / FIPS**:
    - _T3 Repeatable · libraries_: Operational systems must only use PQC based on robust implementations of final standards.
    - _T3 Repeatable · software_: Operational systems must use protocol implementations based on RFCs, not Internet Drafts.
- **Governance**:
    - _T2 Risk-Informed · all_: System and risk owners must begin financial planning for updating systems to use PQC.
    - _T2 Risk-Informed · keys_: LMS and XMSS should only be used where state can be managed in a trusted manner for the key's lifetime.
    - _T2 Risk-Informed · software_: Communicate with IT system suppliers regarding their plans for supporting PQC in products.
- **Lifecycle / CLM**:
    - _T2 Risk-Informed · all_: Use PQ/T hybrid schemes only as an interim measure within a framework enabling migration to PQC-only.
    - _T2 Risk-Informed · software_: Ensure devices are updated to PQC when available by following guidance on keeping software up to date.
    - _T2 Risk-Informed · software_: New IT must use PQC or be capable of being upgraded to PQC once robust implementations are available.
