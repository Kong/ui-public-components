import type { FieldSchema } from '../../types'

export interface CardContainerProps {
  title: string
  titleTooltip?: string
  subtitle?: string
}

export interface CardContainerFieldSchema extends FieldSchema {
  wrapper: 'FieldCardContainer',
  wrapperProps: CardContainerProps
}
