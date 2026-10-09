import { useContent } from '../hooks/useContent'

export default function Footer() {
  const { content } = useContent()
  return (
    <footer className="border-t border-line/15 bg-blush py-8 text-center text-sm">
      <p>
        © {new Date().getFullYear()} {content.meta.name}. {content.footer.rights}
      </p>
      <p className="mt-1">{content.footer.built}</p>
    </footer>
  )
}
