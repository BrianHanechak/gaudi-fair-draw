# Gaudí Fair Draw

An unofficial, offline-capable web companion for **Gaudí** (Devir, 2026). It
replaces the cloth bag with a perfectly uniform draw and tells the table exactly
which Trencadís pieces to take.

The physical bag is not a neutral draw: the pieces come in four shapes, and the
bigger shapes are easier to grab. Drawing from the real bag therefore skews the
supply toward large pieces. This app shuffles the **full 96-piece multiset**
(4 shapes × 4 colours × 6 copies) and deals from that order without replacement.
One player fishes out the named tiles; the composition is exact regardless of
how the bag behaves.

## What it implements

| | Standard | Expert |
|---|---|---|
| Supply spaces | 5 | 5 |
| Tiles per space at setup | 5 (25 dealt) | 4 (20 dealt) |
| Tiles per refill | 5 | 4 |
| Starting bag | 96 | 96 |

- **Setup:** one tap deals all five supplies, numbered 1–5.
- **Refill:** draws the next full set for the chosen space and updates the bag.
- **Undo:** restores the previous supply, the cursor and the log (up to 25 steps).
- **Bag panel:** exact remaining counts by shape and colour. This is public
  information — the bag is always `96 − supplies − player boards`.
- **Draw log:** every setup deal and refill, with the tiles named in plain text.
- **Resume:** the session is saved to `localStorage`, so a refresh or a locked
  phone does not lose the game.
- **Offline/PWA:** installable, precached, no network calls at runtime.

End-of-bag behaviour matches the rules: a refill gets whatever remains, and the
UI warns when the bag is nearly empty. All other game rules (cards, chimneys,
scoring, turn order) stay on the table.

## Running locally

Requires Node 22+ and pnpm.

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # Vitest: engine, RNG, and UI flow
pnpm typecheck
pnpm lint
pnpm build        # static site in dist/
pnpm preview
```

The draw engine is pure TypeScript in `src/lib/`. `startGame` pre-shuffles the
whole bag with `crypto.getRandomValues` and unbiased rejection sampling
(`randomInt`), then every refill consumes the next slice. That makes draws
uniform, without replacement, resumable, and auditable.

## Deploying to AWS

The build is a plain static site; S3 + CloudFront is the straightforward path.
S3 website endpoints do not serve HTTPS, so use CloudFront if you want the PWA
to be installable.

```sh
pnpm build

# Immutable assets, long cache.
aws s3 sync dist/ "s3://$BUCKET/" --delete \
  --exclude "index.html" \
  --exclude "sw.js" \
  --exclude "manifest.webmanifest" \
  --exclude "registerSW.js" \
  --cache-control "public,max-age=31536000,immutable"

# Entry points must be revalidated.
aws s3 cp dist/index.html "s3://$BUCKET/index.html" --cache-control "no-cache"
aws s3 cp dist/sw.js "s3://$BUCKET/sw.js" --cache-control "no-cache"
aws s3 cp dist/manifest.webmanifest "s3://$BUCKET/manifest.webmanifest" --cache-control "no-cache"
aws s3 cp dist/registerSW.js "s3://$BUCKET/registerSW.js" --cache-control "no-cache"

aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*"
```

Point CloudFront at the bucket (OAC, private bucket), set the default root
object to `index.html`, and invalidate on each deploy. No server, database or
accounts are involved.

If you host under a subpath, set Vite's `base`, the manifest `start_url`/`scope`
and the icon paths together.

## Tile data

`src/lib/tiles.ts` is the single source of truth:

- `SHAPE_IDS`: `shard`, `square`, `pentagon`, `triangle`
- `COLOUR_IDS`: `blue`, `gray`, `green`, `yellow`
- `COPIES_PER_TYPE = 6`, `TOTAL_TILES = 96`

The colour names follow the four pieces: blue, gray, green and yellow. If your
copy or your group uses different names, rename the `name` / `shortName` fields
in `COLOURS`; the bag table and the spoken summaries follow automatically.
Changing the colour IDs invalidates saved games, which then start fresh.

The app uses simple geometric SVG shapes, not the game's artwork.

## PWA icons

Icons are checked in under `public/icons/`. To regenerate them after a design
change:

```sh
python -m pip install pillow
python scripts/make-icons.py
```

## Design notes and limits

- **No hidden information is exposed.** Remaining counts are derivable from the
  open board and player boards, so the bag panel is safe to show.
- **No tap-to-take.** The app tracks the bag, not which physical tiles have been
  removed from a supply space. Tap **Refill** when the space is empty. Tiles a
  player takes do not change the bag, so this needs no bookkeeping.
- **No device sync.** A game lives in one browser's `localStorage`.
- **Unofficial.** Not affiliated with Devir, the designer, or the artists.
