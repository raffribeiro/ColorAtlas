# Color Atlas — instruções do projeto

## App e documentação devem evoluir juntos

Regra confirmada pelo usuário em 2026-10-06: qualquer alteração no app deve incluir a atualização da documentação correspondente na mesma entrega.

- Revise os capítulos afetados por mudanças de comportamento, interface, controles, valores padrão, algoritmos, dados, exportação, integração ou limitações. Remova explicações que ficaram desatualizadas.
- Mantenha a documentação do app em inglês. Comece cada tópico com uma explicação simples e prática; fórmulas ficam na referência técnica recolhível. Regra confirmada em 2026-10-15: documentação enxuta, focada no uso, com exemplos interativos; sem detalhes internos de implementação, features ocultas ou ressalvas legais.
- Atualize exemplos e imagens de demonstração quando a alteração mudar o que eles representam. Registre novos materiais consultados em `work/documentation-sources.json`, distinguindo fontes externas de escolhas próprias do app.
- Edite os módulos de origem da documentação; gere novamente o conteúdo e a página final. Não trate a atualização apenas do código ou apenas do HTML gerado como uma entrega completa.
- Execute as verificações pertinentes do app e da documentação antes de declarar a alteração concluída. Diferencie verificações automatizadas de aceitação real no navegador ou engine.

## Arquivos de referência

- Fonte canônica do app: `/Users/raffribeiro/.codex/visualizations/2026/10/01/01a0f83c-7569-7dd0-ad8b-3e73b2b454df/munsell-selector.html`.
- Gerador da documentação: `work/build_documentation.py` (guia v2). Exemplos interativos: `work/atlas-documentation-examples.js`. Instalação: `work/install_documentation_v2.py`.
- Conteúdo gerado: `work/atlas-documentation.html`.
- Navegação e estilos da documentação: `work/atlas-documentation.js` e `work/atlas-documentation.css`.
- Bibliografia: `work/documentation-sources.json`.
- Procedimentos de manutenção e verificações: `work/DOCUMENTATION.md`.
- Onboarding: `work/atlas-onboarding.js`, `work/atlas-onboarding.css`, `work/atlas-onboarding-state.js`; logo do header: `work/atlas-brand.css`. Instalação: `work/install_onboarding.py`; verificação: `work/check_onboarding.cjs` e testes de ponta a ponta `work/test_onboarding_e2e.py` (Playwright). Toda mudança no tutorial deve manter os testes passando. Ao mudar controles visados pelo tutorial, atualize os passos.
- Biblioteca (Export/Import): `work/atlas-library-io.js` e `.css`, instalados por `work/install_onboarding.py`.
- Fonte única: `work/build_standalone.py` gera `outputs/munsell-color-picker.html` a partir da fonte canônica + `work/standalone-*.html` + `work/fit_local_page.py`. Não edite a página gerada à mão. As opções Graphic Design - Smooth e Graphic Design - Bands de `work/atlas-graphic-design.js` foram lançadas na v0.13.3; preserve ambas no build completo.
- Entrega final: `outputs/munsell-color-picker.html`.

Preserve as alterações existentes, os dados do usuário e o comportamento responsivo. Mantenha a URL de preview atual ao atualizar a página: a persistência local usa o caminho e a query string.

## Trabalho em paralelo (Codex + Claude)

Regra pedida pelo usuário em 2026-10-15: Codex e Claude podem trabalhar neste workspace ao mesmo tempo. A coordenação é feita por `work/agent_lock.py`; o quadro legível fica em `work/AGENT_BOARD.md` (gerado, não edite).

