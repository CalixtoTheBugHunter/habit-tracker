export interface ChangelogSection {
  heading: string
  body: string
}

/**
 * Splits markdown on level-2 headings (`## `). Lines before the first `## ` become one section with an empty heading.
 */
export function parseChangelogMarkdown(md: string): ChangelogSection[] {
  const lines = md.split(/\r?\n/)
  const sections: ChangelogSection[] = []
  let currentHeading = ''
  const currentBody: string[] = []

  const flush = () => {
    const body = currentBody.join('\n').trim()
    if (currentHeading !== '' || body !== '') {
      sections.push({ heading: currentHeading, body })
    }
    currentBody.length = 0
  }

  for (const line of lines) {
    if (line.startsWith('## ') && !line.startsWith('###')) {
      flush()
      currentHeading = line.slice(3).trim()
    } else {
      currentBody.push(line)
    }
  }
  flush()

  return sections
}
