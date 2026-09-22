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
