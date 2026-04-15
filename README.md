# splat

Landing page for `splat.gmac.io`, deployed with ForgeGraph to `hetzner-master`.

## What it does

- serves a simple React landing page
- accepts waitlist signups at `POST /api/waitlist`
- stores collected emails as JSONL in `DATA_DIR/waitlist.jsonl`

## Local development

```bash
npm install
npm test
npm run build
PORT=3000 DATA_DIR=./data npm start
```

## Deployment

ForgeGraph expects a Nix package named `splat`. The flake builds the Vite frontend, bundles the Express server, and exposes a runnable `splat` binary for systemd.
