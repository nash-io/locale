import { parse } from 'https://deno.land/std/flags/mod.ts'

import walkLocales, {
  TraversalData,
  getTraversalData,
} from './helpers/walkLocales.ts'
import validateValue, { ErrorData } from './helpers/validateValue.ts'

const { locale } = parse(Deno.args)

let hasAnyLocaleErrors = false

if (Boolean(locale)) {
  validateLocale(locale.split('/').splice(-1)[0], getTraversalData(locale))
} else {
  walkLocales((fileInfo, { enTraversal, translationTraversal }) => {
    validateLocale(fileInfo.name, { enTraversal, translationTraversal })
  })
}

if (hasAnyLocaleErrors) {
  Deno.exit(1)
}

interface LocaleError {
  locale: string
  path: string
  errors: ErrorData[]
  enValue: string
  translatedValue: unknown
}

function validateLocale(
  locale: string,
  { enTraversal, translationTraversal }: TraversalData,
) {
  console.log('Validating locale %o', locale)
  const localeErrors: LocaleError[] = []

  enTraversal.forEach(function (enValue: string) {
    // @ts-ignore
    const context: TraverseContext = this
    if (context.notLeaf) {
      return
    }

    const translatedValue = translationTraversal.get(context.path) as unknown
    const errors = validateValue(
      enValue,
      translatedValue,
      locale.replace(/\.json$/, ''),
    )

    if (errors.length > 0) {
      localeErrors.push({
        locale,
        path: context.path.join('.'),
        errors,
        enValue,
        translatedValue,
      })
    }
  })

  if (localeErrors.length > 0) {
    hasAnyLocaleErrors = true
    console.log('❌ %o is invalid', locale)
    console.error(
      localeErrors.reduce(
        (localeSummary, localeError) =>
          (localeSummary += [
            '',
            `Locale: ${locale}`,
            `Path: ${localeError.path}`,
            `English:\n  ${localeError.enValue}`,
            `Translated:\n  ${localeError.translatedValue}`,
            `Errors:${localeError.errors.reduce(
              (errorsSummary, error, index) => {
                errorsSummary += `\n  ${index + 1}. ${error.code}`
                if (error.data != null) {
                  errorsSummary += `: ${error.data}`
                }
                return errorsSummary
              },
              '',
            )}`,
            '',
          ].join('\n')),
        '',
      ),
    )
  } else {
    console.log('✅ %o is valid', locale)
  }
}
