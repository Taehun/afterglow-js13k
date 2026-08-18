# jk13k-2026

Entry for [js13kGames 2026](https://js13kgames.com/2026/) — theme: **Unicorns and Rainbows**.

(Game name and concept TBD — currently a bootstrapped engine + build pipeline
with a placeholder demo.)

## Build

Requires Node >= 22.

```sh
npm ci
npm run build      # → dist/index.html + dist/game.zip (fails if zip > 13,312 bytes)
```

Optional: `brew install advancecomp` (macOS) / `apt install advancecomp` (Linux)
for zopfli zip recompression — the build falls back to plain `zip -9` without it.

## Develop

```sh
npm run dev        # http://localhost:1313 — watch + live reload
npm run check      # typecheck + build (size guard) + browser smoke test
```

## Pipeline

esbuild → terser → [Roadroller](https://github.com/lifthrasiir/roadroller) →
inline into minimal HTML → `zip -9 -X` → `advzip -z -4`.

## License

Code: MIT. [ZzFX](https://github.com/KilledByAPixel/ZzFX) (vendored) is MIT ©
Frank Force.
