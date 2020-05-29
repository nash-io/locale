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

  MissingComponents = 'MissingComponents',
  ExtraComponents = 'ExtraComponents',
}

export interface ErrorData {
  code: ValidationError
  data?: string
}

export default function validateValue(
  enValue: string,
  translatedValue: unknown,
  locale: string,
) {
  const errors: ErrorData[] = []

  if (typeof translatedValue !== 'string') {
    errors.push({ code: ValidationError.InvalidType })
  } else {
    validateSpaces(errors, enValue, translatedValue, locale)
    validateCharacters(errors, enValue, translatedValue)
    validateVariables(errors, enValue, translatedValue)
    validateComponents(errors, enValue, translatedValue)
  }

  return errors
}

function validateSpaces(
  errors: ErrorData[],
  enValue: string,
  translatedValue: string,
  locale: string,
) {
  // if (translatedValue.trim() !== translatedValue) {
  //   errors.push({ code: ValidationError.UnexpectedSpace })
  // }

  if (translatedValue.match(/( )\1/) != null) {
    errors.push({ code: ValidationError.TooManySpaces })
  }

  const untrimmedMatch = translatedValue.match(/(<\d+?>\s)|(\s<\/\d+>)/)
  if (untrimmedMatch != null) {
    errors.push({
      code: ValidationError.UntrimmedSpace,
      data: `Remove opening/closing space within all tags "${untrimmedMatch[0]}"`,
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
  enValue: string,
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
      data: `Replace ' with ‘ or ’`,
    })
  }

  if (translatedValue.match(/"/) != null) {
    errors.push({
      code: ValidationError.InvalidQuoteCharacter,
      data: `Replace " with “ or ”`,
    })
  }
}

function validateVariables(
  errors: ErrorData[],
  enValue: string,
  translatedValue: string,
) {
  const enVariables = getVariables(enValue)
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
  enValue: string,
  translatedValue: string,
) {
  const enComponents = [
    ...getSelfClosingComponents(enValue),
    ...getComponents(enValue),
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
