import walkLocales, { TraversalData } from './walkLocales.ts'
import validateValue, { ErrorData } from './validateValue.ts'

interface LocaleError {
  locale: string
  path: string
  errors: ErrorData[]
  defaultValue: string
  translatedValue: unknown
}

export default function validate(
  defaultLocalePath: string,
  localesPath: string,
) {
  let localeErrorsCount = 0

  walkLocales(
    defaultLocalePath,
    localesPath,
    (fileInfo, { defaultTraversal, translationTraversal, locale }) => {
      const localeErrors = validateLocale(fileInfo.name, {
        defaultTraversal,
        translationTraversal,
        locale,
      })
      localeErrorsCount += localeErrors.length
    },
  )

  if (localeErrorsCount !== 0) {
    console.log('%o errors found', localeErrorsCount)
    Deno.exit(1)
  }
}

function validateLocale(
  localePath: string,
  { defaultTraversal, translationTraversal, locale }: TraversalData,
) {
  console.log('Validating locale %o', localePath)
  const localeErrors: LocaleError[] = []

  defaultTraversal.forEach(function (defaultValue: string) {
    // @ts-ignore
    const context: TraverseContext = this
    if (context.notLeaf) {
      return
    }

    const translatedValue = translationTraversal.get(context.path) as unknown
    const errors = validateValue(defaultValue, translatedValue, locale)

    if (errors.length > 0) {
      localeErrors.push({
        locale,
        path: context.path.join('.'),
        errors,
        defaultValue,
        translatedValue,
      })
    }
  })

  if (localeErrors.length === 0) {
    console.log('✅ %o is valid', locale)
    return localeErrors
  }

  console.log('❌ %o is invalid (%o errors)', locale, localeErrors.length)
  console.error(
    localeErrors.reduce(
      (localeSummary, localeError) =>
        (localeSummary += [
          '',
          `Locale: ${locale}`,
          `Path: ${localeError.path}`,
          `English:\n  ${localeError.defaultValue}`,
          `Translated:\n  ${localeError.translatedValue}`,
          `Errors:${localeError.errors.reduce((errorsSummary, error, index) => {
            errorsSummary += `\n  ${index + 1}. ${error.code}`
            if (error.data != null) {
              errorsSummary += `: ${error.data}`
            }
            return errorsSummary
          }, '')}`,
          '',
        ].join('\n')),
      '',
    ),
  )
  return localeErrors
}
