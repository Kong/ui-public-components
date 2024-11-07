import {
  KUI_COLOR_BACKGROUND_PRIMARY,
  KUI_COLOR_BACKGROUND_PRIMARY_WEAK,
  KUI_COLOR_BACKGROUND_PRIMARY_WEAKER,
  KUI_COLOR_TEXT_DECORATIVE_AQUA,
  KUI_COLOR_TEXT_DECORATIVE_PURPLE,
} from '@kong/design-tokens'
import { SpanType, type SpanPresentation } from '../types'

export const spanPresentations: Record<SpanType, SpanPresentation> = {
  [SpanType.ROOT]: {
    label: 'Total',
    color: KUI_COLOR_BACKGROUND_PRIMARY,
  },
  [SpanType.KONG]: {
    label: 'Kong (internal)',
    color: KUI_COLOR_BACKGROUND_PRIMARY_WEAKER,
  },
  [SpanType.UPSTREAM]: {
    label: 'Upstream',
    color: KUI_COLOR_BACKGROUND_PRIMARY_WEAK,
  },
  [SpanType.THIRD_PARTY]: {
    label: '3rd-party',
    color: KUI_COLOR_TEXT_DECORATIVE_AQUA,
  },
  [SpanType.CLIENT]:  {
    label: 'Client',
    color: KUI_COLOR_TEXT_DECORATIVE_PURPLE,
  },
}
