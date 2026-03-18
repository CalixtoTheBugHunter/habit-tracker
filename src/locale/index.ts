import type { LocaleCode, LocaleMessages } from './types'
import { getDefaultLocale } from './defaultLocale'
import { formatMessage as formatMessageFn } from './formatMessage'
import { en } from './messages/en'
import { ptBR } from './messages/pt-BR'

function getMessages(locale: LocaleCode): LocaleMessages {
  if (locale === 'pt-BR') {
    return ptBR
  }
  return en
}

let messagesCache: LocaleMessages | null = null

export function getMessagesForApp(): LocaleMessages {
  if (messagesCache === null) {
    messagesCache = getMessages(getDefaultLocale())
  }
  return messagesCache
}

export const messages = getMessagesForApp()
export const formatMessage = formatMessageFn
export { getDefaultLocale }
export type { LocaleCode, LocaleMessages }
