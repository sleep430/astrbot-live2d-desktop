import type { GlobalThemeOverrides } from 'naive-ui'
import type { ResolvedColorScheme } from '@/stores/appearance'

/** 设置窗口用：不透明输入/下拉/弹层，避免文字发虚 */
export function buildSettingsNaiveThemeOverrides(
  scheme: ResolvedColorScheme,
  base: GlobalThemeOverrides
): GlobalThemeOverrides {
  const isLight = scheme === 'light'

  const inputBg = isLight ? '#ffffff' : '#222a38'
  const inputBgFocus = isLight ? '#ffffff' : '#283244'
  const popoverBg = isLight ? '#ffffff' : '#222a38'
  const modalBg = isLight ? '#ffffff' : '#1e2634'
  const actionBg = isLight ? '#f4f2ef' : '#283244'
  const hoverBg = isLight ? 'rgba(15, 23, 42, 0.06)' : '#2f3a4d'
  const border = isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(226, 232, 240, 0.14)'
  const borderHover = isLight ? 'rgba(15, 23, 42, 0.22)' : 'rgba(226, 232, 240, 0.22)'
  const text1 = isLight ? 'rgba(15, 23, 42, 0.94)' : 'rgba(248, 250, 252, 0.96)'
  const text2 = isLight ? 'rgba(15, 23, 42, 0.68)' : 'rgba(226, 232, 240, 0.78)'
  const text3 = isLight ? 'rgba(15, 23, 42, 0.48)' : 'rgba(203, 213, 225, 0.58)'

  return {
    ...base,
    common: {
      ...base.common,
      textColor1: text1,
      textColor2: text2,
      textColor3: text3,
      textColorBase: text1,
      popoverColor: popoverBg,
      modalColor: modalBg,
      inputColor: inputBg,
      actionColor: actionBg,
      hoverColor: hoverBg,
      borderColor: border,
      dividerColor: border,
      fontSize: '14px',
      fontSizeMedium: '14px'
    },
    Input: {
      ...base.Input,
      color: inputBg,
      colorFocus: inputBgFocus,
      colorDisabled: isLight ? '#f0eeeb' : '#1a212e',
      textColor: text1,
      textColorDisabled: text3,
      placeholderColor: text3,
      border: `1px solid ${border}`,
      borderHover: `1px solid ${borderHover}`,
      borderFocus: `1px solid rgba(var(--color-accent-rgb), 0.55)`,
      boxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.18)`
    },
    Select: {
      ...base.Select,
      peers: {
        ...base.Select?.peers,
        InternalSelection: {
          ...base.Select?.peers?.InternalSelection,
          color: inputBg,
          colorActive: inputBgFocus,
          textColor: text1,
          placeholderColor: text3,
          border: `1px solid ${border}`,
          borderHover: `1px solid ${borderHover}`,
          borderActive: `1px solid rgba(var(--color-accent-rgb), 0.55)`,
          borderFocus: `1px solid rgba(var(--color-accent-rgb), 0.55)`,
          boxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.18)`
        },
        InternalSelectMenu: {
          color: popoverBg,
          optionTextColor: text1,
          optionTextColorActive: text1,
          optionTextColorPressed: text1,
          optionColorPending: hoverBg,
          optionColorActive: hoverBg,
          optionCheckColor: 'var(--color-accent)'
        }
      }
    },
    DatePicker: {
      ...base.DatePicker,
      panelColor: popoverBg,
      panelTextColor: text1,
      calendarTitleTextColor: text1,
      itemTextColor: text2,
      itemColorHover: hoverBg
    },
    Pagination: {
      ...base.Pagination,
      itemTextColor: text2,
      itemTextColorHover: text1,
      itemTextColorPressed: text1,
      itemTextColorActive: text1
    },
    Dialog: {
      ...base.Dialog,
      color: modalBg,
      textColor: text1
    },
    Card: {
      ...base.Card,
      color: isLight ? '#ffffff' : '#222a38',
      textColor: text2,
      titleTextColor: text1,
      borderColor: border
    },
    Alert: {
      ...base.Alert,
      color: isLight ? '#f8f7f5' : '#222a38'
    }
  }
}
