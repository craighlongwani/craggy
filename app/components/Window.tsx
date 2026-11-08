import type { ReactNode } from "react";

// A window: a title bar carrying the box's label over its body (styled by
// the linux skin in globals.css: a 1px frame, the titlebar's rule and
// layout, the body's padding). Grid spans and body layout come in through
// the class props.
export default function Window({
  title,
  className = "",
  bodyClassName = "",
  id,
  children,
}: {
  title: ReactNode;
  className?: string;
  bodyClassName?: string;
  // Anchor for #hash URLs to jump to this window
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`win95-window flex flex-col min-h-0 ${className}`}>
      <h2 className="win95-titlebar shrink-0">{title}</h2>
      <div className={`flex-1 min-h-0 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
