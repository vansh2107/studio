

export default function Modal({ open, onClose, children, className }: { open: boolean, onClose: () => void, children: React.ReactNode, className?: string }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div
        className={`bg-card rounded-xl p-6 w-full max-w-2xl shadow-lg border relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
