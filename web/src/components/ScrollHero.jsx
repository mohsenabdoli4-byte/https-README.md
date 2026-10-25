import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Clock, BadgeCheck } from 'lucide-react';
import { PHOTOS } from '../lib/images.js';

/* ------------------------------------------------------------------------- *
 * Scroll-driven cinematic hero
 * ------------------------------------------------------------------------- *
 * The user's scroll position drives `video.currentTime`. The video is NEVER
 * played: no `play()`, no autoplay, no loop. It is scrubbed frame by frame,
 * so stopping the scroll freezes the scene on that exact frame and scrolling
 * back up walks the timeline backwards.
 *
 * HOW IT WORKS
 *   - The <section> is 300vh tall (260vh on phones) and its child is
 *     `position: sticky; top: 0; height: 100vh`, so the viewport is pinned
 *     while the page scrolls through the section.
 *   - scrollProgress = (scrollY - sectionTop) / (sectionHeight - viewportHeight)
 *     so 0 -> first frame and 1 -> last frame, exactly.
 *   - The scroll listener is passive and does ONE cheap thing: it stores the
 *     target progress. Nothing touches the video there.
 *   - A single requestAnimationFrame loop runs only while the section is on
 *     screen (IntersectionObserver) and:
 *        * eases `current` toward `target` (frame-rate independent exponential
 *          smoothing, so the scrub stays glued to the scroll but never snaps),
 *        * writes `video.currentTime` only when the value moved by more than
 *          SEEK_EPSILON — this is what prevents a flood of redundant seeks,
 *        * fades the copy out with plain style writes (never React state, so
 *          scrolling never re-renders the page).
 *
 * ENCODING / SEEKING NOTES  (important if this clip is ever replaced)
 *   The clip supplied for this hero was 8s / 192 frames @24fps encoded with a
 *   SINGLE keyframe, so every `currentTime` write would have to decode from
 *   frame 0 — guaranteed stutter when scrubbing. The files in
 *   `web/public/video` are re-encodes tuned for random access:
 *     - a keyframe every 6 frames (0.25s) => a seek decodes at most 6 frames
 *     - H.264 High/Main profile, yuv420p, `+faststart` (moov atom first)
 *     - CRF 20 (desktop) / CRF 23 (mobile), no audio track (never used)
 *     - native 864x480 source resolution — upscaling adds no detail
 *     - an optimized VP9/WebM variant ships as an extra fallback source
 *   Keep those characteristics for any replacement video: frequent keyframes,
 *   moderate bitrate, web-friendly container, modest resolution.
 * ------------------------------------------------------------------------- */

const MOBILE_QUERY = '(max-width: 767px)';

const TEXT_FADE_END = 0.34; // copy is fully faded out after this much progress
const SMOOTHING = 0.18; // exponential smoothing factor, expressed per 60fps frame
const SEEK_EPSILON = 0.035; // seconds; ~0.85 of a 24fps frame — ignores sub-frame seeks

// Subtle readability scrim: opaque behind the copy (the "start" edge, right in
// RTL), fully transparent across most of the frame so the video stays dominant.
const SCRIM = {
  background:
    'linear-gradient(to left, rgba(56,39,43,0.72) 0%, rgba(56,39,43,0.46) 26%, rgba(56,39,43,0.10) 58%, rgba(56,39,43,0) 82%)',
};

