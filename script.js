/* =========================================================
   LiDAR Noir — script.js
   Tianyu Li Personal Website
   ========================================================= */

// ===== Canvas Point Cloud Background =====
(function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = 90;
    const particles = Array.from({ length: COUNT }, () => ({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        size:   Math.random() * 1.4 + 0.4,
        vx:     (Math.random() - 0.5) * 0.18,
        vy:     (Math.random() - 0.5) * 0.18,
        alpha:  Math.random() * 0.35 + 0.08,
        hue:    Math.random() > 0.82 ? 'amber' : (Math.random() > 0.55 ? 'cyan' : 'white'),
    }));

    const COLORS = {
        amber: 'rgba(249,115,22,',
        cyan:  'rgba(34,211,238,',
        white: 'rgba(240,244,248,',
    };

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = COLORS[p.hue] + p.alpha + ')';
            ctx.fill();
        });

        // Connections — sparse amber mesh
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    const alpha = 0.05 * (1 - dist / 130);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(249,115,22,${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(draw);
    }

    draw();
})();

// ===== Custom Cursor =====
(function initCursor() {
    const ring = document.querySelector('.cursor-ring');
    const dot  = document.querySelector('.cursor-dot');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice || !ring || !dot) {
        if (ring) ring.style.display = 'none';
        if (dot)  dot.style.display  = 'none';
        document.body.style.cursor = 'auto';
        return;
    }

    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
    }, { passive: true });

    (function animateRing() {
        rx += (mx - rx) * 0.11;
        ry += (my - ry) * 0.11;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animateRing);
    })();

    // Hover expansion
    const interactiveSelector = 'a, button, .edu-item, .exp-item, .challenge-entry, .interest-grid span, .conf-list span';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(interactiveSelector)) {
            document.body.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(interactiveSelector)) {
            document.body.classList.remove('cursor-hover');
        }
    });
})();

// ===== Typing Animation =====
(function initTyping() {
    const el = document.querySelector('.typed-text');
    if (!el) return;

    const words  = ['Autonomous Driving', 'Physical AI', '3D Vision'];
    let wIdx = 0, cIdx = 0, deleting = false;

    function tick() {
        const word = words[wIdx];

        if (deleting) {
            el.textContent = word.substring(0, --cIdx);
        } else {
            el.textContent = word.substring(0, ++cIdx);
        }

        let delay = deleting ? 38 : 88;

        if (!deleting && cIdx === word.length) {
            delay = 2400;
            deleting = true;
        } else if (deleting && cIdx === 0) {
            deleting = false;
            wIdx = (wIdx + 1) % words.length;
            delay = 420;
        }

        setTimeout(tick, delay);
    }

    setTimeout(tick, 1400);
})();

// ===== Intersection Observer — section reveal =====
(function initObserver() {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
        });
    }, { threshold: 0.07 });

    document.querySelectorAll('.section').forEach(el => io.observe(el));

    // Hero: make visible right away after a tiny delay
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.classList.add('section');
        setTimeout(() => hero.classList.add('visible'), 80);
    }
})();

// ===== Mobile Menu =====
(function initMobileMenu() {
    const hamburger  = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-menu a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });
})();

// ===== Active Nav Highlight =====
(function initActiveNav() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');

    function updateActive() {
        const scrollY = window.scrollY + 120;
        let activeId  = null;

        sections.forEach(section => {
            if (scrollY >= section.offsetTop) {
                activeId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', href === activeId);
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
})();

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = window.innerWidth > 1024 ? 0 : 64;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
});

// ===== GitHub Stars =====
async function fetchGitHubStars() {
    const seen = new Map(); // cache repo → stars

    const links = document.querySelectorAll('.pub-link-code[data-repo]');

    for (const link of links) {
        const repo = link.getAttribute('data-repo');
        const span = link.querySelector('.gh-stars');
        if (!repo || !span) continue;

        try {
            let stars;
            if (seen.has(repo)) {
                stars = seen.get(repo);
            } else {
                const res = await fetch(`https://api.github.com/repos/${repo}`);
                if (!res.ok) continue;
                const data = await res.json();
                stars = data.stargazers_count;
                seen.set(repo, stars);
            }

            const label = stars >= 1000
                ? `★ ${(stars / 1000).toFixed(1)}k`
                : `★ ${stars}`;
            span.textContent = label;
            span.classList.add('loaded');
        } catch {
            /* silently ignore */
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchGitHubStars);
