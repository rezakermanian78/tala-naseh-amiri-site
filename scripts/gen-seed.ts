// Regenerates server/src/db/seed-data.json from the static content (src/content/*), which is
// also the site's offline fallback — so a fresh database starts identical to the live site.
// Run: npm run db:seed:gen
import { writeFileSync } from 'node:fs'
import { fallbackData } from '../src/content/fallback'

const strip = <T extends object>(row: T) =>
  Object.fromEntries(
    Object.entries(row).filter(([k]) => !['id', 'created_at', 'updated_at'].includes(k)),
  )

const { settings, skills, languages, education, projects, publications, contentWork, gallery } =
  fallbackData

const data = {
  settings: strip(settings),
  skills: skills.map(strip),
  languages: languages.map(strip),
  education: education.map(strip),
  projects: projects.map(strip),
  publications: publications.map(strip),
  content_work: contentWork.map(strip),
  gallery: gallery.map(strip),
}

writeFileSync(
  new URL('../server/src/db/seed-data.json', import.meta.url),
  JSON.stringify(data, null, 2) + '\n',
)
console.log('Wrote server/src/db/seed-data.json')
