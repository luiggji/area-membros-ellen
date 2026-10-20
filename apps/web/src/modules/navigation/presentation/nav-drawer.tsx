'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useRef } from 'react';

/**
 * Drawer sobre <dialog> nativo: foco preso, Esc fecha e o fundo fica inerte sem lib extra.
 * Fecha sozinho ao navegar, para o destino não ficar escondido atrás do menu.
 */
export function NavDrawer({
  trigger,
  triggerClassName,
  children,
}: {
  /** Conteúdo do botão que abre (ícone + rótulo visível ou `sr-only`). */
  trigger: ReactNode;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className={triggerClassName}
      >
        {trigger}
      </button>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="m-0 h-dvh max-h-none w-[min(20rem,85vw)] bg-cf-sidebar p-0 backdrop:bg-ink/40"
      >
        <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="grid size-11 place-items-center rounded-full text-cream-50 hover:bg-cream-50/8"
            >
              <X aria-hidden className="size-6" strokeWidth={1.6} />
              <span className="sr-only">Fechar menu</span>
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
