interface AvatarProps {
  email?: string
}

export default function Avatar({ email }: AvatarProps) {
  const initials = email
    ? email.split('@')[0].slice(0, 2).toUpperCase()
    : '?'

  return (
    <div
      className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold shrink-0"
      aria-label={email}
    >
      {initials}
    </div>
  )
}
