export enum ValidationError {
  InvalidType = 'InvalidType',

  UnexpectedSpace = 'UnexpectedSpace',
  UntrimmedSpace = 'UntrimmedSpace',
  MissingSpace = 'MissingSpace',
  TooManySpaces = 'TooManySpaces',

  AmbiguousPeriodCharacters = 'AmbiguousPeriodCharacters',
  InvalidEllipsesCharacter = 'InvalidEllipsesCharacter',
  InvalidQuoteCharacter = 'InvalidQuoteCharacter',

  MissingVariables = 'MissingVariables',
  ExtraVariables = 'ExtraVariables',
  InvalidVariables = 'InvalidVariables',

  UnclosedComponents = 'UnclosedComponents',
  NestedComponents = 'NestedComponents',
  MissingComponents = 'MissingComponents',
  ExtraComponents = 'ExtraComponents',
}

export interface ErrorData {
  code: ValidationError
  data?: string
}

export default function validateValue(
  defaultValue: string,
  translatedValue: unknown,
  locale: string,
) {
  const errors: ErrorData[] = []

  if (typeof translatedValue !== 'string') {
    errors.push({ code: ValidationError.InvalidType })
  } else {
    validateSpaces(errors, defaultValue, translatedValue, locale)
    validateCharacters(errors, defaultValue, translatedValue)
    validateVariables(errors, defaultValue, translatedValue)
    validateComponents(errors, defaultValue, translatedValue)
  }

  return errors
}

function validateSpaces(
  errors: ErrorData[],
  defaultValue: string,
  translatedValue: string,
  locale: string,
) {
  // if (translatedValue.trim() !== translatedValue) {
  //   errors.push({ code: ValidationError.UnexpectedSpace })
  // }

  if (translatedValue.match(/( )\1/) != null) {
    errors.push({ code: ValidationError.TooManySpaces })
  }

  const untrimmedMatch = translatedValue.match(/(^\s.)|(.\s$)/)
  if (untrimmedMatch != null) {
    if (untrimmedMatch[1] != null) {
      const openingText =
        translatedValue.length > 25
          ? `${translatedValue.slice(0, 15)}…`
          : translatedValue
      errors.push({
        code: ValidationError.UntrimmedSpace,
        data: `Remove the opening space "${openingText}"`,
      })
    }
    if (untrimmedMatch[2] != null) {
      const closingText =
        translatedValue.length > 25
          ? `…${translatedValue.slice(-15)}`
          : translatedValue
      errors.push({
        code: ValidationError.UntrimmedSpace,
        data: `Remove the closing space "${closingText}"`,
      })
    }
  }

  const untrimmedComponentMatch = translatedValue.match(
    /(<\d+?>\s)|(\s<\/\d+>)/,
  )
  if (untrimmedComponentMatch != null) {
    errors.push({
      code: ValidationError.UntrimmedSpace,
      data: `Remove opening/closing space within all tags "${untrimmedComponentMatch[0]}"`,
    })
  }

  if (locale === 'de_DE' && translatedValue.match(/[^ ]…/) != null) {
    errors.push({
      code: ValidationError.MissingSpace,
      data: 'Add a space before "…"',
    })
  }
}

