# oDar (@Kalgukso) portfolio

16 individually ranked game cards plus one combined panel covering 18 additional games. Headline totals include all 34 distinct Roblox experiences. Missing game data shows unavailable totals instead of misleading partial sums.

## Vercel
Framework: Other. Build command: empty. Output directory: public. Node.js: 22.x.

## Public total site visits
Create/connect a persistent Upstash Redis database in Vercel, then set these Production environment variables in the project settings:
- UPSTASH_REDIS_REST_URL
- UPSTASH_REDIS_REST_TOKEN

The Vercel KV names KV_REST_API_URL and KV_REST_API_TOKEN are also supported. Use the full write token, not the read-only token. Keep these values in Vercel settings only; never put secrets into GitHub files. Redeploy after setting them.

The counter counts page loads, including repeat visitors. Every load receives a random identifier, and retried submissions are deduplicated for 24 hours. It polls the shared count once per minute while the page is visible. It starts at zero when enabled; it cannot reconstruct earlier traffic. No names, email addresses or IP addresses are saved by this counter. It is hidden until storage is connected and a real count can be read.
