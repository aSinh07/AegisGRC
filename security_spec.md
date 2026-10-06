# Security Specification & Test Protocol

## 1. Data Invariants
1. `UserProfile`: Document ID must match `request.auth.uid`. Users cannot modify other profiles or elevate their roles. `userId` must equal `request.auth.uid`.
2. `GrcAudit`: Can only be created by an authenticated user where `incoming().userId == request.auth.uid`. Read/List allowed for the owner.
3. `AccessLog`: Write-only creation by authenticated user logging their own `userId`. Immutable once written.
4. Catch-all default deny for all unidentified document paths.

## 2. The "Dirty Dozen" Payloads (Must be rejected)
1. **Unauthenticated Profile Creation**: Anonymous attempt to write `/userProfiles/attacker_uid`. -> REJECT
2. **ID Spoofing**: User `A` creates a profile with document id `B` or `userId: 'victim_uid'`. -> REJECT
3. **Ghost Field Poisoning**: Injecting `{ adminBypass: true }` in `userProfiles` or `grcAudits`. -> REJECT
4. **Huge ID / Buffer Overflow**: Writing document ID with 500 characters of junk to exhaust resources. -> REJECT
5. **Unauthorized Read**: User `A` attempting to read `/userProfiles/{userB}` or `/grcAudits/{auditB}` belonging to another tenant. -> REJECT
6. **Audit Tampering**: Non-owner attempting to modify or delete another user's compliance audit report. -> REJECT
7. **Immutable Field Modification**: Updating an audit with a changed `userId` or `auditId`. -> REJECT
8. **Invalid Enum**: Setting `mfaMethod` to `malicious_bypass` instead of `google_authenticator` | `microsoft_authenticator`. -> REJECT
9. **Log Tampering / Deletion**: Attempting to delete an `/accessLogs/{logId}` entry to erase forensic evidence. -> REJECT
10. **Oversized String Payload**: Supplying a 2MB string in `companyName` or `targetUrl`. -> REJECT
11. **Spoofed Email / Fake Verification**: Submitting user profile with unverified email when verification required. -> REJECT
12. **Blanket Query Scraping**: Attempting a collection group query on `grcAudits` without filter constraint. -> REJECT
