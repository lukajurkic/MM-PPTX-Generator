# Instructions for AI Coding Assistants

When analyzing or modifying this repository:

1. **Read Core Guides First:**
   - Refer to [PROJECT_GUIDE.md](../PROJECT_GUIDE.md) for full architectural maps, data flow, signals state management, and song schemas.
   - Refer to [CONTRIBUTING.md](../CONTRIBUTING.md) for mandatory project rules, commit formatting, and testing requirements.

2. **Key Rules to Always Obey:**
   - **Branching & Commit Format:** Commits must strictly follow `feat #<issue> :: <action>` or `fix #<issue> :: <action>`.
   - **Never Push Without Consent:** Do not execute `git push` unless explicitly asked.
   - **Single Source of Truth for Songs:** Songs are authored in `songs/*.json`. Never duplicate or commit individual song files into `src/assets/songs/`.
   - **Dual-Language:** Croatian is primary default; always update both `TRANSLATIONS_HR` and `TRANSLATIONS_EN` in `TranslationService`.
   - **Validation:** Always verify with `npx tsc --noEmit`, `npm test` (all 57 tests must pass), and `npm run build`.
