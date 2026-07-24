import { useRef, useLayoutEffect, useState } from 'react';

// Measures a container's rendered width and reports it (clamped) so SVG charts
// can compute geometry from real pixels instead of downscaling a fixed viewBox.
// Defaults keep desktop pixel-identical (initial 760 == current constant).
interface Options {
  initial?: number;
  min?: number;
  max?: number;
}

export function useElementWidth<T extends HTMLElement = HTMLDivElement>(
  options: Options = {},
) {
  const { initial = 760, min = 280, max = 760 } = options;
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(initial);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setWidth(Math.min(max, Math.max(min, w)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [min, max]);

  return [ref, width] as const;
}
