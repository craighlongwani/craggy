"use client";
import { useEffect, useRef, useState } from "react";
import {
  closeCurtain,
  CLOSE_TOTAL_MS,
  fadeDim,
  openCurtain,
  prefersReducedMotion,
} from "../../lib/curtain";
import { withBasePath } from "../../lib/site";

const RESUME = withBasePath("/Jed-Lawrence-Engbino-Resume.pdf");

// 25% wider than a project's page window (62.5vw on wide screens, 93.75vw on
// tablets, the full width on phones), never wider than the screen
const WIDER = 1.25;

function windowWidth() {
  const vw = window.innerWidth;
  const base = vw >= 1024 ? vw * 0.625 : vw >= 768 ? vw * 0.9375 : vw - 24;
  return Math.min(base * WIDER, vw - 32);
}

// The résumé button beside the name, and the window it opens: the PDF in a
// pop-up over the dimmed page. It opens and closes like a project's window:
// the page dims as the cursor drags the window out, and closing squishes it
// shut as the dim fades. Built on <dialog>, so focus trapping and the top
// layer come from the browser; Escape and clicking outside also close it.
export default function ResumeButton() {
  const ref = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const anims = useRef<Animation[]>([]);
  const closing = useRef(false);

  const stopAnims = () => {
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
  };

  // The PDF loads on the first open, so the page isn't weighed down by it
  const open = () => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    setOpened(true);
    dialog.style.width = `${windowWidth()}px`;
    dialog.showModal();
    if (prefersReducedMotion()) return;
    stopAnims();
    anims.current = [openCurtain(dialog), fadeDim(dialog, true, "::backdrop")];
  };

  // Plays the close, then closes the dialog for real (onClose cleans up)
  const close = () => {
    const dialog = ref.current;
    if (!dialog?.open || closing.current) return;
    if (prefersReducedMotion()) {
      dialog.close();
      return;
    }
    closing.current = true;
    stopAnims();
    const squish = closeCurtain(dialog);
    const undim = fadeDim(dialog, false, "::backdrop");
    anims.current = [squish, undim];
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      dialog.close();
    };
    const timer = setTimeout(finish, CLOSE_TOTAL_MS + 150);
    Promise.all([squish.finished, undim.finished]).then(finish, () => {});
  };

  useEffect(() => () => anims.current.forEach((a) => a.cancel()), []);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="lx-btn shrink-0"
      >
        resume
      </button>

      <dialog
        ref={ref}
        className="skill-window win95-window m-auto h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] flex-col open:flex"
        aria-labelledby="resume-window-title"
        onCancel={(e) => {
          // Escape: play the close instead of vanishing
          e.preventDefault();
          close();
        }}
        onClose={() => {
          stopAnims();
          closing.current = false;
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="win95-titlebar flex shrink-0 items-center gap-2">
          <h2
            id="resume-window-title"
            className="min-w-0 flex-1 text-sm leading-tight md:text-base"
          >
            Jed-Lawrence-Engbino-Resume.pdf
          </h2>
          <a
            href={RESUME}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs underline underline-offset-2"
          >
            open in new tab
          </a>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="win95-raised grid h-3.5 w-4 shrink-0 place-items-center text-xs font-bold leading-none md:h-4 md:w-[18px]"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 p-1.5 md:p-2">
          {opened && (
            <iframe
              src={`${RESUME}#view=FitH&navpanes=0`}
              title="Resume (PDF)"
              className="h-full w-full border-0 bg-white"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
