import { ArrowUp, Camera } from 'lucide-react'
import { useContent } from '../hooks/useContent'
import { useSiteContent } from '../hooks/useSiteContent'

export default function Footer() {
  const { content } = useContent()
  const { profile } = useSiteContent()
  const instagram = profile.socials.instagram
  return (
    <footer className="relative bg-blush py-12">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/40 to-transparent"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-start">
        <div className="text-sm">
          <p className="font-bold text-plum">{profile.name}</p>
          <p className="mt-1">
            © {new Date().getFullYear()} {profile.name}. {content.footer.rights}
          </p>
          <p>{content.footer.built}</p>
        </div>
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <Camera size={18} aria-hidden="true" />
            Instagram
          </a>
        )}
        <a href="#top" className="btn-ghost group">
          <ArrowUp
            size={18}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-y-1"
          />
          {content.footer.top}
        </a>
      </div>
    </footer>
  )
}
