// app/template.tsx
"use client";
import { motion } from "motion/react";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { arrivedFromMinimize } from "./lib/anchor";

export default function Template({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handlePopState = () => {
      // Create overlay
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: black;
        z-index: 999;
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      `;
      document.body.appendChild(overlay);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.opacity = "1";
        });
      });

      setTimeout(() => {
        overlay.remove();
      }, 500);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router]);

  // Pages with a taskbar run their own animation instead: windows restoring
  // from their taskbar icon. /projects always does; home does when you
  // arrive from another taskbar page.
  if (
    pathname === "/projects" ||
    (pathname === "/" && arrivedFromMinimize())
  ) {
    return <>{children}</>;
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black z-[100] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.05, ease: "easeOut", delay: 0.1 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        onAnimationStart={() => {
          document.body.style.overflow = "hidden";
        }}
        onAnimationComplete={() => {
          document.body.style.overflow = "";
        }}
      >
        {children}
      </motion.div>
    </>
  );
}