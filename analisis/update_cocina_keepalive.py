# Update CocinaPage.tsx
with open('frontend/src/pages/CocinaPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read().replace('\r\n', '\n')

old_import = "import { comandaService } from '../services/comandaService';"
new_import = "import { comandaService } from '../services/comandaService';\nimport { renovarTokenService } from '../services/authService';"
assert old_import in code, 'old_import not found'
code = code.replace(old_import, new_import)

old_props = """interface CocinaPageProps {
  session: UserSession;
  onLogout: () => void;
}"""

new_props = """interface CocinaPageProps {
  session: UserSession;
  onLogout: () => void;
  onUpdateSession?: (session: UserSession) => void;
}"""
assert old_props in code, 'old_props not found'
code = code.replace(old_props, new_props)

old_decl = "export const CocinaPage: React.FC<CocinaPageProps> = ({ session, onLogout }) => {"
new_decl = "export const CocinaPage: React.FC<CocinaPageProps> = ({ session, onLogout, onUpdateSession }) => {"
assert old_decl in code, 'old_decl not found'
code = code.replace(old_decl, new_decl)

keep_alive_code = """  // RN-20, RN-82: Mantener la sesión vigente mientras la pantalla de comandas esté abierta, renovando el token cada 20 minutos con /api/auth/renovar
  useEffect(() => {
    const INTERVALO_MS = 20 * 60 * 1000; // 20 minutos
    const intervalId = setInterval(async () => {
      try {
        const nuevoToken = await renovarTokenService(session.token);
        if (nuevoToken && onUpdateSession) {
          onUpdateSession({ ...session, token: nuevoToken });
        }
      } catch (err) {
        console.warn('Error al renovar token periódico de cocina:', err);
      }
    }, INTERVALO_MS);

    return () => clearInterval(intervalId);
  }, [session, onUpdateSession]);

  const [comandas, setComandas] = useState<ComandaKdsItem[]>([]);"""

old_state = "  const [comandas, setComandas] = useState<ComandaKdsItem[]>([]);"
assert old_state in code, 'old_state not found'
code = code.replace(old_state, keep_alive_code)

with open('frontend/src/pages/CocinaPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('CocinaPage.tsx updated')

# Update HomePage.tsx
with open('frontend/src/pages/HomePage.tsx', 'r', encoding='utf-8') as f:
    home_code = f.read().replace('\r\n', '\n')

old_cocina_render = """        <CocinaPage
          session={session}
          onLogout={onLogout}
        />"""

new_cocina_render = """        <CocinaPage
          session={session}
          onLogout={onLogout}
          onUpdateSession={onUpdateSession}
        />"""

assert old_cocina_render in home_code, 'old_cocina_render not found'
home_code = home_code.replace(old_cocina_render, new_cocina_render)

with open('frontend/src/pages/HomePage.tsx', 'w', encoding='utf-8') as f:
    f.write(home_code)

print('HomePage.tsx updated')
