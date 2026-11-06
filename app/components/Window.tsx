import type { ReactNode } from "react";

// A Windows 95 style window: blue title bar carrying the box's label, gray
// beveled body. Grid spans and body layout come in through the class props.
export default function Window({
  title,
  className = "",
  bodyClassName = "",
  project,
  id,
  children,
}: {
  title: ReactNode;
  className?: string;
  bodyClassName?: string;
  // Tags a project's window so it can expand into / collapse from its page
  project?: string;
  // Anchor used by the Start menu and #hash URLs to jump to this window
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-window={id}
      data-project={project}
      className={`win95-window flex flex-col min-h-0 ${className}`}
    >
      <h2 className="win95-titlebar font-win flex items-center gap-1.5 text-sm md:text-base shrink-0">
        {title}
      </h2>
      <div className={`flex-1 min-h-0 p-1.5 md:p-2 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