function HeroCopy({ hero, innerRef }) {
  return (
    <div ref={innerRef} className="max-w-xl will-change-[opacity,transform]">
      <p className="text-xs font-bold tracking-[0.18em] text-strawberry">{hero?.eyebrow}</p>
      <h1 className="h-display mt-4 text-4xl text-cream drop-shadow-[0_2px_18px_rgba(56,39,43,0.55)] sm:text-5xl lg:text-[3.5rem]">
        {hero?.headline}
      </h1>
      <p className="mt-5 max-w-md text-base leading-relaxed text-cream/90 drop-shadow-[0_1px_10px_rgba(56,39,43,0.5)] sm:text-lg">
        {hero?.subtext}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={hero?.primaryCta?.href || '/shop'} className="btn bg-cream text-cocoa hover:bg-white active:scale-[0.98]">
          {hero?.primaryCta?.label || 'مشاهده محصولات'}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
        <Link
          to={hero?.secondaryCta?.href || '/custom-cake'}
          className="btn border border-cream/45 bg-white/10 text-cream backdrop-blur-sm hover:bg-white/20 active:scale-[0.98]"
        >
          {hero?.secondaryCta?.label || 'سفارش کیک سفارشی'}
        </Link>
      </div>
      <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
        {[
          { icon: Truck, label: 'ارسال محلی' },
          { icon: Clock, label: 'پخت به سفارش' },
          { icon: BadgeCheck, label: 'پرداخت دستی' },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 text-xs font-semibold text-cream/85">
            <f.icon className="h-4 w-4 text-strawberry" />
            {f.label}
          </div>
        ))}
      </dl>
      <p className="mt-8 flex items-center gap-2 text-[11px] font-medium tracking-wide text-cream/70">
        <span aria-hidden className="grid h-6 w-4 place-items-center rounded-full border border-cream/50">
          <span className="block h-1.5 w-[2px] animate-bounce rounded-full bg-cream/80" />
        </span>
        برای حرکت در صحنه اسکرول کنید
      </p>
    </div>
  );
}

