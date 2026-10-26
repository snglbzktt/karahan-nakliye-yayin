(function () {
    'use strict';
    var section = document.querySelector('[data-truck-scroll]');
    if (!section) return;
    var stage = section.querySelector('[data-truck-stage]');
    var vehicle = section.querySelector('[data-truck-vehicle]');
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var frame = 0;
    var needsMeasure = true;
    var start = 0;
    var distance = 1;
    var containerWidth = 0;
    var truckWidth = 0;
    var previousX = null;
    var destroyed = false;
    var resizeObserver;
    var intersectionObserver;

    function measure() {
        var top = parseFloat(window.getComputedStyle(stage).top) || 0;
        start = section.getBoundingClientRect().top + window.scrollY - top;
        distance = Math.max(1, section.offsetHeight - stage.offsetHeight);
        containerWidth = stage.clientWidth;
        truckWidth = vehicle.offsetWidth;
        needsMeasure = false;
    }
    function update() {
        frame = 0;
        if (destroyed || motion.matches) return;
        if (needsMeasure) measure();
        var progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
        var x = -truckWidth + (containerWidth + truckWidth) * progress;
        if (x !== previousX) {
            vehicle.style.transform = 'translate3d(' + x.toFixed(3) + 'px, 0, 0)';
            previousX = x;
        }
    }
    function schedule() {
        if (!frame && !destroyed && !motion.matches) frame = window.requestAnimationFrame(update);
    }
    function scheduleMeasure() { needsMeasure = true; schedule(); }
    function onMotionChange() {
        section.classList.toggle('is-reduced-motion', motion.matches);
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        previousX = null;
        if (motion.matches) vehicle.style.removeProperty('transform');
        else scheduleMeasure();
    }
    function onPageHide(event) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        if (event.persisted) return;
        destroyed = true;
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', scheduleMeasure);
        window.removeEventListener('pageshow', scheduleMeasure);
        window.removeEventListener('pagehide', onPageHide);
        document.removeEventListener('load', scheduleMeasure, true);
        if (motion.removeEventListener) motion.removeEventListener('change', onMotionChange);
        else motion.removeListener(onMotionChange);
        if (resizeObserver) resizeObserver.disconnect();
        if (intersectionObserver) intersectionObserver.disconnect();
    }
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', scheduleMeasure, {passive: true});
    window.addEventListener('pageshow', scheduleMeasure);
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('load', scheduleMeasure, true);
    if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
    else motion.addListener(onMotionChange);
    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(scheduleMeasure);
        [section, stage, vehicle, document.body].forEach(function (node) { resizeObserver.observe(node); });
    }
    if ('IntersectionObserver' in window) {
        intersectionObserver = new IntersectionObserver(function (entries) {
            section.classList.toggle('is-truck-active', entries[0].isIntersecting && !motion.matches);
        });
        intersectionObserver.observe(section);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMeasure);
    onMotionChange();
}());
