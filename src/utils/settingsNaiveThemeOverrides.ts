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
    },
    DataTable: {
      ...base.DataTable,
      thColor: isLight ? '#f4f2ef' : '#283244',
      thColorHover: isLight ? '#ebe9e4' : '#2f3a4d',
      tdColor: isLight ? '#ffffff' : '#1e2634',
      tdColorHover: isLight ? '#f8f7f5' : '#222a38',
      tdColorStriped: isLight ? '#faf9f7' : '#1a2230',
      borderColor: border,
      thTextColor: text1,
      tdTextColor: text1,
      thFontWeight: '600'
    },
    Switch: {
      ...base.Switch,
      railColor: isLight ? 'rgba(15, 23, 42, 0.18)' : 'rgba(226, 232, 240, 0.18)',
      railColorActive: 'var(--color-accent)',
      loadingColor: '#fff',
      buttonColor: isLight ? '#fff' : '#f8fafc',
      buttonBoxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)'
    },
    Radio: {
      ...base.Radio,
      color: 'var(--color-accent)',
      textColor: text1,
      textColorDisabled: text3,
      labelTextColor: text1,
      dotColor: 'var(--color-accent)',
      dotColorActive: 'var(--color-accent)',
      boxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.18)`,
      buttonTextColor: text2,
      buttonTextColorActive: '#fff',
      buttonTextColorHover: text1,
      buttonColor: inputBg,
      buttonColorActive: 'var(--color-accent)',
      buttonBorderColor: border,
      buttonBorderColorHover: borderHover,
      buttonBorderColorActive: 'var(--color-accent)',
      buttonBoxShadow: 'none',
      buttonBoxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.18)`,
      buttonBoxShadowHover: 'none'
    },
    Checkbox: {
      ...base.Checkbox,
      color: 'var(--color-accent)',
      colorChecked: 'var(--color-accent)',
      textColor: text1,
      textColorChecked: text1,
      labelTextColor: text1,
      border: `1px solid ${border}`,
      borderHover: `1px solid ${borderHover}`,
      borderFocus: `1px solid rgba(var(--color-accent-rgb), 0.55)`,
      borderChecked: '1px solid var(--color-accent)',
      boxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.18)`,
      checkMarkColor: isLight ? '#fff' : '#07111e',
      dotColor: 'transparent',
      dotColorActive: 'var(--color-accent)',
      dotColorDisabled: 'transparent'
    },
    Slider: {
      ...base.Slider,
      fillColor: 'var(--color-accent)',
      fillColorHover: 'var(--color-accent-hover)',
      handleColor: '#fff',
      handleColorHover: '#fff',
      handleColorActive: '#fff',
      handleBorderColor: 'var(--color-accent)',
      handleBorderColorActive: 'var(--color-accent)',
      handleBorderColorHover: 'var(--color-accent)',
      handleBorderColorFocus: 'var(--color-accent)',
      railColor: isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(226, 232, 240, 0.16)',
      railColorHover: isLight ? 'rgba(15, 23, 42, 0.14)' : 'rgba(226, 232, 240, 0.22)',
      opacityDisabled: 0.5,
      dotBorderColor: 'var(--color-accent)',
      dotColor: isLight ? '#fff' : '#1e2634',
      labelTextColor: text1,
      labelColor: popoverBg,
      boxShadow: `0 0 0 3px rgba(var(--color-accent-rgb), 0.22)`,
      boxShadowActive: `0 0 0 4px rgba(var(--color-accent-rgb), 0.28)`,
      boxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.22)`
    },
    Tag: {
      ...base.Tag,
      borderRadius: '6px',
      color: inputBg,
      colorBordered: inputBg,
      colorPrimary: 'rgba(var(--color-accent-rgb), 0.16)',
      colorInfo: 'rgba(96, 165, 250, 0.16)',
      colorSuccess: 'rgba(52, 211, 153, 0.16)',
      colorWarning: 'rgba(251, 191, 36, 0.16)',
      colorError: 'rgba(248, 113, 113, 0.16)',
      textColor: text1,
      textColorPrimary: '#8db5ff',
      textColorInfo: '#60a5fa',
      textColorSuccess: '#34d399',
      textColorWarning: '#fbbf24',
      textColorError: '#f87171',
      border: `1px solid ${border}`
    },
    InputNumber: {
      ...base.InputNumber,
      color: inputBg,
      colorDisabled: isLight ? '#f0eeeb' : '#1a212e',
      textColor: text1,
      textColorDisabled: text3,
      placeholderColor: text3,
      border: `1px solid ${border}`,
      borderHover: `1px solid ${borderHover}`,
      borderFocus: `1px solid rgba(var(--color-accent-rgb), 0.55)`,
      boxShadowFocus: `0 0 0 3px rgba(var(--color-accent-rgb), 0.18)`,
      buttonColor: inputBg,
      buttonColorHover: hoverBg,
      buttonColorPressed: hoverBg,
      buttonBorder: `1px solid ${border}`,
      iconColor: text2,
      iconColorDisabled: text3
    },
    Form: {
      ...base.Form,
      labelTextColor: text1,
      labelTextColorHorizontal: text1,
      labelFontWeight: '500',
      labelPadding: '0 0 8px',
      feedbackTextColor: text3,
      blankHeight: '20px',
      blankHeightSmall: '14px'
    },
    Empty: {
      ...base.Empty,
      textColor: text2,
      iconColor: text3,
      iconSize: '50px',
      descriptionFontSize: '13px',
      extraTextColor: text3
    },
    Divider: {
      ...base.Divider,
      color: border,
      textColor: text2,
      titleFontWeight: '500',
      titleFontSize: '13px'
    },
    Spin: {
      ...base.Spin,
      color: 'var(--color-accent)',
      opacitySpinning: 0.9,
      textColor: text2
    }
  }
}
