/**
 * The Multitude: reserves space for the permanent left sidebar this file's
 * matching CSS (multitude-theme.css) turns #navbar into on desktop widths.
 * scaleVMCanvas() in vAmiga_canvas.js calls this exactly like it already
 * calls memview_reserved_width() for the docked memory-view panel - same
 * pattern, just for our sidebar instead.
 */
const MX_SIDEBAR_WIDTH = 220;

function mx_sidebar_reserved_width() {
    return window.matchMedia('(min-width: 700px)').matches ? MX_SIDEBAR_WIDTH : 0;
}

window.addEventListener('resize', function () {
    if (typeof scaleVMCanvas === 'function') scaleVMCanvas();
});

// Text labels for the sidebar's icon-only buttons, matching every other
// machine's toolbar convention (readable button text, not bare icons).
// Concise hand-picked labels rather than every button's full tooltip text
// (some of those are long help strings, e.g. "save snapshot, workspace or
// export disk") - kept short on purpose. button_ff is deliberately left out:
// it already shows its own "warp" caption while active, and a second static
// label would duplicate it.
const MX_BUTTON_LABELS = {
    button_reset: 'Reset',
    button_run: 'Pause',
    button_speed_toggle: 'Speed',
    button_take_snapshot: 'Snapshot',
    button_snapshots: 'Browser',
    button_keyboard: 'Keyboard',
    button_custom_key: 'Actions',
    button_fullscreen: 'Fullscreen',
    btn_activity_monitor: 'Activity',
    button_memview: 'Memory',
    button_settings: 'Settings',
};

function mx_label_navbar_buttons() {
    for (const [id, label] of Object.entries(MX_BUTTON_LABELS)) {
        const el = document.getElementById(id);
        if (!el || el.querySelector('.mx-btn-label')) continue;
        const span = document.createElement('span');
        span.className = 'mx-btn-label';
        span.textContent = label;
        el.appendChild(span);
    }
    // Joystick port selects show a bare "none"/etc value with no context -
    // add the same kind of preceding text label every other machine's
    // joystick select has (see machines/atari-st or machines/c64's
    // "Joystick" <label>).
    for (const [id, label] of [['port1', 'Port 1'], ['port2', 'Port 2']]) {
        const select = document.getElementById(id);
        if (!select || select.previousElementSibling?.classList.contains('mx-select-label')) continue;
        const tag = document.createElement('span');
        tag.className = 'mx-select-label';
        tag.textContent = label;
        select.parentElement.insertBefore(tag, select);
    }
}

// Buttons/selects are created by vAmiga_ui.js at boot, same as everything
// else this file touches - run once DOM content is ready, then again
// shortly after in case boot order runs later than expected (cheap no-op
// via the .mx-btn-label guard above if it already ran).
document.addEventListener('DOMContentLoaded', mx_label_navbar_buttons);
setTimeout(mx_label_navbar_buttons, 1500);

// Default to AROS instead of asking every time: upstream shows the
// "Amiga Operating System ROM" modal and waits for the user to pick
// something whenever no ROM is cached yet (MSG_ROM_MISSING in
// vAmiga_ui.js). AROS is already the right default (open, free, boots on
// its own) - just install it automatically the same way the modal's own
// "install free replacements" dropdown does (fetchOpenROMS('aros')),
// and hide the modal if it already opened. Once a ROM is cached in
// browser storage, this never fires again (load_roms(true) succeeds
// first). Anyone who wants a different ROM (their own real Kickstart,
// or EmuTOS) can still get to the same picker via Settings -> "kickstart
// roms..." - nothing is removed, just no longer forced on first visit.
(function () {
    let tries = 0;
    const maxTries = 30; // ~9s at 300ms - Module/wasm_rom_info need real boot time
    const poll = setInterval(() => {
        tries++;
        if (typeof wasm_rom_info !== 'function') {
            if (tries >= maxTries) clearInterval(poll);
            return;
        }
        clearInterval(poll);
        let info;
        try { info = JSON.parse(wasm_rom_info()); } catch (e) { return; }
        if (info.hasRom === 'false' && typeof fetchOpenROMS === 'function') {
            fetchOpenROMS('aros');
            if (typeof $ !== 'undefined') $('#modal_roms').modal('hide');
        }
    }, 300);
})();
