import {
  readJsonSync,
  writeJsonSync,
  walkSync,
} from 'https://deno.land/std/fs/mod.ts'
import traverse from 'https://cdn.pika.dev/traverse@^0.6.6'

interface FileInfo {
  path: string
  name: string
  isFile: boolean
  isDirectory: boolean
  isSymlink: boolean
}

interface TraverseContext {
  path: string[]
  notLeaf: boolean
  isLeaf: boolean
}

const en = readJsonSync('./locales/en.json')
const enTraversal = traverse(en)

for (const fileInfo of walkSync('./locales/')) {
  if (!fileInfo.isFile || fileInfo.name === 'en.json') {
    continue
  }
  syncAndValidateFile(fileInfo)
}

function syncAndValidateFile(fileInfo: FileInfo) {
  console.log('Validating %o', fileInfo.name)

  const translation = readJsonSync(fileInfo.path)
  const translationTraversal = traverse(translation)
  const updatedTranslationTraversal = traverse(enTraversal.clone())

  enTraversal.forEach(function (value) {
    // @ts-ignore
    const context: TraverseContext = this
    if (context.notLeaf) {
      return
    }

    const translatedValue = translationTraversal.get(context.path)
    // TODO validate translatedValue
    // - trimmed text
    // - variables
    // - components

    updatedTranslationTraversal.set(
      context.path,
      Boolean(translatedValue) ? translatedValue : value,
    )
  })

  const updatedTranslation = updatedTranslationTraversal.clone()
  writeJsonSync(fileInfo.path, updatedTranslation, { spaces: 2 })
}
