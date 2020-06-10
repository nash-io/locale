import { readJsonSync, walkSync } from 'https://deno.land/std@0.54.0/fs/mod.ts'

import traverse, { Traversal } from './traverse.ts'

export interface FileInfo {
  path: string
  name: string
  isFile: boolean
  isDirectory: boolean
  isSymlink: boolean
}

export interface TraversalData {
  defaultTraversal: Traversal
  translationTraversal: Traversal
  locale: string
}

type Walker = (fileInfo: FileInfo, data: TraversalData) => void

export default function walkLocales(
  defaultLocalePath: string,
  localesPath: string,
  walker: Walker,
) {
  const defaultLocaleFileName = defaultLocalePath.split('/').splice(-1)[0]
  const defaultLocaleJson = readJsonSync(defaultLocalePath) as object
  const defaultTraversal = traverse(defaultLocaleJson)

  if (localesPath.endsWith('.json')) {
    const translation = readJsonSync(localesPath) as object
    const translationTraversal = traverse(translation)
    const translationFileName = localesPath.split('/').splice(-1)[0]
    const fileInfo = {
      path: localesPath,
      name: translationFileName,
      isFile: true,
      isDirectory: false,
      isSymlink: false,
    }
    walker(fileInfo, {
      defaultTraversal,
      translationTraversal,
      locale: translationFileName.replace(/\.json$/, ''),
    })
    return
  }

  for (const fileInfo of walkSync(localesPath)) {
    if (!fileInfo.isFile || fileInfo.name === defaultLocaleFileName) {
      continue
    }
    const translation = readJsonSync(fileInfo.path) as object
    const translationTraversal = traverse(translation)
    walker(fileInfo, {
      defaultTraversal,
      translationTraversal,
      locale: fileInfo.name.replace(/\.json$/, ''),
    })
  }
}
