import { createTheme } from '@mantine/core'

export const mantineTheme = createTheme({
  fontFamily: 'Inter, sans-serif',
  cursorType: 'pointer',
  components: {
    Tooltip: {
      defaultProps: {
        offset: 10,
        position: 'right',
        events: { hover: true, focus: true, touch: false },
        transitionProps: {
          transition: 'slide-up',
          duration: 200,
          timingFunction: 'ease',
        },
      },
    },
    Button: {
      defaultProps: {
        color: 'var(--clr-btn)',
        radius: 'md',
        fz: 'var(--size-base)',
        fw: 400,
        size: 'sm',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
        color: 'var(--clr-btn)',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        padding: 'xl',
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.55,
        },
        styles: {
          header: {
            alignItems: 'flex-start',
          },
        },
      },
    },
    Radio: {
      defaultProps: {
        color: 'var(--clr-secondary)',
      },
    },
    Checkbox: {
      defaultProps: {
        color: 'var(--clr-secondary)',
      },
    },
    Switch: {
      defaultProps: {
        color: 'var(--clr-secondary)',
      },
    },
    Badge: {
      defaultProps: {
        fw: 600,
        size: 'lg',
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        shadow: 'sm',
        radius: 'lg',
        padding: 'lg',
      },
    },
    Pagination: {
      defaultProps: {
        radius: 'md',
        color: 'var(--clr-secondary)',
      },
    },
    ThemeIcon: {
      defaultProps: {
        size: 'lg',
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
        classNames: {
          label: 'custom-label',
          error: 'custom-error',
          input: 'custom-input',
          root: 'custom-root',
        },
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
        classNames: {
          label: 'custom-label',
          error: 'custom-error',
          input: 'custom-input',
          root: 'custom-root',
        },
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
        classNames: {
          label: 'custom-label',
          error: 'custom-error',
          input: 'custom-input',
          root: 'custom-root',
          innerInput: 'custom-innerInput',
        },
      },
    },
    Popover: {
      defaultProps: {
        radius: 'lg',
        position: 'bottom-end',
        styles: {
          dropdown: {
            border: '1px solid var(--clr-popover-dropdown-border)',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
        classNames: {
          label: 'custom-label',
          error: 'custom-error',
          input: 'custom-input',
          root: 'custom-root',
        },
      },
    },
  },
})
