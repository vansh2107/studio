

export default function Modal({ open, onClose, children, className }: { open: boolean, onClose: () => void, children: React.ReactNode, className?: string }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[8000]"
    >
      <div
        className={`bg-card rounded-xl p-6 w-full max-w-2xl shadow-lg border relative z-[9000] overflow-visible ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
