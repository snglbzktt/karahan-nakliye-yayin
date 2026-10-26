(function () {
    "use strict";

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu]");
    var nav = document.querySelector("[data-nav]");

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    function setMenu(open) {
        if (!toggle) {
            return;
        }
        document.body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        var label = toggle.querySelector(".visually-hidden");
        if (label) {
            label.textContent = open ? "Menüyü kapat" : "Menüyü aç";
        }
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            setMenu(!document.body.classList.contains("menu-open"));
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            setMenu(false);
        }
    });

    if (nav) {
        nav.addEventListener("click", function (event) {
            var target = event.target;
            var link = target && target.closest ? target.closest("a") : null;
            if (link) {
                setMenu(false);
            }
        });
    }

    window.addEventListener("resize", function () {
        if (window.innerWidth >= 1040) {
            setMenu(false);
        }
    });

    var animateNodes = document.querySelectorAll("[data-animate]");
    if (!reduce && "IntersectionObserver" in window) {
        var animateObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-in");
                animateObserver.unobserve(entry.target);
            });
        }, { threshold: 0.16 });
        animateNodes.forEach(function (node) {
            animateObserver.observe(node);
        });
    } else {
        animateNodes.forEach(function (node) {
            node.classList.add("is-in");
        });
    }

    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    if ("IntersectionObserver" in window && links.length) {
        var pairs = [];
        links.forEach(function (link) {
            var href = link.getAttribute("href") || "";
            if (href.charAt(0) !== "#") {
                return;
            }
            var section = document.querySelector(href);
            if (section) {
                pairs.push({ link: link, section: section });
            }
        });
        var activeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                links.forEach(function (link) {
                    link.removeAttribute("aria-current");
                });
                pairs.forEach(function (pair) {
                    if (pair.section === entry.target) {
                        pair.link.setAttribute("aria-current", "true");
                    }
                });
            });
        }, { rootMargin: "-35% 0px -50% 0px", threshold: 0 });
        pairs.forEach(function (pair) {
            activeObserver.observe(pair.section);
        });
    }

    var parallax = document.querySelector("[data-parallax]");
    if (parallax && !reduce) {
        var ticking = false;
        window.addEventListener("scroll", function () {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(function () {
                var y = Math.min(window.scrollY, 420) * 0.045;
                parallax.style.transform = "translate3d(0," + y.toFixed(2) + "px,0)";
                ticking = false;
            });
        }, { passive: true });
    }

    var heroVideo = document.querySelector("[data-hero-video]");
    var heroToggle = document.querySelector("[data-hero-toggle]");
    var heroPausedByUser = false;

    function syncHeroToggle() {
        if (!heroVideo || !heroToggle) {
            return;
        }
        var paused = heroVideo.paused;
        heroToggle.textContent = paused ? "Videoyu oynat" : "Videoyu durdur";
        heroToggle.setAttribute("aria-pressed", paused ? "false" : "true");
    }

    if (heroVideo) {
        heroVideo.muted = true;
        if (reduce) {
            heroVideo.removeAttribute("autoplay");
            heroVideo.pause();
            heroPausedByUser = true;
        }
        if (heroToggle) {
            heroToggle.addEventListener("click", function () {
                if (heroVideo.paused) {
                    heroPausedByUser = false;
                    heroVideo.play().catch(function () { syncHeroToggle(); });
                } else {
                    heroPausedByUser = true;
                    heroVideo.pause();
                }
                syncHeroToggle();
            });
        }
        heroVideo.addEventListener("play", syncHeroToggle);
        heroVideo.addEventListener("pause", syncHeroToggle);
        heroVideo.addEventListener("canplay", syncHeroToggle);
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                heroVideo.pause();
                return;
            }
            if (!heroPausedByUser && !reduce) {
                heroVideo.play().catch(function () { syncHeroToggle(); });
            }
        });
        if ("IntersectionObserver" in window) {
            var heroObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        heroVideo.pause();
                        return;
                    }
                    if (!heroPausedByUser && !reduce) {
                        heroVideo.play().catch(function () { syncHeroToggle(); });
                    }
                });
            }, { threshold: 0.25 });
            heroObserver.observe(heroVideo);
        }
        syncHeroToggle();
    }

    var videos = document.querySelectorAll("video:not([data-hero-video])");
    if (videos.length && "IntersectionObserver" in window) {
        var videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting && !entry.target.paused) {
                    entry.target.pause();
                }
            });
        }, { threshold: 0.2 });
        videos.forEach(function (video) {
            videoObserver.observe(video);
        });
    }

}());
(function () {
    'use strict';
    var dialog = document.querySelector('[data-lightbox-dialog]');
    var lastLink;
    document.querySelectorAll('[data-lightbox]').forEach(function(link){link.addEventListener('click',function(event){
        if (!dialog || !dialog.showModal) return;
        event.preventDefault(); lastLink=link;
        var img=dialog.querySelector('img'); img.src=link.href; img.alt=link.querySelector('img').alt;
        dialog.showModal();
    });});
    if(dialog){ dialog.querySelector('button').addEventListener('click',function(){dialog.close();}); dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});dialog.addEventListener('close',function(){if(lastLink)lastLink.focus();}); }
}());
(function () {
    'use strict';
    document.querySelectorAll('[data-ribbon-toggle]').forEach(function (button) {
        button.addEventListener('click', function () {
            var ribbon = button.closest('[data-ribbon]');
            var paused = ribbon.classList.toggle('is-paused');
            button.setAttribute('aria-pressed', String(paused));
            button.setAttribute('aria-label', paused ? 'Bu şeridin hareketini başlat' : 'Bu şeridin hareketini durdur');
            button.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
        });
    });
}());