export default function ScrollHero({ hero }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const copyRef = useRef(null);
  const barRef = useRef(null);
  const readyRef = useRef(false);

  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [revealed, setRevealed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const isStatic = reduced || failed;
  const fallbackImage = useMemo(() => hero?.image || PHOTOS.cakes[0], [hero?.image]);

  // Pick the source once, in JS: the phone encode on small screens, the desktop
  // encode otherwise. H.264 hardware decoding gives the smoothest scrubbing, so
  // the VP9/WebM variant is only used where the browser cannot play H.264.
  const videoSrc = useMemo(() => {
    if (typeof window === 'undefined') return '/video/hero-desktop.mp4';
    if (window.matchMedia(MOBILE_QUERY).matches) return '/video/hero-mobile.mp4';
    const probe = document.createElement('video');
    return probe.canPlayType('video/mp4; codecs="avc1.42E01E"') === ''
      ? '/video/hero-desktop.webm'
      : '/video/hero-desktop.mp4';
  }, []);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  // Respect the OS reduced-motion preference, live.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Loading state, buffered progress and the "video failed" fallback.
  useEffect(() => {
    if (isStatic) return;
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    const onLoadedData = () => setRevealed(true);
    const onCanPlayThrough = () => setReady(true);
    const onVideoError = () => setFailed(true);
    const onProgress = () => {
      const { buffered, duration } = video;
      if (!buffered.length || !Number.isFinite(duration) || duration <= 0) return;
      const ratio = Math.min(1, buffered.end(buffered.length - 1) / duration);
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio.toFixed(3)})`;
    };

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('error', onVideoError);
    video.addEventListener('progress', onProgress);

    // The element never even got metadata -> treat the clip as broken and let
    // the static hero take over, so the site is never left with a dead hero.
    const watchdog = window.setTimeout(() => {
      if (video.readyState === 0) setFailed(true);
    }, 10000);
    // Never hold the experience hostage on a slow connection: once the first
    // frame is decoded we allow scrubbing and keep buffering in the background.
    const unlock = window.setTimeout(() => {
      if (video.readyState >= 2) setReady(true);
    }, 5000);

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('error', onVideoError);
      video.removeEventListener('progress', onProgress);
      window.clearTimeout(watchdog);
      window.clearTimeout(unlock);
    };
  }, [isStatic]);

  // The scroll -> timeline engine.
  useEffect(() => {
    if (isStatic) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    video.pause();

    let target = 0; // driven by scroll only
    let current = 0; // eased value actually sent to the video
    let lastSeek = -1;
    let lastCopy = -1;
    let rafId = 0;
    let running = false;
    let lastFrameAt = 0;
    let geomTop = 0;
    let geomRange = 1;

    const measure = () => {
      const rect = section.getBoundingClientRect();
      geomTop = rect.top + window.scrollY;
      geomRange = Math.max(1, rect.height - window.innerHeight);
    };

    // Cheap arithmetic only — no layout reads in the scroll handler.
    const readProgress = () => {
      const p = (window.scrollY - geomTop) / geomRange;
      target = p < 0 ? 0 : p > 1 ? 1 : p;
    };

    const seekTo = (progress) => {
      const { duration } = video;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const time = Math.min(duration, progress * duration);
      lastSeek = time;
      video.currentTime = time;
    };

    // Direct DOM writes: the copy must never re-render React on scroll.
    const applyCopy = (progress) => {
      const el = copyRef.current;
      if (!el) return;
      const t = progress < TEXT_FADE_END ? progress / TEXT_FADE_END : 1;
      const opacity = 1 - t;
      if (Math.abs(opacity - lastCopy) < 0.004) return;
      lastCopy = opacity;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(0, ${(-t * 36).toFixed(1)}px, 0)`;
      el.style.pointerEvents = opacity < 0.12 ? 'none' : '';
    };

    const tick = (now) => {
      const dt = lastFrameAt ? Math.min((now - lastFrameAt) / 1000, 0.05) : 1 / 60;
      lastFrameAt = now;

      if (readyRef.current) {
        // Frame-rate independent easing: responsive, but no harsh jumps.
        const alpha = 1 - Math.pow(1 - SMOOTHING, dt * 60);
        current += (target - current) * alpha;
        if (Math.abs(target - current) < 0.0004) current = target;

        const { duration } = video;
        if (Number.isFinite(duration) && duration > 0 && video.readyState >= 2) {
          const time = Math.min(duration, current * duration);
          // Only seek on a meaningful change — this is what stops the flood.
          if (lastSeek < 0 || Math.abs(time - lastSeek) >= SEEK_EPSILON) {
            lastSeek = time;
            video.currentTime = time;
          }
        }
      } else {
        // Video not sufficiently buffered yet: hold the first frame and let the
        // scroll position accumulate. The easing catches up smoothly once ready.
        current = 0;
      }

      applyCopy(current);
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastFrameAt = 0;
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
    };

    const onScroll = () => readProgress();
    const onResize = () => {
      measure();
      readProgress();
    };

    // The loop only runs while the hero is on screen — no idle rAF on the site.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          measure();
          readProgress();
          start();
        } else {
          stop();
          const edge = entry.boundingClientRect.top > 0 ? 0 : 1;
          target = edge;
          current = edge;
          lastSeek = -1;
          applyCopy(edge);
          seekTo(edge);
        }
      },
      { rootMargin: '10% 0px' }
    );
    observer.observe(section);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(document.body);

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [isStatic]);

  // Reduced motion or a broken video: a simple static hero, still on brand.
  if (isStatic) {
    return (
      <section className="relative h-[100svh] min-h-[540px] w-full overflow-hidden bg-cocoa">
        <img
          src={failed ? fallbackImage : '/video/hero-poster.jpg'}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0" style={SCRIM} aria-hidden />
        <div className="absolute inset-0">
          <div className="container-x flex h-full items-center">
            <HeroCopy hero={hero} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="hero-pin relative w-full bg-cocoa">
      <div className="hero-viewport sticky top-0 w-full overflow-hidden bg-cocoa">
        {/* Poster layer: the video fades in over it, so the hero never shows a
            blank black rectangle while the clip is preparing. */}
        <img
          src="/video/hero-poster.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />

        <video
          ref={videoRef}
          src={videoSrc}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            revealed ? 'opacity-100' : 'opacity-0'
          }`}
          poster="/video/hero-poster.jpg"
          preload="auto"
          muted
          playsInline
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate nofullscreen"
          // Safety net: nothing in this component plays the clip, and if anything
          // ever tries to, it is stopped immediately.
          onPlay={(e) => e.currentTarget.pause()}
          onLoadedMetadata={(e) => e.currentTarget.pause()}
          aria-hidden
          tabIndex={-1}
        />

        {/* Subtle scrims — the video stays visually dominant. */}
        <div className="pointer-events-none absolute inset-0" style={SCRIM} aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-cream/70 to-transparent"
          aria-hidden
        />

        {/* Minimal loading treatment (no big spinner). */}
        <div
          className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${
            ready ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-cream/85">
              آماده‌سازی صحنه…
            </span>
            <span className="block h-[2px] w-28 overflow-hidden rounded-full bg-cream/25">
              <span
                ref={barRef}
                className="block h-full w-full origin-right scale-x-0 bg-cream transition-transform duration-300"
              />
            </span>
          </div>
        </div>

        <div className="absolute inset-0">
          <div className="container-x flex h-full items-center">
            <HeroCopy hero={hero} innerRef={copyRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
