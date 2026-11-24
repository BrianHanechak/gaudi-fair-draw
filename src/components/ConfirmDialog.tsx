import { useEffect, useRef, type ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <h2 className="dialog__title">{title}</h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <button type="button" className="button" onClick={onClose}>
          Keep playing
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
