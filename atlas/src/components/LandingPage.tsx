import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal, type AuthMode } from './AuthModal';
import '../landing.css';

interface Props {
  authOpen: AuthMode | null;
  onOpenAuth: (mode: AuthMode) => void;
  onCloseAuth: () => void;
}

/**
 * Marketing front door. Rendered only for logged-out visitors.
 * All animation lives in one effect with full cleanup on unmount;
 * WebGL is skipped on mobile / reduced-motion / no-WebGL contexts.
 */
export function LandingPage({ authOpen, onOpenAuth, onCloseAuth }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const root = rootRef.current!;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MOBILE = matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
    const FINE_POINTER = matchMedia('(pointer: fine)').matches;
    const WEBGL_OK = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
    const HEAVY = !RM && !MOBILE && WEBGL_OK;
    const MOTION_OK = !RM;

    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    const cleanup: Array<() => void> = [];
    const on = <K extends keyof WindowEventMap>(t: Window, e: K, f: (ev: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
      t.addEventListener(e, f, o); cleanup.push(() => t.removeEventListener(e, f, o));
    };
    const onEl = <K extends keyof HTMLElementEventMap>(el: HTMLElement, e: K, f: (ev: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(e, f); cleanup.push(() => el.removeEventListener(e, f));
    };

    /* ---- word splitting ---- */
    const splitWords = (el: Element, cls: string) => {
      const walk = (node: Element | ChildNode) => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            (n.textContent || '').split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
              else { const sp = document.createElement('span'); sp.className = cls; sp.textContent = part; frag.appendChild(sp); }
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n as Element);
        });
      };
      walk(el);
    };
    root.querySelectorAll('[data-words]').forEach(el => splitWords(el, 'w'));
    root.querySelectorAll('[data-hwords]').forEach(el => {
      splitWords(el, 'hw');
      el.querySelectorAll('.hw').forEach((w, i) => (w as HTMLElement).style.transitionDelay = `${0.34 + i * 0.07}s`);
    });

    /* ---- cinematic entry ---- */
    root.classList.add('enter');
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => root.classList.add('entered')); });
    cleanup.push(() => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); });

    /* ---- scroll state ---- */
    const sections = [...root.querySelectorAll<HTMLElement>('section[data-step]')];
    const panels = sections.map(s => s.querySelector<HTMLElement>('.panel'));
    const dotEls = [...root.querySelectorAll<HTMLElement>('.dots a')];
    const nav = root.querySelector<HTMLElement>('.l-nav')!;
    const progress = root.querySelector<HTMLElement>('.progress')!;
    let scrollSm = window.scrollY;
    let curStep = 0;
    let onStepChange: (i: number) => void = () => {};

    const scrubFrame = () => {
      const vh = innerHeight;
      const doc = document.documentElement;
      const max = doc.scrollHeight - vh;
      scrollSm += (window.scrollY - scrollSm) * (MOTION_OK ? 0.14 : 1);

      progress.style.transform = `scaleX(${max > 0 ? scrollSm / max : 0})`;
      nav.classList.toggle('scrolled', scrollSm > 40);

      sections.forEach((s, i) => {
        const p = panels[i]; if (!p || i === 0) return;
        const r = s.getBoundingClientRect();
        if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) return;
        const d = clamp((r.top + r.height / 2 - vh / 2) / (vh * 0.75), -1.4, 1.4);
        if (MOTION_OK) {
          const ease = Math.sign(d) * Math.pow(Math.abs(d), 1.25);
          p.style.transform = `translateY(${ease * 64}px) scale(${1 - Math.min(Math.abs(ease) * 0.06, 0.1)})`;
          p.style.opacity = String(clamp(1.15 - Math.abs(ease) * 0.9, 0, 1));
        } else {
          p.style.transform = ''; p.style.opacity = '';
        }
      });

      sections.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.top < vh * 0.78 && r.bottom > vh * 0.22) {
          const words = s.querySelectorAll('.w');
          if (!words.length) return;
          const prog = clamp((vh * 0.78 - r.top) / (vh * 0.5), 0, 1);
          const n = Math.floor(prog * words.length * 1.2);
          words.forEach((w, i) => w.classList.toggle('on', i <= n));
        }
      });

      const mid = window.scrollY + vh / 2;
      let active = 0;
      sections.forEach((s, i) => { if (mid >= s.offsetTop) active = i; });
      if (active !== curStep) { curStep = active; onStepChange(active); }
      dotEls.forEach((d, i) => d.classList.toggle('on', i === active));
    };

    /* ---- magnetic buttons ---- */
    if (FINE_POINTER && MOTION_OK) {
      root.querySelectorAll<HTMLElement>('.magnet').forEach(btn => {
        let raf: number | null = null, tx = 0, ty = 0, cx = 0, cy = 0;
        const loop = () => {
          cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
          btn.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
          if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(loop);
          else { raf = null; if (tx === 0 && ty === 0) btn.style.transform = ''; }
        };
        const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
        onEl(btn, 'pointermove', (e: PointerEvent) => {
          const r = btn.getBoundingClientRect();
          tx = clamp((e.clientX - r.left - r.width / 2) * 0.32, -12, 12);
          ty = clamp((e.clientY - r.top - r.height / 2) * 0.42, -9, 9);
          kick();
        });
        onEl(btn, 'pointerleave', () => { tx = 0; ty = 0; kick(); });
      });
    }

    /* ---- orbital layer ---- */
    const orbs = [...root.querySelectorAll<HTMLElement>('.orb')].map(el => ({ el, depth: parseFloat(el.dataset.depth || '0.1') }));
    let orbT = 0;
    const orbitalFrame = () => {
      orbT += 0.004;
      orbs.forEach((o, i) => {
        const drift = MOTION_OK ? Math.sin(orbT * 1.4 + i * 2.1) * 3 : 0;
        const y = -scrollSm * o.depth + drift;
        const x = MOTION_OK ? Math.cos(orbT + i * 1.7) * 2 : 0;
        o.el.style.transform = `translate3d(${x}vw, ${y}px, 0)`;
      });
    };

    /* ---- main loop + optional WebGL ---- */
    let dead = false;
    let loopId = 0;

    const startLightLoop = () => {
      if (MOTION_OK) {
        const loop = () => { if (dead) return; loopId = requestAnimationFrame(loop); scrubFrame(); orbitalFrame(); };
        loopId = requestAnimationFrame(loop);
      } else {
        const settle = () => scrubFrame();
        on(window, 'scroll', settle, { passive: true });
        settle();
        progress.style.transform = 'scaleX(0)';
      }
    };

    if (!HEAVY) {
      const c = canvasRef.current; if (c) c.style.display = 'none';
      startLightLoop();
    } else {
      (async () => {
        const THREE = await import('three');
        const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
        const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
        const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
        const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');
        if (dead) return; // unmounted while chunks loaded

        const BONE = 0xe9e5df;   // off-white — rings + most particles
        const COPPER = 0xd08a63; // brand accent — core + particle minority
        const canvas = canvasRef.current!;
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(innerWidth, innerHeight);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x08110f, 0.06);
        const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
        camera.position.set(2.4, 0.4, 9);

        const sigil = new THREE.Group();
        sigil.position.set(2.2, 0, 0);
        scene.add(sigil);

        const core = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.9, 0),
          new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.9, roughness: 0.18, flatShading: true, emissive: 0x2a1608, emissiveIntensity: 0.5 })
        );
        sigil.add(core);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 32), new THREE.MeshBasicMaterial({ color: 0xf0a878, transparent: true, opacity: 0 }));
        sigil.add(glow);

        const rings: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = [];
        for (let i = 0; i < 5; i++) {
          const r = 1.55 + i * 0.34;
          const torus = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.008 + i * 0.002, 8, 220),
            new THREE.MeshBasicMaterial({ color: BONE, transparent: true, opacity: 0.45 - i * 0.065 })
          );
          torus.rotation.x = Math.PI / 2 + (i - 2) * 0.22;
          torus.rotation.y = i * 0.5;
          torus.userData = { r, speed: 0.10 + i * 0.05 };
          sigil.add(torus); rings.push(torus);
        }

        const shell = new THREE.Mesh(
          new THREE.IcosahedronGeometry(3.4, 1),
          new THREE.MeshBasicMaterial({ color: 0x1e3331, wireframe: true, transparent: true, opacity: 0.35 })
        );
        sigil.add(shell);

        const COUNT = 1500;
        const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
        const cTmp = new THREE.Color();
        const cBone = new THREE.Color(BONE), cCopper = new THREE.Color(COPPER);
        for (let i = 0; i < COUNT; i++) {
          const r = 2.6 + Math.pow(Math.random(), 0.6) * 3.4;
          const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
          pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.7; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
          // ~85% off-white, ~15% copper — atmosphere, not decoration
          cTmp.copy(Math.random() < 0.85 ? cBone : cCopper).multiplyScalar(0.55 + Math.random() * 0.45);
          col[i * 3] = cTmp.r; col[i * 3 + 1] = cTmp.g; col[i * 3 + 2] = cTmp.b;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.032, vertexColors: true, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
        const points = new THREE.Points(pGeo, pMat);
        sigil.add(points);

        scene.add(new THREE.AmbientLight(0x28403c, 1.2));
        const key = new THREE.PointLight(0xd08a63, 60, 40); key.position.set(4, 4, 6); scene.add(key);
        const rim = new THREE.PointLight(0x5fb3a6, 40, 40); rim.position.set(-6, -3, -4); scene.add(rim);

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.7, 0.85, 0.2);
        composer.addPass(bloom);
        composer.addPass(new OutputPass());

        const STEPS = [
          { cam: [2.4, 0.4, 9], sigilX: 2.2, scale: 1.00, bloom: 0.70, spread: 1.00, pOp: 0.50, em: 0.50 },
          { cam: [-1.0, 0.6, 7], sigilX: -2.6, scale: 0.92, bloom: 0.55, spread: 1.10, pOp: 0.32, em: 0.35 },
          { cam: [3.2, 1.2, 6.4], sigilX: 2.4, scale: 1.06, bloom: 0.85, spread: 1.20, pOp: 0.55, em: 0.70 },
          { cam: [0, 3.4, 5.4], sigilX: 0, scale: 1.10, bloom: 1.00, spread: 1.32, pOp: 0.60, em: 0.90 },
          { cam: [0, 0.3, 5.0], sigilX: -2.2, scale: 1.04, bloom: 0.80, spread: 0.92, pOp: 0.42, em: 0.65 },
          { cam: [0, 0.1, 6.6], sigilX: 0, scale: 1.22, bloom: 1.15, spread: 1.05, pOp: 0.62, em: 1.20 },
        ] as const;
        const S0 = STEPS[0];
        const smooth = { cam: new THREE.Vector3(...S0.cam), sigilX: S0.sigilX as number, scale: S0.scale as number, bloom: S0.bloom as number, spread: S0.spread as number, pOp: S0.pOp as number, em: S0.em as number };
        const tgt = { cam: new THREE.Vector3(...S0.cam), sigilX: S0.sigilX as number, scale: S0.scale as number, bloom: S0.bloom as number, spread: S0.spread as number, pOp: S0.pOp as number, em: S0.em as number };

        onStepChange = (i: number) => {
          const S = STEPS[i];
          tgt.cam.set(...(S.cam as unknown as [number, number, number]));
          tgt.sigilX = S.sigilX; tgt.scale = S.scale; tgt.bloom = S.bloom; tgt.spread = S.spread; tgt.pOp = S.pOp; tgt.em = S.em;
        };
        onStepChange(0);

        const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        on(window, 'pointermove', (e: PointerEvent) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

        let exploded = 0, explodeTgt = 0, explodeTimer = 0;
        onEl(canvas, 'pointerdown', () => { explodeTgt = 1; explodeTimer = window.setTimeout(() => explodeTgt = 0, 420); });
        cleanup.push(() => clearTimeout(explodeTimer));

        let hidden = false;
        const onVis = () => { hidden = document.hidden; };
        document.addEventListener('visibilitychange', onVis);
        cleanup.push(() => document.removeEventListener('visibilitychange', onVis));

        const clock = new THREE.Clock();
        const ease = 0.06;
        const glFrame = () => {
          const t = clock.getElapsedTime();
          if (hidden) return;
          smooth.cam.lerp(tgt.cam, ease);
          smooth.sigilX += (tgt.sigilX - smooth.sigilX) * ease;
          smooth.scale += (tgt.scale - smooth.scale) * ease;
          smooth.bloom += (tgt.bloom - smooth.bloom) * ease;
          smooth.spread += (tgt.spread - smooth.spread) * ease;
          smooth.pOp += (tgt.pOp - smooth.pOp) * ease;
          smooth.em += (tgt.em - smooth.em) * ease;
          exploded += (explodeTgt - exploded) * 0.12;
          mouse.x += (mouse.tx - mouse.x) * 0.05;
          mouse.y += (mouse.ty - mouse.y) * 0.05;

          const camDrift = scrollSm * 0.00022;
          camera.position.set(smooth.cam.x + mouse.x * 0.6, smooth.cam.y - mouse.y * 0.4 - camDrift, smooth.cam.z);
          camera.lookAt(0, 0, 0);

          sigil.position.x = smooth.sigilX + mouse.x * 0.3;
          const pulse = 1 + Math.sin(t * 1.4) * 0.02 + exploded * 0.18;
          sigil.scale.setScalar(smooth.scale * pulse);
          sigil.rotation.y = t * 0.12 + mouse.x * 0.2;
          sigil.rotation.x = Math.sin(t * 0.2) * 0.08 + mouse.y * 0.12;

          core.rotation.y = t * 0.3; core.rotation.x = t * 0.18;
          core.material.emissiveIntensity = smooth.em + exploded * 1.4;
          glow.material.opacity = 0.12 + Math.sin(t * 2) * 0.05 + exploded * 0.4;
          glow.scale.setScalar(1 + exploded * 0.6);

          rings.forEach((r, i) => {
            r.rotation.z = t * r.userData.speed * (1 + exploded * 1.5);
            r.scale.setScalar(smooth.spread * (1 + exploded * 0.5));
            r.material.opacity = (0.45 - i * 0.065) * (0.7 + smooth.pOp * 0.3) + exploded * 0.3;
          });

          const sh = 1 + Math.sin(t * 0.8) * 0.05 + exploded * 0.3;
          shell.scale.setScalar(sh);
          shell.rotation.y = -t * 0.06;
          shell.material.opacity = 0.20 + smooth.pOp * 0.16;

          points.rotation.y = t * 0.03;
          pMat.opacity = smooth.pOp * (0.7 + Math.sin(t * 1.2) * 0.1) + exploded * 0.3;
          pMat.size = 0.032 + exploded * 0.05;

          bloom.strength = smooth.bloom + exploded * 0.6;
          composer.render();
        };

        const onResize = () => {
          camera.aspect = innerWidth / innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(innerWidth, innerHeight);
          composer.setSize(innerWidth, innerHeight);
        };
        on(window, 'resize', onResize);

        const loop = () => { if (dead) return; loopId = requestAnimationFrame(loop); scrubFrame(); orbitalFrame(); glFrame(); };
        loopId = requestAnimationFrame(loop);

        cleanup.push(() => {
          renderer.dispose();
          pGeo.dispose(); pMat.dispose();
          core.geometry.dispose(); core.material.dispose();
          glow.geometry.dispose(); (glow.material as THREE.Material).dispose();
          rings.forEach(r => { r.geometry.dispose(); r.material.dispose(); });
          shell.geometry.dispose(); (shell.material as THREE.Material).dispose();
          composer.dispose();
        });
      })().catch(() => {
        // WebGL failed mid-init — fall back to the light experience.
        const c = canvasRef.current; if (c) c.style.display = 'none';
        if (!dead && !loopId) startLightLoop();
      });
    }

    /* ---- dots navigation ---- */
    dotEls.forEach((a, i) => {
      onEl(a, 'click', (ev: Event) => {
        ev.preventDefault();
        sections[i]?.scrollIntoView({ behavior: MOTION_OK ? 'smooth' : 'auto' });
      });
    });

    return () => {
      dead = true;
      cancelAnimationFrame(loopId);
      cleanup.forEach(fn => fn());
    };
  }, []);

  return (
    <div className="landing" ref={rootRef}>
      <div className="progress" aria-hidden="true"></div>

      <canvas className="gl" ref={canvasRef} aria-hidden="true"></canvas>
      <div className="orbital" aria-hidden="true">
        <div className="orb o1" data-depth="0.06"></div>
        <div className="orb o2" data-depth="0.11"></div>
        <div className="orb o3" data-depth="0.16"></div>
      </div>
      <div className="vignette" aria-hidden="true"></div>

      <nav className="l-nav" aria-label="Main">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="The Atlas Path — back to top">
          <span>The Atlas <em>Path</em></span>
        </button>
        <div className="nav-cta">
          <button className="btn btn-ghost magnet" onClick={() => onOpenAuth('signin')}>Log in</button>
          <button className="btn btn-solid magnet" onClick={() => onOpenAuth('signup')}>Register — free</button>
        </div>
      </nav>

      <div className="dots" role="navigation" aria-label="Section progress">
        <a href="#s0" aria-label="Go to section 1: Introduction"></a>
        <a href="#s1" aria-label="Go to section 2: The problem"></a>
        <a href="#s2" aria-label="Go to section 3: The method"></a>
        <a href="#s3" aria-label="Go to section 4: Why it is different"></a>
        <a href="#s4" aria-label="Go to section 5: Two promises"></a>
        <a href="#s5" aria-label="Go to section 6: Get started"></a>
      </div>

      <main className="scroll">
        <section id="s0" data-step="0" aria-label="Introduction">
          <div className="wrap">
            <div className="panel">
              <div className="kicker">A career research engine</div>
              <h1 data-hwords>Career direction you can <span className="it">actually trust.</span></h1>
              <p className="lede">Real instruments. Real European labor-market data. One testable next step — grown from your data into a mark that's yours alone.</p>
              <div className="hero-cta">
                <button className="btn btn-solid btn-big magnet" onClick={() => onOpenAuth('signup')}>Create free account <span className="arr" aria-hidden="true">→</span></button>
                <button className="btn btn-ghost btn-big magnet" onClick={() => onOpenAuth('signin')}>Log in</button>
              </div>
              <div className="micro"><span><b>Free</b> means free — there's no paid tier behind it</span><span><b>EU</b> · GDPR</span><span><b>Yours</b> · export + erase</span></div>
            </div>
          </div>
          <div className="cue" aria-hidden="true"><span>Scroll</span><div className="line"></div></div>
        </section>

        <section id="s1" data-step="1" className="center" aria-label="The problem">
          <div className="wrap"><div className="panel">
            <div className="kicker" style={{ justifyContent: 'center' }}>The problem</div>
            <p className="big-state" data-words>Most career tools are a <span className="it">racket</span> — a flattering label first, a paywall after, your data in someone else's hands by the end.</p>
            <p className="sub">A five-minute quiz declares you a "Visionary Architect," then charges you to find out what it means. You're left with a horoscope, not a direction.</p>
          </div></div>
        </section>

        <section id="s2" data-step="2" className="center" aria-label="The method">
          <div className="wrap"><div className="panel">
            <div className="kicker" style={{ justifyContent: 'center' }}>The method</div>
            <p className="big-state" data-words>Direction built like <span className="teal">research</span>, not a horoscope.</p>
            <p className="sub">Four steps — profile, directions, live market, one experiment. Each produces evidence you can check, not vibes you're asked to believe.</p>
            <div className="chips" aria-label="Instruments and datasets used">
              <span className="chip"><i style={{ background: '#5b9bc8' }} aria-hidden="true"></i>IPIP-NEO-120</span>
              <span className="chip"><i style={{ background: '#5fb3a6' }} aria-hidden="true"></i>Work Values</span>
              <span className="chip"><i style={{ background: '#5aad6a' }} aria-hidden="true"></i>ESCO</span>
              <span className="chip"><i style={{ background: '#d4b85e' }} aria-hidden="true"></i>EURES</span>
            </div>
          </div></div>
        </section>

        <section id="s3" data-step="3" className="center" aria-label="Why it is different">
          <div className="wrap"><div className="panel">
            <div className="kicker" style={{ justifyContent: 'center' }}>Why it's different</div>
            <p className="big-state" data-words>Named instruments. <span className="it">Live data.</span> No black box.</p>
            <p className="sub">Every score names its source. Every market claim names its dataset. Nothing asks to be taken on faith.</p>
          </div></div>
        </section>

        <section id="s4" data-step="4" className="center" aria-label="Two promises">
          <div className="wrap"><div className="panel">
            <div className="kicker" style={{ justifyContent: 'center' }}>Two promises</div>
            <p className="big-state" data-words><span className="it">Free</span> is not a funnel. Your data is <span className="teal">yours</span>, full stop.</p>
            <p className="sub">There's no card, no trial clock, and no paid tier waiting behind the free one. Export everything as CSV or JSON, or permanently erase it, whenever you want. EU-hosted, never sold.</p>
          </div></div>
        </section>

        <section id="s5" data-step="5" className="center final" aria-label="Get started">
          <div className="wrap"><div className="panel">
            <h2>Stop guessing.<br /><span className="it">Start testing.</span></h2>
            <p className="sub">Build your profile, see real directions against real EU market data, leave with one experiment you can run. It costs nothing. It stays yours.</p>
            <div className="hero-cta">
              <button className="btn btn-solid btn-big magnet" onClick={() => onOpenAuth('signup')}>Create free account <span className="arr" aria-hidden="true">→</span></button>
              <button className="btn btn-ghost btn-big magnet" onClick={() => onOpenAuth('signin')}>Log in</button>
            </div>
            <div className="micro"><span>FREE</span><span>·</span><span>NO FEES</span><span>·</span><span>NO SUBSCRIPTIONS</span><span>·</span><span>YOUR DATA, YOURS</span><span>·</span><span>EU</span></div>
          </div></div>
        </section>
      </main>

      <footer className="l-footer">
        <span>The Atlas Path — career direction you can trust</span>
        <span>
          <button onClick={() => navigate('/privacy')} style={{ marginRight: '22px' }}>Privacy</button>
          <button onClick={() => onOpenAuth('signin')}>Log in</button>
          <button onClick={() => onOpenAuth('signup')}>Register</button>
        </span>
      </footer>

      <svg className="grain" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>

      <AuthModal open={authOpen} onClose={onCloseAuth} />
    </div>
  );
}
