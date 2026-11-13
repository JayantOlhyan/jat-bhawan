"use client";

import { useEffect, useRef } from "react";

/** Native <dialog> modal (focus trap, Esc, inert background). */
export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      className={`m-auto max-h-[90dvh] overflow-y-auto rounded-lg border border-rule bg-paper-2 p-0 text-ink `}
      style={{ width: `min(${wide ? "44rem" : "30rem"}, calc(100vw - 2rem))` }}
    >
      <div className="flex items-center justify-between border-b border-rule bg-paper-3 px-5 py-3">
        <h2 className="font-sans text-lg font-semibold">{title}</h2>
        <button type="button" className="btn btn-quiet min-h-10 px-3" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="p-5">{open && children}</div>
    </dialog>
  );
}
