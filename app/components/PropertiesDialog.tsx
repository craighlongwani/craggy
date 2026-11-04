"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

export type PropertiesItem = {
  title: string;
  image: string;
  color: string;
  description: string;
  usedIn: string[];
};

// A Win95 "Properties" dialog with a single General tab: the item's art and
// name at the top, then its details, then OK. Built on <dialog> so Escape,
// focus trapping and the top layer come from the browser; clicking outside
// the window also closes it.
export default function PropertiesDialog({
  item,
  onClose,
}: {
  item: PropertiesItem | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="properties-title"
      className="win95-dialog win95-window m-auto w-[calc(100%-2rem)] max-w-md p-[3px]"
    >
      {item && (
        <>
          <h2
            id="properties-title"
            className="win95-titlebar font-win text-sm md:text-base"
          >
            {item.title} Properties
          </h2>

          <div className="p-2 md:p-3">
            <div className="font-win text-sm">
              <span className="win95-tab inline-block px-3 pt-1 pb-0.5">
                General
              </span>
            </div>

            <div className="win95-tab-panel p-3 md:p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="win95-sunken relative w-24 h-14 shrink-0"
                  style={{ background: item.color }}
                >
                  <Image
                    src={item.image}
                    fill
                    sizes="96px"
                    alt=""
                    className="object-contain p-1"
                  />
                </div>
                <p className="win95-sunken bg-white flex-1 px-2 py-1 text-sm">
                  {item.title}
                </p>
              </div>

              <hr className="win95-etched" />

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-[#404040]">Type:</dt>
                <dd>Skill</dd>
                <dt className="text-[#404040]">Used in:</dt>
                <dd>{item.usedIn.join(", ")}</dd>
              </dl>

              <hr className="win95-etched" />

              <p className="text-sm leading-snug">{item.description}</p>
            </div>

            <div className="flex justify-end mt-3">
              <button
                type="button"
                autoFocus
                onClick={onClose}
                className="win95-raised win95-focus px-6 py-1 text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
