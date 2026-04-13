import { useEffect, useState } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import { changelogBasenameForLocale } from '../../config/changelogFiles'
import { useLanguage } from '../../contexts/LanguageContext'
import type { LocaleCode } from '../../locale/types'
import {
  parseChangelogMarkdown,
  type ChangelogSection,
} from '../../utils/parseChangelogMarkdown'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; sections: ChangelogSection[] }

function changelogFileUrlForBasename(filename: string): string {
  const base = import.meta.env.BASE_URL
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${filename}`
}

async function fetchMarkdownText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function loadChangelogSections(
  locale: LocaleCode,
  errorMessage: string
): Promise<
  | { ok: true; sections: ChangelogSection[] }
  | { ok: false; message: string }
> {
  const primaryName = changelogBasenameForLocale(locale)
  let text = await fetchMarkdownText(
    changelogFileUrlForBasename(primaryName)
  )
  if (text === null && locale !== 'en') {
    const fallbackName = changelogBasenameForLocale('en')
    text = await fetchMarkdownText(
      changelogFileUrlForBasename(fallbackName)
    )
  }
  if (text === null) {
    return { ok: false, message: errorMessage }
  }
  return { ok: true, sections: parseChangelogMarkdown(text) }
}

const changelogMarkdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h2 className="settings__changelog-prose-h1" {...props}>
      {children}
    </h2>
  ),
  a: ({ href, children, ...props }) => (
    <a
      {...props}
      href={href}
      {...(href?.startsWith('http')
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {children}
    </a>
  ),
}

export function SettingsChangelogPanel() {
  const { messages, locale } = useLanguage()
  const errorMessage = messages.settings.changelogLoadError
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await loadChangelogSections(locale, errorMessage)
      if (cancelled) return
      if (!result.ok) {
        setState({ status: 'error', message: result.message })
      } else {
        setState({ status: 'ready', sections: result.sections })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [errorMessage, locale])

  const handleRetry = () => {
    setState({ status: 'loading' })
    void (async () => {
      const result = await loadChangelogSections(locale, errorMessage)
      if (!result.ok) {
        setState({ status: 'error', message: result.message })
      } else {
        setState({ status: 'ready', sections: result.sections })
      }
    })()
  }

  if (state.status === 'loading') {
    return (
      <div
        className="settings__changelog-panel"
        role="region"
        aria-labelledby="settings-changelog-title"
        aria-busy="true"
      >
        <p className="settings__changelog-status">{messages.app.loading}</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div
        className="settings__changelog-panel"
        role="region"
        aria-labelledby="settings-changelog-title"
      >
        <p className="settings__changelog-error" role="alert">
          {state.message}
        </p>
        <button
          type="button"
          className="settings__changelog-retry"
          onClick={handleRetry}
        >
          {messages.settings.changelogRetry}
        </button>
      </div>
    )
  }

  return (
    <div
      className="settings__changelog-panel"
      role="region"
      aria-labelledby="settings-changelog-title"
    >
      {state.sections.map((section, index) => (
        <div
          key={`${section.heading}-${index}`}
          className="settings__changelog-section"
        >
          {section.heading ? (
            <h2 className="settings__changelog-h2">{section.heading}</h2>
          ) : null}
          {section.body ? (
            <div className="settings__changelog-prose">
              <ReactMarkdown components={changelogMarkdownComponents}>
                {section.body}
              </ReactMarkdown>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
