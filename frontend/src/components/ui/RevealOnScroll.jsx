import { useEffect, useRef, useState } from "react";

function RevealOnScroll({ children, className = "", delayClass = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal ${delayClass} ${visible ? "is-visible" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}

export default RevealOnScroll;
