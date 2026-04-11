import type { LocaleCode, LocaleMessages } from './types'
import { formatMessage as formatMessageFn } from './formatMessage'
import { en } from './messages/en'
import { ptBR } from './messages/pt-BR'

export function getMessagesForLocale(locale: LocaleCode): LocaleMessages {
  if (locale === 'pt-BR') {
    return ptBR
  }
  return en
}

export const formatMessage = formatMessageFn
export type { LocaleCode, LocaleMessages }
