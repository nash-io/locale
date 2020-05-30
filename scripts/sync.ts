import { writeJsonSync } from 'https://deno.land/std/fs/mod.ts'
import traverse from 'https://cdn.pika.dev/traverse@^0.6.6'

import walkLocales from '../validator/walkLocales.ts'
import validateValue from '../validator/validateValue.ts'

const defaultLocalePath = './locales/en.json'
const localesPath = './locales/'

walkLocales(
  defaultLocalePath,
  localesPath,
  (fileInfo, { defaultTraversal, translationTraversal, locale }) => {
    console.log('Syncing locale %o', fileInfo.name)

    const updatedTranslationTraversal = traverse(defaultTraversal.clone())

    defaultTraversal.forEach(function (defaultValue: string) {
      // @ts-ignore
      const context: TraverseContext = this
      if (context.notLeaf) {
        return
      }

      const translatedValue = translationTraversal.get(context.path)
      const validationErrors = validateValue(
        defaultValue,
        translatedValue,
        locale,
      )

      updatedTranslationTraversal.set(
        context.path,
        validationErrors.length === 0 ? translatedValue : defaultValue,
      )
    })

    const updatedTranslation = updatedTranslationTraversal.clone()
    writeJsonSync(fileInfo.path, updatedTranslation, { spaces: 2 })
  },
)
