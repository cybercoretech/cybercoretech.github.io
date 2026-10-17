# Cybercore Tech Pages

The public Cybercore Tech organization landing surface for `cybercoretech.github.io`.

This site is separate from the existing `cybercoretech.net` project. It presents the Cybercore Tech identity, five core repositories, the 81-theme CYBERGRID matrix, the Theme Studio entry point, and open-system acknowledgements.

The theme gallery reads its catalog and palette JSON from `data/`. Keep those
files aligned with `framework/cybercore/schema/themes/`; the gallery computes
its theme and family counts from `data/cybergrid.json`. Cybercore Theme Studio
supports custom themes, curated-family copies, and portable `.cyberpack.json`
imports and exports for local Cybercore applications.

Cybercore 0.8.0 publishes the `cybercore-theme` quality and pack-checking CLI.
The public Pages site serves `install.sh` at
`https://cybercoretech.github.io/install.sh`; the quick install is:

```sh
curl -fsSL https://cybercoretech.github.io/install.sh | sh
```

The script requires Rust/Cargo and installs only the CLI binary. Rust projects
should add `cybercore = "0.8"` as a crate dependency; the CLI installer does
not install the library or the standalone Theme Studio application. The
equivalent direct Cargo command is `cargo install cybercore --locked --bin cybercore-theme`.

## Shared contact block

`data/contact.json` is the single source of truth for Cybercore Tech contact details: email, security address, signal channels, support links and the copyright line. `kit/contact.js` renders it as a `<cybercore-contact>` element that any Cybercore page can use:

```html
<script type="module" src="https://cybercoretech.github.io/kit/contact.js"></script>

<cybercore-contact></cybercore-contact>                     <!-- full block -->
<cybercore-contact variant="compact"></cybercore-contact>   <!-- one line -->
<cybercore-contact repo="argus"></cybercore-contact>        <!-- adds that repo's issues link -->
<cybercore-contact bare></cybercore-contact>                 <!-- no sign-off line, for pages with their own -->
```

- **Theme-aware:** it reads the page's CYBERGRID tokens (`--bg`, `--panel`, `--line`, `--muted`, `--white` or `--fg`, `--cyan`, `--pink`, `--acid`, `--orange`) and re-themes live when the page switches palettes.
- **One edit, every site:** change `contact.json` and every page picks it up (GitHub Pages caches for about 10 minutes). Cross-origin pages such as cybercoretech.net can load it too.
- **Fallback:** anything inside the tag shows only if the data can't load, so put a plain email link there.
- **Safe:** everything is built with `textContent`, and only `https:` and `mailto:` links are rendered.
