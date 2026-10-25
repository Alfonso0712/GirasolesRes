with open('frontend/src/components/ui/StatusBadge.tsx', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

old_block = """      normalized === 'cuadra' ||
      normalized === 'pagado' ||
      normalized === 'emitido' ||"""

new_block = """      normalized === 'cuadra' ||
      normalized === 'pagado' ||
      normalized === 'listo · pagado' ||
      normalized === 'emitido' ||"""

assert old_block in code, 'old_block not found'
code = code.replace(old_block, new_block)

old_warn = """      normalized === 'en preparacion' ||
      normalized === 'en preparación' ||
      normalized === 'en curso' ||"""

new_warn = """      normalized === 'en preparacion' ||
      normalized === 'en preparación' ||
      normalized === 'pagado · en preparacion' ||
      normalized === 'pagado · en preparación' ||
      normalized === 'pagado · pendiente' ||
      normalized === 'en curso' ||"""

assert old_warn in code, 'old_warn not found'
code = code.replace(old_warn, new_warn)

old_icon = """    } else if (resolvedIntent === 'warning') {
      if (normalized === 'en preparacion' || normalized === 'en preparación') {
        IconComponent = Flame;
      } else if (normalized === 'pendiente' || normalized === 'en curso') {
        IconComponent = Clock;
      } else {
        IconComponent = AlertTriangle;
      }
    }"""

new_icon = """    } else if (resolvedIntent === 'warning') {
      if (normalized.includes('preparacion') || normalized.includes('preparación')) {
        IconComponent = Flame;
      } else if (normalized.includes('pendiente') || normalized === 'en curso') {
        IconComponent = Clock;
      } else {
        IconComponent = AlertTriangle;
      }
    }"""

assert old_icon in code, 'old_icon not found'
code = code.replace(old_icon, new_icon)

with open('frontend/src/components/ui/StatusBadge.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('StatusBadge.tsx updated')
