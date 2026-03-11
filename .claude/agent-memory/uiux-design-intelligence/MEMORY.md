# UI/UX Design Intelligence — Project Memory

## Project: GestorProcessosRamajo

### Stack
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS 4 (porta 5174)
- Backend: Spring Boot + Java 21 + MySQL (porta 8080)
- Roteamento: React Router DOM v6 (adicionado)

### Estrutura de arquivos relevantes
- `Ramajo/src/main.tsx` — entry point com BrowserRouter + Routes
- `Ramajo/src/App.tsx` — layout raiz (Navbar + Outlet)
- `Ramajo/src/shared.ts` — interfaces, instância axios, helpers de tempo
- `Ramajo/src/components/Modal.tsx` — componente Modal reutilizável
- `Ramajo/src/pages/ProcessosPage.tsx` — rota `/` (processos ativos/inativos, detalhe, novo processo)
- `Ramajo/src/pages/CadastrosPage.tsx` — rota `/cadastros` (gerenciar traves e banhos)

### Convenções do projeto
- Paleta: slate (base) + cyan (ação primária) + rose (destrutivo) + emerald (sucesso) + amber (em uso/atenção)
- Componente Modal recebe `variant`: 'default' | 'success' | 'error' | 'info'
- Imports React em arquivos .tsx com JSX não precisam de `import React` (projeto usa React 19 com novo JSX transform)
- O TypeScript está configurado com `noUnusedLocals`, então imports sem uso causam erro de build

### Padrão de rota React Router v6 usado
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />}>   {/* layout */}
      <Route index element={<ProcessosPage />} />
      <Route path="cadastros" element={<CadastrosPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```
NavLink com `end` na rota index para evitar highlight duplo.
