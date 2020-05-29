import { writeJsonSync } from 'https://deno.land/std/fs/mod.ts'
import traverse from 'https://cdn.pika.dev/traverse@^0.6.6'

import walkLocales from './helpers/walkLocales.ts'
import validateValue from './helpers/validateValue.ts'

walkLocales((fileInfo, { enTraversal, translationTraversal }) => {
  console.log('Syncing locale %o', fileInfo.name)

  const updatedTranslationTraversal = traverse(enTraversal.clone())

  enTraversal.forEach(function (enValue: string) {
    // @ts-ignore
    const context: TraverseContext = this
    if (context.notLeaf) {
      return
    }

    const translatedValue = translationTraversal.get(context.path)
    const validationErrors = validateValue(enValue, translatedValue)

    updatedTranslationTraversal.set(
      context.path,
      validationErrors.length === 0 ? translatedValue : enValue,
    )
  })

  const updatedTranslation = updatedTranslationTraversal.clone()
  writeJsonSync(fileInfo.path, updatedTranslation, { spaces: 2 })
})
