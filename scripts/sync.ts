import sync from '../validator/sync.ts'

const defaultLocalePath = './locales/en.json'
const localesPath = './locales/'
sync(defaultLocalePath, localesPath)
