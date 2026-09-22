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
