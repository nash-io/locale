import { writeFileStrSync } from 'https://deno.land/std@0.54.0/fs/mod.ts'

import traverse from './traverse.ts'
import walkLocales, { FileInfo } from './walkLocales.ts'
import validateValue from './validateValue.ts'

interface SyncOptions {
  markChanges?: boolean
  destination?: ({ localeName }: { localeName: string }) => string
  exclude?: (fileName: FileInfo) => boolean
}

export default function sync(
  defaultLocalePath: string,
  localesPath: string,
  options: SyncOptions = {},
) {
  walkLocales(
    defaultLocalePath,
    localesPath,
    (fileInfo, { defaultTraversal, translationTraversal, locale }) => {
      if (options.exclude?.(fileInfo)) {
        console.log('Excluding locale %o from syncing', fileInfo.name)
        return
      }

      console.log('Syncing default locale with %o', fileInfo.name)

      const updatedTranslationTraversal = traverse(defaultTraversal.clone())

      defaultTraversal.forEach((context, defaultValue) => {
        if (!context.isLeaf) {
          return
        }

        const translatedValue = translationTraversal.get(context.path)
        const validationErrors = validateValue(
          defaultValue as string,
          translatedValue,
          locale,
        )

        if (validationErrors.length === 0) {
          updatedTranslationTraversal.set(context.path, translatedValue)
          return
        }

        if (!options.markChanges) {
          updatedTranslationTraversal.set(context.path, defaultValue)
          return
        }

        if (translatedValue == null) {
          updatedTranslationTraversal.set(
            context.path,
            `[Translation required: ${defaultValue}]`,
          )
          return
        }

        updatedTranslationTraversal.set(
          context.path,
          `[Updated translation required: ${defaultValue}] ${translatedValue}`,
        )
      })

      const localeDestination = options.destination
        ? options.destination({ localeName: fileInfo.name })
        : fileInfo.path
      const updatedTranslation = updatedTranslationTraversal.clone()
      writeFileStrSync(
        localeDestination,
        `${JSON.stringify(updatedTranslation, null, '  ')}\n`,
      )
    },
  )
}