1. Antes de começar: `python3 work/agent_lock.py status`. Leia as notas recentes do outro agente no quadro.
2. Reivindique os arquivos de origem que vai editar: `python3 work/agent_lock.py claim codex "<tarefa>" work/arquivo.js ...` (o Claude usa `claude`). Se aparecer BLOCKED, escolha outra tarefa ou espere; não edite arquivo de outro agente.
3. Recurso compartilhado `@build`: fonte canônica, scripts `install_*`, páginas geradas (`work/atlas-documentation.html`, `outputs/`), checks que regeneram páginas, `VERSION`, entradas versionadas do `CHANGELOG.md`, `ColorAtlas/App` e `Realase`. Só um agente por vez segura `@build`. Edite suas fontes em paralelo; pegue `@build` apenas para instalar, verificar e lançar, e libere logo depois.
4. Antes de cada escrita: releia o arquivo do disco (nunca reescreva um arquivo inteiro a partir de uma leitura antiga) e confirme com `check <agente> <arquivo>`.
5. CHANGELOG: cada lançamento acrescenta a própria seção no topo; nunca reescreva nem remova seções de outras versões. A versão é o próximo patch do `VERSION` lido no momento em que você segura `@build`.
6. Ao terminar: `python3 work/agent_lock.py release <agente>` e, se o outro agente precisar saber de algo, `note <agente> "<texto>"`.
7. Claims com mais de 3 h podem ser tomados com `--steal`; isso fica registrado no quadro. Não use `--steal` em claim recente.

## Version tracking

From v0.9 onward, maintain VERSION and CHANGELOG.md for every delivered app change. Follow work/RELEASES.md. Preserve published release notes and archives; use patch increments for fixes and minor increments for substantial features. Include the version in the standalone distribution.

Every app delivery must run work/package_standalone.py after relevant checks. It maintains ColorAtlas/App and ColorAtlas/Realase and invokes work/sync_release_folder.py to commit the local release branch. Verify the branch is clean and tracked App files match the delivery. Preserve runtime App/Data JSON and previous release archives.

## Code navigation and current validation

Start with `README.md` and `docs/ARCHITECTURE.md` for source ownership and runtime contracts. Use `python3 work/project_index.py context <feature>` and `work/module-map.json` to load only relevant source/test context. `python3 work/check_project.py --list` lists current checks; historical/known failing checks are explicit in the manifest and must not be silently treated as passing. Preserve installer order and the canonical/standalone distinction.

## GitHub branches and approval before publishing

Regra confirmada pelo usuário em 2026-10-19: toda alteração nova deve ser preparada em outra branch; publicar no site somente depois do seu “ok” para a alteração apresentada.

- Repositório: https://github.com/raffribeiro/ColorAtlas . Checkout Git durável: `github-repository/` neste workspace; branch de trabalho padrão `develop`.
- `develop`: alterações em andamento, fontes e builds de revisão. Para isolar pedidos simultâneos, use uma branch `feature/<nome>` baseada em `develop`.
- `main`: somente alterações aprovadas. `gh-pages`: somente arquivos do site aprovados. `release`: histórico de distribuição. Não use essas branches para desenvolvimento cotidiano.
- Antes da aprovação, faça a implementação, atualize documentação, gere e valide o build e disponibilize preview local/artefato para revisão. Pode fazer commit/push em `develop`; isso não publica o site.
- Um “ok” autoriza somente a revisão apresentada; não autoriza alterações futuras ou pendências de outros pedidos. Se houver mudanças não aprovadas na mesma branch, integre apenas os commits aprovados.
- Depois da aprovação, integre o que foi aprovado em `main`, execute o fluxo pertinente de versão/package e atualize `gh-pages` com a distribuição validada. Confira o deployment e o endereço público.
- Nenhum push em `develop` ou `main` deve disparar publicação automática. Preserve a configuração Pages em `gh-pages` (`/`). Não habilite um workflow que contorne a aprovação.
- A exigência anterior de package para toda entrega aplica-se à entrega aprovada; antes do “ok”, use build/preview de revisão sem atualizar `ColorAtlas/App`, `Realase` ou o site. Preserve o caminho do preview e os dados existentes.
- As fontes editáveis continuam nas localizações canônicas documentadas acima. Sincronize os arquivos de origem alterados, o snapshot canônico e os artefatos pertinentes para `Source/` no checkout `develop` antes do commit de revisão; não faça um commit apenas de HTML gerado.
