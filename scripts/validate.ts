import walkLocales from './helpers/walkLocales.ts'
import validateValue, { ErrorData } from './helpers/validateValue.ts'

interface LocaleError {
  locale: string
  path: string
  errors: ErrorData[]
  enValue: string
  translatedValue: unknown
}

let hasAnyLocaleErrors = false

walkLocales((fileInfo, { enTraversal, translationTraversal }) => {
  console.log('Validating locale %o', fileInfo.name)
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
      fileInfo.name.replace(/\.json$/, ''),
    )

    if (errors.length > 0) {
      localeErrors.push({
        locale: fileInfo.name,
        path: context.path.join('.'),
        errors,
        enValue,
        translatedValue,
      })
    }
  })

  if (localeErrors.length > 0) {
    hasAnyLocaleErrors = true
    console.log('❌ %o is invalid', fileInfo.name)
    console.error(
      localeErrors.reduce(
        (localeSummary, localeError) =>
          (localeSummary += [
            '',
            `Locale: ${fileInfo.name}`,
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
    console.log('✅ %o is valid', fileInfo.name)
  }
})

if (hasAnyLocaleErrors) {
  Deno.exit(1)
}
