"use client";
import { useEffect } from "react";
import { consumeSelfHash, hashProject, syncProjectFromUrl } from "../lib/project";
import { hashId, scrollToWindow } from "../lib/windowScroll";
import { isBoard, jumpToBoard, settleOnBoard } from "./linux/boards";

// Deep links: /#about scrolls to that window, /#projects to that board, and
// /#projects/<slug> opens that project over its board. The page's own
// scroll area does the scrolling, since the page itself doesn't scroll.
// Also follows the URL on Back/Forward and on a typed hash, without
// reloading. Renders nothing: it's the home page's only page-level script.
export default function HashSync() {
  useEffect(() => {
    let poppedAt = -Infinity;
    const jump = () => {
      const id = hashId();
      if (!id) return;
      // A project: its board goes under it (so closing lands on its card)
      // and it opens right away
      if (hashProject()) {
        document.getElementById("projects")?.scrollIntoView({ block: "start" });
        const stop = settleOnBoard("projects");
        syncProjectFromUrl();
        return stop;
      }
      let stop = () => {};
      const frame = requestAnimationFrame(() => {
        if (isBoard(id)) {
          jumpToBoard(id);
          stop = settleOnBoard(id);
        } else scrollToWindow(id);
      });
      return () => {
        cancelAnimationFrame(frame);
        stop();
      };
    };

    let cancel = jump();
    const onPop = () => {
      poppedAt = performance.now();
      syncProjectFromUrl();
    };
    const onHash = () => {
      // Opening/closing a project changed the hash itself: nothing to follow
      if (consumeSelfHash()) return;
      // Back/Forward over a project fires this too, right after popstate,
      // which already handled it (and the board mustn't move under the
      // window shrinking back into it)
      const id = hashId();
      const popped = performance.now() - poppedAt < 100;
      if (popped && (!id || id === "projects" || hashProject())) return;
      cancel?.();
      cancel = jump();
      syncProjectFromUrl();
    };
    // Back/Forward (layout.tsx relays it as lx-popstate)
    window.addEventListener("lx-popstate", onPop);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancel?.();
      window.removeEventListener("lx-popstate", onPop);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  return null;
}
