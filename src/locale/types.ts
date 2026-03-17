import type { en } from './messages/en'

export type LocaleCode = 'en' | 'pt-BR'

/**
 * New locales must mirror the structure of `en` (same keys at every level).
 * Values can be any string; this type enforces shape only.
 */
type DeepStringRecord<T> = T extends object
  ? { readonly [K in keyof T]: DeepStringRecord<T[K]> }
  : string

export type LocaleMessages = DeepStringRecord<typeof en>
