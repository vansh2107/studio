
export default function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]"
      // onClick={onClose} // Removed to prevent closing on backdrop click
    >
      <div
        className="bg-card rounded-xl p-6 w-full max-w-2xl shadow-lg border relative" // Added relative for positioning close button
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