function validateCharacters(
  errors: ErrorData[],
  defaultValue: string,
  translatedValue: string,
) {
  if (translatedValue.match(/\.\.\./) != null) {
    errors.push({
      code: ValidationError.InvalidEllipsesCharacter,
      data: 'Replace "..." with "…"',
    })
  } else if (translatedValue.match(/\.\./) != null) {
    errors.push({
      code: ValidationError.AmbiguousPeriodCharacters,
      data: 'Replace ".." with either "." or "…"',
    })
  }

  if (translatedValue.match(/'/) != null) {
    errors.push({
      code: ValidationError.InvalidQuoteCharacter,
      data: `Replace ' with either ‘ or ’`,
    })
  }

  if (translatedValue.match(/"/) != null) {
    errors.push({
      code: ValidationError.InvalidQuoteCharacter,
      data: `Replace " with either “ or ”`,
    })
  }
}

function validateVariables(
  errors: ErrorData[],
  defaultValue: string,
  translatedValue: string,
) {
  const enVariables = getVariables(defaultValue)
  const translatedVariables = getVariables(translatedValue)

  const missingVariables: string[] = []
  enVariables.forEach((enVariable) => {
    if (!translatedVariables.includes(enVariable)) {
      missingVariables.push(enVariable)
    }
  })
  if (missingVariables.length > 0) {
    errors.push({
      code: ValidationError.MissingVariables,
      data: missingVariables.join(', '),
    })
  }

  const extraVariables: string[] = []
  translatedVariables.forEach((translatedVariable) => {
    if (!enVariables.includes(translatedVariable)) {
      extraVariables.push(translatedVariable)
    }
  })
  if (extraVariables.length > 0) {
    errors.push({
      code: ValidationError.ExtraVariables,
      data: extraVariables.join(', '),
    })
  }

  const invalidVariables = getInvalidVariables(translatedValue)
  if (invalidVariables.length > 0) {
    errors.push({
      code: ValidationError.InvalidVariables,
      data: invalidVariables.join(', '),
    })
  }
}

function validateComponents(
  errors: ErrorData[],
  defaultValue: string,
  translatedValue: string,
) {
  const invalidComponents = getInvalidComponents(translatedValue)
  if (invalidComponents != null) {
    if (invalidComponents.length === 2) {
      errors.push({
        code: ValidationError.NestedComponents,
        data: `Remove nested tag in "${invalidComponents[0]} .. ${invalidComponents[1]}"`,
      })
    } else {
      errors.push({
        code: ValidationError.UnclosedComponents,
        data: `Add missing closing tag for "${invalidComponents[0]}"`,
      })
    }
    return
  }

  const enComponents = [
    ...getSelfClosingComponents(defaultValue),
    ...getComponents(defaultValue),
  ]
  const translatedComponents = [
    ...getSelfClosingComponents(translatedValue),
    ...getComponents(translatedValue),
  ]

  const missingComponents: string[] = []
  enComponents.forEach((enComponent) => {
    if (!translatedComponents.includes(enComponent)) {
      missingComponents.push(enComponent)
    }
  })
  if (missingComponents.length > 0) {
    errors.push({
      code: ValidationError.MissingComponents,
      data: missingComponents.join(', '),
    })
  }

  const extraComponents: string[] = []
  translatedComponents.forEach((translatedComponent) => {
    if (!enComponents.includes(translatedComponent)) {
      extraComponents.push(translatedComponent)
    }
  })
  if (extraComponents.length > 0) {
    errors.push({
      code: ValidationError.ExtraComponents,
      data: extraComponents.join(', '),
    })
  }
}

function getVariables(value: string): string[] {
  const match = value.match(/\{\{(\w+?)\}\}/g)
  return match == null ? [] : match
}

function getInvalidVariables(value: string): string[] {
  const match = value.match(/([^{]\{\w+?\})|(\{\w+?\}[^}])/g)
  return match == null ? [] : match
}

function getInvalidComponents(
  value: string,
): [string, string] | [string] | null {
  let currentIndex = 0
  let openTag = null

  while (value[currentIndex] != null) {
    const remainingValue = value.slice(currentIndex)

    const openTagMatch = remainingValue.match(/^<(\d+)>/)
    if (openTagMatch != null) {
      if (openTag != null) {
        return [openTag, openTagMatch[0]]
      }

      openTag = openTagMatch[0]
      currentIndex += openTagMatch[0].length
      continue
    }

    const closeTagMatch = remainingValue.match(/^<\/(\d+)>/)
    if (closeTagMatch != null) {
      openTag = null
      currentIndex += closeTagMatch[0].length
      continue
    }

    currentIndex += 1
  }

  if (openTag != null) {
    return [openTag]
  }

  return null
}

function getSelfClosingComponents(value: string): string[] {
  const match = value.match(/<(\d+) *?\/>/g)
  return match == null ? [] : match
}

function getComponents(value: string): string[] {
  // NOTE: This doesn't currently support nested components, which is fine
  // considering we don't have any nested components in our translations.
  const match = value.match(/<(\d+)>.+?<\/\1>/g)
  return match == null ? [] : match.map((chunk) => chunk.split(/^(<\d+>)/)[1])
}
