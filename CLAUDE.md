# Amiga (vAmigaWeb / vAmiga)

Fork of [vAmigaWeb/vAmigaWeb](https://github.com/vAmigaWeb/vAmigaWeb) (GPL-3.0), an
already-existing WebAssembly port of Dirk Hoffmann's
[vAmiga](https://dirkwhoffmann.github.io/vAmiga/) — a real, actively-developed,
cycle-accurate Amiga emulator (custom `Moira` 68k CPU core), not a toy reimplementation.
Fork: https://github.com/ml6719/vAmigaWeb (currently **private**, same GPL
source-distribution review caveat as `machines/atari-st` — not yet reviewed, treat as a
real workstream before making it public or distributing built artifacts).

## Why this core, not a from-scratch PUAE build

The project's README originally slated Amiga for "PUAE, not started, heaviest lift,"
assuming a from-scratch Emscripten port would be needed (matching the Hatari/chips-test
precedent of finding a native core and doing the WASM work ourselves). Searched first
before assuming that, and found something better: **an already-existing, mature WASM port
already exists** — vAmigaWeb, maintained by GitHub user Mithrendal, wrapping vAmiga
directly. Confirmed independently (not just taking the first search result):
- Real CMake + Emscripten build (`CMakeLists.txt`, `--shell-file=shell.html`, exported
  `_wasm_*` functions), not a toy or an abandoned experiment.
- vAmiga itself (the non-web core) is a serious, actively-developed emulator with its own
  large community and cycle-exact reputation — same category of choice as floooh/chips
  for C64.
- Building this from zero would have meant redoing exactly this work for no benefit.

## Critical finding: no ROM licensing fix was needed at all

Unlike C64 (had to swap bundled copyrighted KERNAL/BASIC/CHAR for open-roms) and Atari ST
(had to default to EmuTOS instead of bundling real TOS), **this repo already ships zero
copyrighted ROM material** — checked `roms/` directly:
- Multiple dated **AROS** Kickstart-replacement builds (`aros-rom-*.bin`/`aros-ext-*.bin`,
  512KB ROM + 512KB extension each) — AROS is the mature, actively-developed open-source
  AmigaOS reimplementation.
- **EmuTOS-Amiga** (`emutos-amiga.bin`, 256KB) — yes, the same EmuTOS already used as
  Atari ST's default boot ROM also has an Amiga port, bundled here as a second free option.

The existing UI (`shell.html`'s `#modal_roms`, wired up in `js/vAmiga_ui.js`) already has
exactly the "dropdown of open ROM options" the project wanted:
- An **"install free replacements"** dropdown with AROS and EmuTOS entries (`shell.html`
  `#button_fetch_open_roms`, matched by clicking on `.dropdown-item` text via
  `choice.includes("AROS")` / `choice.includes("emutos")` in `vAmiga_ui.js` around line
  5340, calling `fetchOpenROMS(osname)`).
- A **drag-and-drop / click-to-browse real-Kickstart upload** (the "kickstart rom"/
  "kickstart ext" chip-socket cards) — never bundled by us, user's own file, same
  never-bundle convention as Atari ST's "Load TOS" and C64's ROM uploads.
- Browser-storage caching of whatever ROM was last loaded (`stored_roms`/`stored_exts`
  `<select>`s), so returning users don't need to re-pick every session.
- ROM-vendor icon detection already built in (`img/rom_aros.png`, `rom_emutos.png`,
  `rom_hyperion.png` for the commercial AmigaOS 4 Kickstart, `rom_original.png`,
  `rom_patched.png`, `rom_unknown.png`) — this UI was clearly already designed to handle
  multiple ROM sources gracefully.

**Investigated a third open option, deliberately did not wire it in**:
[LibreKick](https://github.com/Ploos-AS/LibreKick) (MIT-licensed, genuinely clean-room,
would have been a great third dropdown entry). Checked its actual repo contents, not just
the README's marketing paragraph: it is at milestone **M0**, and its own README says the
M0 build "produces a deterministic ROM image placeholder suitable for evolving into the
first bootable LibreKick image" — i.e. **it does not boot anything yet**. Wiring it into
the dropdown today would mean offering a choice that produces a blank, non-functional
Amiga. Left out; revisit once LibreKick ships a real qualified machine-profile release (see
its `ROADMAP.md` — M0 is the foundation stage, actual bootable ROMs are later milestones).

## Build

Same CMake + Emscripten pattern as Atari ST, using the same sibling `emsdk` checkout
(`C:/LLM-Projects/emsdk`, no separate install needed — this project's shared toolchain):

```bash
export PATH="/c/Users/Administrator/AppData/Local/Programs/Python/Python313:/c/LLM-Projects/emsdk:/c/LLM-Projects/emsdk/upstream/emscripten:$PATH"
export EMSDK="/c/LLM-Projects/emsdk"
mkdir -p build-wasm && cd build-wasm
emcmake cmake -G Ninja ..
cmake --build .
```

**Same Python-2.7-on-PATH trap as every other machine's emsdk setup** (see
`machines/atari-st/CLAUDE.md` and `machines/c64/CLAUDE.md`) — this box's default `python`
resolves to `C:\Python27`, which breaks `emcc.py`'s own invocation with a cryptic
`-X is reserved for implementation-specific arguments` error that looks nothing like a
Python-version problem. Fix: put a real Python 3 ahead of it on `PATH` (see above).

Built clean on the first real attempt (173/173 steps, zero errors) — output:
`vAmiga.html` (78KB), `vAmiga.js` (110KB), `vAmiga.wasm` (8.46MB, genuinely large — full
68k CPU + Amiga chipset emulation, not padded). `build-wasm/` is gitignored (matches
upstream's own `.gitignore`, which already excludes `index.html`/`vAmiga.js`/`vAmiga.wasm`
at repo root too — build output is meant to go to the separate `vAmigaWeb.github.io`
deploy repo via the CMake `publish` target, not committed to source, same convention this
project already uses for its own `site/` output).

## Verified working — real evidence, not just "it compiled"

Ran into the exact same "genuinely black canvas" pattern already documented in
`machines/c64/CLAUDE.md` for floooh's own official demo — so before concluding anything
was broken, tested the **official upstream live deployment**
(https://vamigaweb.github.io/v108/) in the same sandboxed browser tool used for our own
build. It rendered an identical solid-black canvas. That confirms this is a
sandboxed-automation-environment/WebGL limitation of the testing tool itself, not a defect
in this fork's build — the same category of false alarm as the C64 finding, now confirmed
twice.

Real (non-visual) evidence collected instead, directly from the running WASM instance via
the browser console:
- `fetchOpenROMS('aros')` successfully fetched and staged both AROS ROM files; console
  logged `Loaded ROM image ... AROS Kickstart replacement` and `Loaded ROM_EXT image ...`
  with matching CRCs (`rom crc=7ae94477, ext crc=6f9a4ad2`), then `sending ready message
  READY_TO_RUN.`
- Audio pipeline connected (`vAmiga_audioprocessor connected`, sample rate 44100Hz).
- **CPU genuinely executes real instructions**: `Module._wasm_get_cpu_cycles()` advanced
  from 40 to 22,878,480 across repeated `calculate_and_render()` calls (the same function
  the production `requestAnimationFrame` loop calls every frame) — this is real 68k
  emulation running, not a stalled/halted core.
- The one genuine hazard found while testing: calling the raw `Module._wasm_run()` (the
  bare C export) is **not** sufficient to start the emulator — the real entry point is the
  JS-level `wasm_run()` wrapper in `vAmiga_ui.js`, which also sets up and kicks off the
  `requestAnimationFrame`-driven `do_animation_frame` loop
  (`stop_request_animation_frame` flag). Calling only the raw C export leaves the core
  powered on but with nothing ever calling it again. Not a bug — just the one API subtlety
  worth remembering before assuming something is broken: **always drive the emulator
  through the `wasm_*` JS wrappers in `vAmiga_ui.js`, never the raw `Module._wasm_*` C
  exports directly**, except for narrow read-only queries like `wasm_get_cpu_cycles`.

## Amiga on-screen keyboard reference

User supplied a real Amiga 500-family keyboard photo for building the on-screen keyboard
later (not built yet). Key layout notes worth remembering when that work starts:
- `Esc` is isolated top-left, then a gap, then `F1`-`F5`, another gap, then `F6`-`F10` —
  not a continuous F1-F10 run like a PC keyboard.
- Top row: `` ` ``/`~`, then `1`-`0` with UK legends (`!@£$%^&*()`), then `-`/`=`, then
  `\`/`|`, then a dedicated `←` (backspace) key on the far right.
- `Tab` is a double-headed arrow glyph (⇥/⇤ style) on this unit, not text "Tab".
- Second row: `Ctrl`, `Caps Lock` (with an LED dot), `A`-`L` with UK punctuation legends
  (`;:`/`'@`/`~#` etc. depending on region), a large `Return` (⏎-glyph) key.
- Third row: left `Shift` is narrow (not full-width), `Z`-`M`, then `,<`/`.>`/`/?`, a
  wide right `Shift`.
- Bottom row: `Alt`, a small key with an italic **A** glyph (the Amiga logo/"Amiga" key,
  left of Space), wide `Space`, another italic **A** logo key, `Alt` — i.e. **two Amiga-
  logo keys flank Space symmetrically**, not one. Real key codes for these two logo keys
  and for the exact matrix positions still need verifying against `Core/` source before
  building the on-screen layout (same "verified against source, not guessed" discipline as
  every other machine's keyboard — see `machines/c64/CLAUDE.md`'s keyboard section for why
  this matters).

## Status

- [x] Forked vAmigaWeb (private, GPL review pending, same as Atari ST).
- [x] Registered as a git submodule at `machines/amiga`.
- [x] Clean Emscripten build via the project's shared emsdk checkout, zero errors.
- [x] **No ROM licensing fix needed** — AROS + EmuTOS already bundled open by upstream;
      real-Kickstart upload UI already exists and never bundles anything itself.
- [x] Investigated LibreKick as a third free-ROM option; confirmed (from its own repo, not
      assumption) that it's pre-bootable (M0 skeleton only) and deliberately left it out
      until it ships something that actually boots.
- [x] **Verified genuinely running**: ROM load, CRC match, audio pipeline, and real CPU
      cycle advancement all confirmed via the live WASM instance's own console/API: real
      emulation, not just a successful compile.
- [ ] **Not yet integrated into this project's site**: no toolbar/shell wiring into
      `build-site.mjs`/`site/`, no `.gitignore` prebuilt-exception entry (like
      `site/atari-st`/`site/c64`), no entry on the landing page. This machine's shell
      (`shell.html`) is Bootstrap-based with its own extensive settings UI, not this
      project's shared `mx-` toolbar convention — integration will need a decision on
      whether to keep vAmigaWeb's own shell as-is (fastest, most feature-complete) or adapt
      it toward the shared convention (more consistent with the other 5 machines, more
      work). Not decided yet.
- [ ] On-screen virtual keyboard not built (real keyboard passthrough may already work via
      vAmigaWeb's own input handling — not yet checked).
- [ ] No visual confirmation of actual pixels rendering (blocked by the sandboxed test
      tool's WebGL limitation, not by the build — see "Verified working" above for why this
      isn't treated as a real gap). Worth a quick check in a real desktop browser before
      calling this fully done.
