document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------------------------------------------------------
       Menu mobile
       ------------------------------------------------------- */
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    function setMenu(open) {
        hamburger.classList.toggle('active', open);
        navLinks.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    /* -------------------------------------------------------
       Header, barra de progresso e link ativo
       ------------------------------------------------------- */
    const header = document.getElementById('siteHeader');
    const scrollProgress = document.getElementById('scrollProgress');

    function onScroll() {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 40);
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const navMap = new Map();
    navLinks.querySelectorAll('a[href^="#"]').forEach(a => navMap.set(a.getAttribute('href').slice(1), a));
    // As seções das frentes acendem o link "Três frentes"
    ['hardware', 'ia', 'game'].forEach(id => navMap.set(id, navMap.get('frentes')));

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.querySelectorAll('a').forEach(a => a.classList.remove('is-active'));
                const link = navMap.get(entry.target.id);
                if (link) link.classList.add('is-active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));
    }

    /* -------------------------------------------------------
       Revelação suave ao rolar
       ------------------------------------------------------- */
    const revealTargets = document.querySelectorAll(
        '.section-head, .front-header, .problema-intro, .stats, .split > *, .fronts, .loop, .media-split, ' +
        '.components, .ia-grid, .game-frame, .game-cards, .round, .impact-grid, .equation, ' +
        '.roadmap-scroll, .team-group, .team-faces, .closing-inner'
    );
    revealTargets.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('visible'));
    }

    /* -------------------------------------------------------
       Vídeos: só carregam e tocam quando aparecem na tela
       ------------------------------------------------------- */
    const videos = document.querySelectorAll('video.lazy-video');
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    const source = video.querySelector('source[data-src]');
                    if (source) {
                        source.src = source.dataset.src;
                        source.removeAttribute('data-src');
                        video.load();
                    }
                    if (!prefersReducedMotion) video.play().catch(() => { });
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.35 });
        videos.forEach(v => videoObserver.observe(v));
    }
    if (prefersReducedMotion) {
        videos.forEach(v => v.setAttribute('controls', ''));
    }

    /* -------------------------------------------------------
       Roadmap: destaca o mês atual
       ------------------------------------------------------- */
    const now = new Date();
    if (now.getFullYear() === 2026) {
        document.querySelectorAll(`.roadmap-table [data-month="${now.getMonth()}"]`)
            .forEach(cell => cell.classList.add('is-now'));
    }

    /* -------------------------------------------------------
       Hero: fundo animado
       - grade de "sensores" com um pulso de dados atravessando a estufa
       - brotos que crescem ao carregar e balançam na base
       - gotas de água subindo devagar
       ------------------------------------------------------- */
    const heroBg = document.getElementById('heroBg');
    if (heroBg && heroBg.getContext) {
        const ctx = heroBg.getContext('2d');
        const heroEl = heroBg.parentElement;
        const LEAF = '143, 191, 122';
        let W = 0, H = 0, dpr = 1;
        let dots = [], sprouts = [], drops = [];
        let running = true;
        let rafId = 0;
        let heroVisible = true;
        const start = performance.now();

        const rand = (a, b) => a + Math.random() * (b - a);

        function build() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = heroEl.clientWidth;
            H = heroEl.clientHeight;
            heroBg.width = Math.round(W * dpr);
            heroBg.height = Math.round(H * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Grade de sensores
            const gap = W < 700 ? 30 : 38;
            dots = [];
            for (let y = gap / 2; y < H; y += gap) {
                for (let x = gap / 2; x < W; x += gap) dots.push({ x, y });
            }

            // Brotos ao longo da base
            const count = Math.round(W / (W < 700 ? 26 : 30));
            sprouts = [];
            for (let i = 0; i < count; i++) {
                const tall = Math.random() < 0.25;
                sprouts.push({
                    x: (i + rand(0.1, 0.9)) * (W / count),
                    h: tall ? rand(110, 190) : rand(35, 100),
                    phase: rand(0, Math.PI * 2),
                    speed: rand(0.5, 0.9),
                    delay: rand(0, 1.2),
                    leaves: tall ? 3 : Math.random() < 0.5 ? 2 : 1,
                    alpha: rand(0.16, 0.34),
                    lean: rand(-0.15, 0.15)
                });
            }

            // Gotas
            drops = [];
            const nDrops = Math.round(W / 50);
            for (let i = 0; i < nDrops; i++) drops.push(newDrop(true));
        }

        function newDrop(anywhere) {
            return {
                x: rand(0, W),
                y: anywhere ? rand(0, H) : H + rand(0, 40),
                r: rand(1, 2.6),
                v: rand(10, 26),
                wob: rand(0, Math.PI * 2),
                a: rand(0.18, 0.45)
            };
        }

        function drawLeaf(x, y, size, angle, alpha) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(size * 0.5, -size * 0.45, size, 0);
            ctx.quadraticCurveTo(size * 0.5, size * 0.45, 0, 0);
            ctx.fillStyle = `rgba(${LEAF}, ${alpha})`;
            ctx.fill();
            ctx.restore();
        }

        function drawSprout(s, t) {
            const grow = prefersReducedMotion ? 1 :
                Math.min(1, Math.max(0, (t - s.delay) / 2.2));
            if (grow <= 0) return;
            const e = 1 - Math.pow(1 - grow, 3); // ease-out
            const h = s.h * e;
            const sway = prefersReducedMotion ? 0 : Math.sin(t * s.speed + s.phase) * (h * 0.09);
            const baseX = s.x, baseY = H;
            const tipX = baseX + sway + s.lean * h;
            const tipY = baseY - h;
            const cx = baseX + (s.lean * h) * 0.3, cy = baseY - h * 0.55;

            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.quadraticCurveTo(cx, cy, tipX, tipY);
            ctx.strokeStyle = `rgba(${LEAF}, ${s.alpha})`;
            ctx.lineWidth = s.h > 105 ? 2 : 1.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Folhas ao longo do caule (ponto na curva quadrática)
            for (let i = 0; i < s.leaves; i++) {
                const k = 0.45 + (i / Math.max(1, s.leaves)) * 0.45;
                const u = 1 - k;
                const lx = u * u * baseX + 2 * u * k * cx + k * k * tipX;
                const ly = u * u * baseY + 2 * u * k * cy + k * k * tipY;
                const side = i % 2 === 0 ? -1 : 1;
                const size = (8 + s.h * 0.09) * e;
                const ang = side === -1 ? Math.PI + 0.55 + sway * 0.01 : -0.55 + sway * 0.01;
                drawLeaf(lx, ly, size, ang, s.alpha + 0.06);
            }
            // Par de folhas no topo (como o logo)
            const top = (7 + s.h * 0.07) * e;
            drawLeaf(tipX, tipY, top, -Math.PI / 2 - 0.7, s.alpha + 0.1);
            drawLeaf(tipX, tipY, top * 0.85, -Math.PI / 2 + 0.7, s.alpha + 0.1);
        }

        let last = performance.now();
        function frame(now) {
            const t = (now - start) / 1000;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            ctx.clearRect(0, 0, W, H);

            // 1) Grade de sensores com pulso diagonal (dados atravessando a estufa)
            const band = (t * 0.12) % 1.6 - 0.3;
            for (const d of dots) {
                const nx = d.x / W, ny = d.y / H;
                const pos = nx * 0.75 + ny * 0.25;
                const dist = Math.abs(pos - band);
                const pulse = prefersReducedMotion ? 0 : Math.max(0, 1 - dist / 0.12);
                const side = 0.35 + 0.65 * nx;           // mais visível à direita
                const fade = 1 - Math.max(0, ny - 0.6) * 1.6; // some perto dos brotos
                const a = (0.07 + pulse * 0.35) * side * Math.max(0, fade);
                if (a < 0.01) continue;
                ctx.beginPath();
                ctx.arc(d.x, d.y, 1.1 + pulse * 1.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${LEAF}, ${a})`;
                ctx.fill();
            }

            // 2) Gotas subindo
            if (!prefersReducedMotion) {
                for (let i = 0; i < drops.length; i++) {
                    const p = drops[i];
                    p.y -= p.v * dt;
                    p.wob += dt;
                    if (p.y < -10) drops[i] = newDrop(false);
                    const x = p.x + Math.sin(p.wob) * 6;
                    const life = Math.min(1, p.y / (H * 0.35)); // somem ao subir
                    ctx.beginPath();
                    ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${LEAF}, ${p.a * Math.max(0, life)})`;
                    ctx.fill();
                }
            }

            // 3) Brotos na base
            for (const s of sprouts) drawSprout(s, t);

            if (running && !prefersReducedMotion) rafId = requestAnimationFrame(frame);
        }

        build();
        rafId = requestAnimationFrame(frame);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                build();
                if (!running || prefersReducedMotion) {
                    cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(t => { const r = running; running = false; frame(t); running = r; });
                }
            }, 150);
        });

        // Pausa quando o hero sai da tela ou a aba fica oculta
        function setRunning(on) {
            if (on && !running) {
                running = true;
                last = performance.now();
                cancelAnimationFrame(rafId);
                if (!prefersReducedMotion) rafId = requestAnimationFrame(frame);
            } else if (!on) {
                running = false;
                cancelAnimationFrame(rafId);
            }
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => {
                heroVisible = entry.isIntersecting;
                setRunning(heroVisible && !document.hidden);
            }).observe(heroEl);
        }
        document.addEventListener('visibilitychange', () => setRunning(heroVisible && !document.hidden));
    }

    /* -------------------------------------------------------
       Hero: simulação ilustrativa da estufa + decisão da IA
       ------------------------------------------------------- */
    const ui = {
        temp: document.getElementById('vTemp'),
        umid: document.getElementById('vUmid'),
        luz: document.getElementById('vLuz'),
        mTemp: document.getElementById('mTemp'),
        mUmid: document.getElementById('mUmid'),
        mLuz: document.getElementById('mLuz'),
        event: document.getElementById('panelEvent'),
        decision: document.getElementById('decision')
    };

    if (ui.temp) {
        // Faixas ideais ilustrativas (mesmas marcadas nas barras do painel)
        const ideal = { temp: [12, 26], umid: [55, 85], luz: [40, 80] };
        const scale = { temp: 40, umid: 100, luz: 100 };
        const calm = { temp: 21, umid: 68, luz: 62 };

        const events = [
            { msg: 'Imprevisto: excesso de sol', target: { temp: 31, umid: 62, luz: 96 } },
            { msg: 'Imprevisto: tempo seco', target: { temp: 23, umid: 40, luz: 66 } },
            { msg: 'Imprevisto: chuva intensa', target: { temp: 18, umid: 95, luz: 45 } },
            { msg: 'Imprevisto: queda brusca de temperatura', target: { temp: 8, umid: 70, luz: 42 } }
        ];

        const decisions = {
            nada: { icon: 'i-pause', text: 'Não fazer nada' },
            irrigar: { icon: 'i-drop', text: 'Irrigar' },
            travar: { icon: 'i-ban', text: 'Travar a irrigação' },
            proteger: { icon: 'i-shield', text: 'Proteger o cultivo' }
        };

        const state = { ...calm };
        let target = { ...calm };
        let phase = 'calm';
        let tick = 0;
        let eventIndex = 0;
        let lastDecision = 'nada';

        const out = (key, v) => v < ideal[key][0] || v > ideal[key][1];

        function decide() {
            if (out('temp', state.temp) || out('luz', state.luz)) return 'proteger';
            if (state.umid < ideal.umid[0]) return 'irrigar';
            if (state.umid > ideal.umid[1]) return 'travar';
            return 'nada';
        }

        function luzLabel(v) {
            if (v < 40) return 'Baixa';
            if (v <= 80) return 'Média';
            return 'Alta';
        }

        function render() {
            ui.temp.textContent = Math.round(state.temp);
            ui.umid.textContent = Math.round(state.umid);
            ui.luz.textContent = luzLabel(state.luz);
            ui.mTemp.style.width = Math.min(100, (state.temp / scale.temp) * 100) + '%';
            ui.mUmid.style.width = Math.min(100, state.umid) + '%';
            ui.mLuz.style.width = Math.min(100, state.luz) + '%';
            ['temp', 'umid', 'luz'].forEach(k => {
                document.querySelector(`.reading[data-key="${k}"]`).classList.toggle('is-off', out(k, state[k]));
            });

            const d = decide();
            if (d !== lastDecision) {
                lastDecision = d;
                ui.decision.innerHTML =
                    `<svg class="ic"><use href="#${decisions[d].icon}"/></svg><span>${decisions[d].text}</span>`;
                ui.decision.classList.remove('flash');
                void ui.decision.offsetWidth;
                ui.decision.classList.add('flash');
            }
        }

        function step() {
            tick++;
            // Máquina de estados: calmo -> imprevisto -> IA corrige -> calmo
            if (phase === 'calm' && tick >= 3) {
                const ev = events[eventIndex++ % events.length];
                target = { ...ev.target };
                ui.event.textContent = ev.msg;
                phase = 'event';
                tick = 0;
            } else if (phase === 'event' && tick >= 4) {
                target = { ...calm };
                ui.event.textContent = `A estufa autônoma agiu: ${decisions[decide()].text.toLowerCase()}`;
                phase = 'recover';
                tick = 0;
            } else if (phase === 'recover' && tick >= 4) {
                ui.event.textContent = 'Clima: tempo estável';
                phase = 'calm';
                tick = 0;
            }

            Object.keys(state).forEach(k => {
                const noise = (Math.random() - 0.5) * (k === 'temp' ? 0.8 : 2);
                state[k] += (target[k] - state[k]) * 0.42 + noise;
            });
            render();
        }

        render();
        if (!prefersReducedMotion) {
            let timer = setInterval(step, 1500);
            // pausa quando a aba não está visível
            document.addEventListener('visibilitychange', () => {
                clearInterval(timer);
                if (!document.hidden) timer = setInterval(step, 1500);
            });
        }
    }
});
