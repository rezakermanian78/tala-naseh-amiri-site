import { ArrowUp } from 'lucide-react'
import { useContent } from '../hooks/useContent'

export default function Footer() {
  const { content } = useContent()
  return (
    <footer className="relative bg-blush py-12">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/40 to-transparent"
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 text-center sm:flex-row sm:justify-between sm:px-8 sm:text-start">
        <div className="text-sm">
          <p className="font-bold text-plum">{content.meta.name}</p>
          <p className="mt-1">
            © {new Date().getFullYear()} {content.meta.name}. {content.footer.rights}
          </p>
          <p>{content.footer.built}</p>
        </div>
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
