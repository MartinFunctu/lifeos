import type { Config } from "tailwindcss";

// Force rebuild timestamp: 2026-01-03 13:48

export default <Config>{
  darkMode: 'class',
  content: [
    './client/**/*.{ts,tsx,html}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      screens: {
        '3xl': '1800px'
      },
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          dark: 'hsl(var(--primary-dark) / <alpha-value>)',
          'dark-foreground': 'hsl(var(--primary-dark-foreground) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar) / <alpha-value>)',
          foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)'
        },

      },
      backgroundImage: {
        carousel:
          'linear-gradient(180deg, #040012 -2.67%, rgba(15, 0, 66, 0) 45.44%, #040012 100%);',
        slider:
          'linear-gradient(270deg, rgba(4, 0, 18, 0.7) 0%, rgba(4, 0, 18, 0) 100%);'
      },
      boxShadow: {
        main: '2px 2px 20px 0px rgba(144,34,255,0.25)',
        mainxl: '5px 5px 20px 0px rgba(144,34,255,0.25)',
        pricingleft: '-40.2649px 8.05298px 93.9514px rgba(144,34,255,0.2)',
        pricingright: '40.26px 8.05298px 93.9514px rgba(144,34,255,0.2)',
        pricingsale: '0px 0px 20px #FE1401',
        homebutton: '1px 1px 10px 0px #FFFFFF40',
        pricinglifetime: '0px 0px 20px 0px #9022FF'
      },
      transitionDuration: {
        2000: '2000ms'
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        lexend: ['Lexend', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sansation: ['Sansation', 'sans-serif'],
      },
      fontSize: {
        heading: [
          '2rem',
          {
            lineHeight: '2.5rem',
            letterSpacing: '-0.01em',
            fontWeight: '600'
          }
        ],
        'heading-sm': [
          '1.5rem',
          {
            lineHeight: '2.25rem',
            letterSpacing: '-0.01em',
            fontWeight: '600'
          }
        ],

        'heading-2': [
          '3rem',
          {
            lineHeight: '3.75rem',
            letterSpacing: '-0.01em',
            fontWeight: '600'
          }
        ],
        'heading-2-sm': [
          '2.25rem',
          {
            lineHeight: '3rem',
            letterSpacing: '-0.01em',
            fontWeight: '600'
          }
        ],
        'heading-3': [
          '2.5rem',
          {
            lineHeight: '3.125rem',
            letterSpacing: '0.02em',
            fontWeight: '600'
          }
        ],
        'heading-3-sm': [
          '2rem',
          {
            lineHeight: '2.5rem',
            letterSpacing: '0.02em',
            fontWeight: '600'
          }
        ],
        paragraph: [
          '1.125rem',
          {
            lineHeight: '1.875rem',
            letterSpacing: '0.02em',
            fontWeight: '500'
          }
        ],
        'paragraph-sm': [
          '1rem',
          {
            lineHeight: '1.625rem',
            letterSpacing: '0.02em',
            fontWeight: '500'
          }
        ]
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        fadeOut: {
          '100%': { opacity: 1 },
          '0%': { opacity: 0 }
        },
        'scale-out': {
          '0%': {
            scale: 1,
            opacity: 1
          },
          '95%': {
            scale: 0,
            opacity: 0
          },
          '100%': {
            scale: 0,
            opacity: 0,
            display: 'none'
          }
        },
        'scale-in': {
          '0%': {
            scale: 0,
            opacity: 0
          },
          '100%': {
            scale: 1,
            opacity: 1
          }
        },
        'pop-in': {
          '0%': {
            transform: 'scale(0%)',
            opacity: 0
          },
          '50%': {
            transform: 'scale(130%)',
            opacity: 1
          },
          '100%': {
            transform: 'scale(100%)',
            opacity: 1
          }
        },
        'pulse-outline': {
          '0%, 100%': {
            'outline-width': '1px'
          },
          '50%': {
            'outline-width': '6px'
          },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
        },
        'like-weight-scale': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px) rotate(-7deg)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px) rotate(7deg)' }
        },
        'like-weight-scale-forever': {
          '0%, 100%, 13%': { transform: 'translateX(0)' },
          '0.1%, 4%, 8%, 10%': { transform: 'translateX(-5px) rotate(-7deg)' },
          '2%, 6%, 9%, 12%': { transform: 'translateX(5px) rotate(7deg)' }
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'scroll-in': {
          '0%': { transform: 'translateY(-15%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'animate-loader': {
          '0%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: 1
          },
          '50%': {
            transform: 'scale(1.5) rotate(270deg)',
            opacity: 0.5
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: 1
          }
        },
        'updown': {
          '0%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
          '100%': {
            transform: 'translateY(0px)',
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'scale-out': 'scale-out 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-in forwards',
        'pop-in': 'pop-in 0.5s ease-in forwards',
        'pulse-outline': 'pulse-outline 1s infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'like-weight-scale': 'like-weight-scale 0.7s cubic-bezier(.36,.07,.19,.97) 2',
        'like-weight-scale-forever': 'like-weight-scale-forever 3.5s cubic-bezier(.36,.07,.19,.97) infinite',
        'pulse-scale': 'pulse-scale 1s infinite',
        'scroll-in': 'scroll-in 0.3s ease-in forwards',
        'loader': 'animate-loader 2s ease-in-out infinite',
        'updown': 'updown 0.8s ease-in-out infinite',
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')]
}
