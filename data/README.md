# 🎨 Theme registry (generated)

Every Cybercore Pages site reads its themes from this folder at runtime.

**Do not edit these files here.** They are generated from
[cybercoretech/cybercore](https://github.com/cybercoretech/cybercore) by
`tools/export-distribution.py org` and arrive as PRs from the
*Sync from cybercore* workflow:

| File | Source in cybercore |
| --- | --- |
| `themes/<family>/<id>.json` | `schema/themes/<family>/<id>.json` |
| `cybergrid.json` | `schema/cybergrid.json` + `schema/themes` (the site default, `active`, is kept from this file) |
| `mashups.json` | `schema/mashups.json` |
| `kitty-themes.json` | `schema/kitty-themes.json` |

`contact.json` is owned by this repository and is not generated.
See [docs/distribution.md](https://github.com/cybercoretech/cybercore/blob/main/docs/distribution.md).
