# Real Security Engine

AegisGRC's real scanner path is intentionally separate from AI analysis.

## Execution model
Browser -> Express API -> authorization confirmation -> target validation -> allowlisted scanner profile -> real Nmap/Wapiti child process -> raw XML/JSON evidence -> SHA-256 evidence hash -> parser/GRC mapping.

The scanner service never accepts arbitrary command strings or arbitrary scanner arguments.

## Runtime
Build the included Dockerfile. The runtime image installs Nmap and Wapiti. Scanner availability therefore depends on deploying the Docker image rather than a frontend-only host.

## Safety boundary
Only scan systems you own or have explicit authorization to assess. The API blocks loopback, link-local and RFC1918 targets by default and uses bounded timeouts and scanner profiles.

## API integration
Import `runRealScanner` from `src/server/realScanner.ts`. The production endpoint should require an explicit authorization acknowledgement and accept only `nmap` or `wapiti`. Store `stdout`, `stderr`, timestamps, exit code and evidence SHA-256 before AI/GRC interpretation.
