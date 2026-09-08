# Cartas do Vale Implementation Plan

> **For agentic workers:** Execute inline, task by task, under the user's approval to implement the recommendation. Use the test-driven-development verification cycle for rules. Keep the running local project available for the user.

**Goal:** Implementar sete visitas de história e atividades diárias persistentes.

**Architecture:** As regras e o calendário ficam em `valley.ts`, sem dependência de Phaser. Conteúdo narrativo e recompensas ficam em `valley-content.ts`; painéis HTML em `valley-view.ts`; mudanças visuais em `valley-world.ts`. O save existente migra para v2 preservando a fazenda.

**Tech Stack:** TypeScript, Phaser, Vite, Node test runner, Playwright; sem novas dependências.

**Spec:** `docs/superpowers/specs/2026-09-07-cartas-do-vale-design.md`.

## Global Constraints

- Um capítulo por data de calendário, no fuso persistido do navegador.
- Sem sequência obrigatória, expiração de capítulos ou perda por ausência.
- Preservar saves v1, movimento por clique, tela cheia e portfólio livre.
- PNGs gerados por código; sem placas no cenário; sem hospedagem.

## Task 1: Estado, calendário, entregas e recompensas

**Files:** criar `src/valley.ts`, `src/valley-content.ts`, `tests/valley.test.ts`; modificar `src/model.ts`.

**Interfaces:** `newValley(now, timezone)`, `restoreValley(raw, now)`, `beginDay(farm, now)`, `readLetter(farm, now)`, `talkTo(farm, npc, now)`, `careFor(farm, animal, now)`, `workAt(farm, site, now)`, `completeChapter(farm, npc, now)`, `deliverRequest(farm, npc, now)`, `discover(farm, now)`, `buyDecoration(farm, id)`, `toggleDecoration(farm, id)` e `chapterStatus(farm, now)`.

- [x] Escrever e executar testes: saves v1 continuam com moedas/canteiros; duas conclusões na mesma data são recusadas; a data seguinte libera só um capítulo; dez dias ausente não avançam automaticamente.
- [x] Implementar o estado v2 e as funções de transição. Cada ação retorna `{ ok, message }`; a UI não concede recursos diretamente.
- [x] Adicionar testes de sete capítulos, inventário insuficiente, presentes únicos, encomenda/descoberta únicas, amizade limitada e decoração idempotente.
- [x] Executar `npm test` e corrigir até passar.

Exemplo de contrato a verificar:

```ts
const farm = newFarm(new Date('2026-09-07T15:00:00Z').getTime());
readLetter(farm, now);
talkTo(farm, 'Lia', now);
farm.produce.carrot = 2;
assert.equal(completeChapter(farm, 'Lia', now).ok, true);
assert.equal(farm.produce.carrot, 0);
assert.equal(completeChapter(farm, 'Lia', now).ok, false);
```

## Task 2: Diário e integração das ações

**Files:** criar `src/valley-view.ts`, `src/valley.css`; modificar `src/main.ts`, `index.html` e teste de navegador.

**Interfaces:** `renderValleyPage(page, farm, context, now): string | null`; `renderResidentStory(farm, npc, now): string`; `updateDailyHud(farm, now): void`. Consomem as transições da tarefa 1.

- [x] Acrescentar teste de navegador para abrir a carta, conferir os objetivos, conversar com Lia e entregar duas cenouras sem teletransporte de recompensa.
- [x] Adicionar Diário à interface, a carta ao correio e as entregas aos diálogos. Reabrir o painel atual após cada ação; atualizar a virada de data enquanto a página permanece aberta.
- [x] Exibir cartas lidas, encomenda, coleção e decoração. Preservar menu profissional e a loja atual.
- [x] Verificar estado salvo ao recarregar e ausência de mensagens de conteúdo provisório.

## Task 3: Reconstrução visível e novas rotinas

**Files:** criar `src/valley-world.ts`; modificar `src/game.ts` e `scripts/generate-assets.mjs`.

**Interfaces:** `ValleyWorld.refresh()` aplica o estado; `ValleyWorld.update(time)` anima moinho e descoberta. Registra pontos de interação pela mesma navegação usada no jogo.

- [x] Gerar moinho abandonado/restaurado, hélices, poço, banca, bancada, pacote de sementes e decorações com a paleta atual.
- [x] Colocar as construções em áreas livres e adicionar colisões e acessos. Atividades de reconstrução exigem aproximação pelo clique.
- [x] Mostrar mudanças por capítulo concluído. Adaptar rotas dos moradores para incluir a feira recuperada.
- [x] Inspecionar capturas de início e final da história, incluindo a ausência de placas.

## Task 4: Verificação e entrega local

**Files:** atualizar `README.md`, `PLANO.md` e este checklist.

- [x] Rodar `npm test` e `npm run build`.
- [x] Rodar teste de navegador com tempo controlado por sete datas e confirmar carta, encomenda, descoberta, decoração, replay de cartas e portfólio.
- [x] Servir localmente com polling, sem watchers nativos. Registrar build, preview, comandos e limites no README.
- [x] Entregar o link local e resumir o arco de sete visitas; não habilitar hospedagem.

## Verificação realizada em 2026-09-08

- `npm test`: 19 testes passaram, incluindo configuração sem watchers nativos, saves, calendário e entregas.
- `npm run build`: passou; mantém o aviso de tamanho do bundle do Phaser.
- `scripts/browser-smoke.mjs`: cultivo, compra/venda, rotinas, portfólio, persistência e layout móvel passaram.
- `scripts/story-smoke.mjs`: sete capítulos por cliques em sete datas, trabalho nos locais, cuidados com animais e cenário restaurado passaram. Nos capítulos 2–7, produtos de entrega são fixtures; o cultivo completo é verificado separadamente.
- `scripts/decor-smoke.mjs`: compra, sobreposição ao telhado, persistência, remoção gratuita e painel móvel passaram. A revisão identificou a sobreposição das bandeirinhas; o teste reproduziu a falha antes da correção.
- `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`: iniciado; alterações detectadas pelo polling sem `ENOSPC`. Nenhum aplicativo externo foi encerrado e nenhum limite do sistema foi alterado.
- Alterações locais na branch `feat/cartas-do-vale`; sem push ou hospedagem nesta entrega.
