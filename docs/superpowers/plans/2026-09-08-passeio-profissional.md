# Passeio Profissional Opcional — Plano de Implementação

> **Para agentes:** use \`superpowers:subagent-driven-development\` ou \`superpowers:executing-plans\` para executar este plano tarefa a tarefa. Os passos usam caixas de seleção.

**Objetivo:** criar um passeio opcional de três paradas que apresente Matheus Henrique pelo mapa, sem bloquear currículo, exploração livre ou as mecânicas da fazenda.

**Arquitetura:** o estado do passeio fica em um módulo TypeScript puro e no save da fazenda. \`main.ts\` inicia, avança, cancela e persiste; \`game.ts\` apenas destaca o destino. Os painéis profissionais existentes continuam sendo a fonte única do conteúdo.

**Tecnologias:** TypeScript estrito, Phaser 3, Vite, node:test, Playwright/Chrome.

**Especificação:** \`docs/PLANO-EVOLUCAO.md\`, seções 3, 5, 10 e 11.

## Restrições globais

- A fazenda ocupa a janela inteira; \`/curriculo/\` permanece independente, disponível desde o início e sem Phaser.
- Mouse e toque devem bastar; nenhuma etapa depende de hover.
- Não inserir placas ou rótulos fixos no mapa.
- O passeio é opcional, cancelável e nunca exige moedas, missões, amizade, cultivo ou outra data.
- Usar somente fatos de \`src/portfolio.ts\`; não inventar informações profissionais.
- Persistir preferência de orientação e paradas abertas, sem marcar páginas não abertas como visitadas.
- Migrar saves v2 sem apagar fazenda, história ou dados válidos. Manter a chave \`vale-do-matheus:v1\`.
- Não adicionar dependências, serviços externos, analytics, deploy ou geração de arte por IA.
- Antes de concluir: \`npm test\`, \`npm run build\`, \`npm run test:browser\`, \`node scripts/resume-smoke.mjs http://127.0.0.1:5173\`, story smoke, decor smoke e \`git diff --check\`.

## Estrutura de arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| \`src/tour.ts\` | Estado puro, restauração e transições do passeio |
| \`tests/tour.test.ts\` | Testes de início, avanço, cancelamento e restauração |
| \`src/model.ts\` | Anexar \`tour\` ao save e migrar saves sem o novo campo |
| \`src/main.ts\` | Renderizar convite/cartão e conectar estado, páginas e mapa |
| \`src/game.ts\` | Destino temporário destacado, sem caminho automático |
| \`index.html\`, \`src/intro.css\` | Convite e cartão responsivo |
| \`scripts/browser-smoke.mjs\` | Fluxo completo, persistência e mobile |
| \`README.md\`, \`docs/PLANO-EVOLUCAO.md\` | Instruções e registro da entrega |

As três paradas são páginas profissionais existentes: \`about\`, \`projects\` e \`career\`. Elas impedem conteúdo duplicado e tornam o passeio independente de NPCs móveis.

## Interfaces

Criar em \`src/tour.ts\`:

    export const TOUR_STOPS = ["about", "projects", "career"] as const;
    export type TourStop = (typeof TOUR_STOPS)[number];

    export type TourState = {
      dismissed: boolean;
      active: boolean;
      current: number;
      visited: TourStop[];
    };

    export const newTour = (): TourState => ({
      dismissed: false, active: false, current: 0, visited: [],
    });
    export const restoreTour = (value: unknown): TourState => /* validado */;
    export const startTour = (tour: TourState): TourStop => /* próxima parada */;
    export const completeTourStop = (tour: TourState, page: string): TourStop | null => /* avanço */;
    export const cancelTour = (tour: TourState): void => /* dispensa */;
    export const resumeTour = (tour: TourState): TourStop | null => /* retoma */;

Em \`FarmState\`, acrescentar \`tour: TourState\`. Manter \`version: 2\`: o restaurador fornece \`newTour()\` ao save v2 sem o campo, então aumentar versão não traz benefício.

Adicionar em \`FarmScene\`:

    focusPortfolioStop(stop: TourStop): void;
    clearPortfolioStop(): void;

Usar este mapa de destinos:

    const PORTFOLIO_STOP_TARGETS: Record<TourStop, { targetId: string; label: string }> = {
      about: { targetId: "house", label: "1 de 3 · Conheça Matheus na casa" },
      projects: { targetId: "tractor", label: "2 de 3 · Visite a oficina" },
      career: { targetId: "Rosa", label: "3 de 3 · Converse com Rosa" },
    };

O foco só posiciona marcador e tint; não move o jogador, não redef ine \`pending\`, não chama \`open\` e não interrompe NPCs.

### Tarefa 1: modelo e migração

**Arquivos:** criar \`src/tour.ts\`, \`tests/tour.test.ts\`; modificar \`src/model.ts\`, \`tests/model.test.ts\`.

**Consome:** nenhum DOM, Phaser ou localStorage.

**Produz:** estado validado \`TourState\` para todo \`FarmState\`.

- [x] **Passo 1: escrever testes de transição.**

Criar em \`tests/tour.test.ts\`:

    import assert from "node:assert/strict";
    import { test } from "node:test";
    import {
      cancelTour, completeTourStop, newTour, restoreTour, resumeTour, startTour,
    } from "../src/tour";

    test("tour advances only after its current page opens", () => {
      const tour = newTour();
      assert.equal(startTour(tour), "about");
      assert.equal(completeTourStop(tour, "contact"), "about");
      assert.deepEqual(tour.visited, []);
      assert.equal(completeTourStop(tour, "about"), "projects");
      assert.equal(completeTourStop(tour, "projects"), "career");
      assert.equal(completeTourStop(tour, "career"), null);
      assert.deepEqual(tour.visited, ["about", "projects", "career"]);
      assert.equal(tour.active, false);
    });

    test("cancellation is saved and resume preserves progress", () => {
      const tour = newTour();
      startTour(tour);
      completeTourStop(tour, "about");
      cancelTour(tour);
      assert.equal(tour.dismissed, true);
      assert.equal(resumeTour(tour), "projects");
      assert.deepEqual(tour.visited, ["about"]);
    });

    test("invalid tour state becomes a new tour", () => {
      assert.deepEqual(restoreTour(null), newTour());
      assert.deepEqual(restoreTour({ dismissed: "yes", active: true, current: 9, visited: ["about"] }), newTour());
    });

Adicionar em \`tests/model.test.ts\` uma restauração de save v2 sem a propriedade \`tour\`, garantindo \`tour === newTour()\` e preservação de moedas, canteiros e \`valley\`.

- [x] **Passo 2: confirmar a falha.**

Rodar \`npx tsx --test tests/tour.test.ts tests/model.test.ts\`.

Esperado: falha de importação para \`../src/tour\`, seguida por falhas de estado até a implementação.

- [x] **Passo 3: implementar.**

\`restoreTour\` aceita somente: booleanos \`dismissed\` e \`active\`; inteiro \`current\` entre 0 e 3; \`visited\` como prefixo ordenado e sem repetição de \`TOUR_STOPS\`; e coerência \`current === visited.length\`. Save sem \`tour\` retorna \`newTour()\`.

\`completeTourStop\` só avança se \`active\` e \`page === TOUR_STOPS[current]\`; adiciona a parada uma vez e retorna a próxima. Depois da terceira, deixa \`active: false\` e retorna \`null\`. \`cancelTour\` deixa \`active: false, dismissed: true\`. \`resumeTour\` remove a dispensa e retorna a próxima parada, ou \`null\` se concluído.

Em \`src/model.ts\`, importar \`newTour\` e \`restoreTour\`; criar \`tour: newTour()\` em \`newFarm\` e \`tour: restoreTour(s.tour)\` em \`restore\`.

- [x] **Passo 4: executar testes.**

Rodar \`npx tsx --test tests/tour.test.ts tests/model.test.ts tests/valley.test.ts\`.

Esperado: todos passam; saves antigos preservam a fazenda e recebem o estado novo.

- [ ] **Passo 5: commit.**

    git add src/tour.ts src/model.ts tests/tour.test.ts tests/model.test.ts
    git commit -m "feat: persist optional portfolio tour state"

### Tarefa 2: destaque no mundo

**Arquivos:** modificar \`src/game.ts\`, \`src/main.ts\`, \`scripts/browser-smoke.mjs\`.

**Consome:** \`TourStop\`.

**Produz:** \`FarmScene.focusPortfolioStop(stop)\` e \`FarmScene.clearPortfolioStop()\`.

- [x] **Passo 1: adicionar check de navegador que falha.**

Após entrar no jogo, acrescentar ao smoke:

    await page.getByRole("button", { name: "Conhecer Matheus" }).click();
    await page.getByRole("button", { name: "Começar passeio" }).click();
    await page.waitForFunction(
      () => window.__farm.scene.portfolioStop?.id === "house",
    );
    assert.equal(
      await page.evaluate(() => window.__farm.scene.playerPath.length), 0,
    );

Expor \`portfolioStop\` somente no diagnóstico de desenvolvimento, da mesma forma que \`playerPath\` já é observado.

- [x] **Passo 2: confirmar a falha.**

Com \`npm run dev\` ativo, rodar \`node scripts/browser-smoke.mjs http://127.0.0.1:5173\`.

Esperado: falha porque botão e destino ainda não existem.

- [x] **Passo 3: implementar marcador dedicado.**

Em \`src/game.ts\`, importar \`TourStop\`, criar \`private portfolioStop?: Target\` e \`tourMarker\` separado de \`marker\` para não apagar destinos de caminhada. \`focusPortfolioStop\` encontra o alvo pelo ID, limpa tint anterior, posiciona o marcador, aplica tint ao sprite e mostra o texto do mapeamento. \`clearPortfolioStop\` remove apenas esse tint e marcador.

Para Rosa, atualizar o marcador no \`update\` a partir de seu sprite/target; nunca criar um caminho automático. Se o alvo não existir, limpar foco e mostrar “O próximo lugar ainda está sendo preparado.”.

Em \`main.ts\`, adicionar:

    function focusTourStop(stop: TourStop | null) {
      if (stop) scene?.focusPortfolioStop(stop);
      else scene?.clearPortfolioStop();
    }

- [x] **Passo 4: verificar.**

Rodar \`npm run build\` e \`node scripts/browser-smoke.mjs http://127.0.0.1:5173\`.

Esperado: o alvo da casa é destacado e a rota do jogador continua vazia.

- [ ] **Passo 5: commit.**

    git add src/game.ts src/main.ts scripts/browser-smoke.mjs
    git commit -m "feat: highlight portfolio tour destinations"

### Tarefa 3: convite e cartão de orientação

**Arquivos:** modificar \`index.html\`, \`src/intro.css\`, \`src/main.ts\`, \`scripts/browser-smoke.mjs\`.

**Consome:** estado e funções de \`src/tour.ts\`, foco do mapa.

**Produz:** \`#portfolio-tour\` e os botões \`data-tour="start"\`, \`resume\`, \`cancel\` e \`open-current\`.

- [x] **Passo 1: escrever fluxo de smoke que falha.**

Depois do início do passeio, inserir:

    await page.locator('#portfolio-tour [data-tour="open-current"]').click();
    await page.getByRole("heading", { name: "Prazer, Matheus." }).waitFor();
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => window.__farm.state.tour.current === 1);
    await page.locator('#portfolio-tour [data-tour="cancel"]').click();
    await page.waitForFunction(() => window.__farm.state.tour.dismissed === true);
    await page.reload({ waitUntil: "networkidle" });
    await page.locator("#enter-game:enabled").click();
    await page.locator('#portfolio-tour [data-tour="resume"]').click();
    assert.equal(await page.evaluate(() => window.__farm.state.tour.current), 1);

Depois, abrir \`projects\` e \`career\` por \`open-current\`, fechando cada painel. Confirmar \`current === 3\`, \`active === false\`, as três páginas em \`visited\` e conclusão com currículo/contato. Abrir \`about\` pelo menu após concluir para confirmar acesso livre. No cenário mobile, confirmar que \`#portfolio-tour\` cabe na viewport e seu botão é clicável.

- [x] **Passo 2: confirmar a falha.**

Rodar \`node scripts/browser-smoke.mjs http://127.0.0.1:5173\`.

Esperado: primeiro seletor de \`#portfolio-tour\` não encontrado.

- [x] **Passo 3: criar HTML e regras de apresentação.**

Em \`index.html\`, inserir depois de \`.portfolio-context\`:

    <aside id="portfolio-tour" class="portfolio-tour" hidden aria-live="polite">
      <span id="tour-kicker">PASSEIO PROFISSIONAL</span>
      <h2 id="tour-title"></h2>
      <p id="tour-description"></p>
      <div id="tour-actions"></div>
    </aside>

No diretório do portfólio, colocar um botão \`data-tour="start"\` antes da grade. Seu texto é “Começar passeio”, ou “Retomar passeio” se há progresso incompleto. Não remover atalhos de seções.

Em \`main.ts\`, criar este conteúdo de interface:

    const tourCopy = {
      about: {
        title: "1 de 3 · Comece pela casa",
        description: "Conheça Matheus, sua formação e a forma como ele une produto e engenharia.",
        button: "Abrir apresentação →",
      },
      projects: {
        title: "2 de 3 · Siga até a oficina",
        description: "Veja os projetos e as tecnologias que ajudam ideias a ganhar forma.",
        button: "Abrir projetos →",
      },
      career: {
        title: "3 de 3 · Encontre Rosa",
        description: "Conheça a trajetória profissional e escolha como entrar em contato.",
        button: "Abrir trajetória →",
      },
    } as const;

Criar \`renderTour()\`: esconder quando nunca iniciado; mostrar convite de retomada quando dispensado; exibir a parada atual com abrir/cancelar quando ativo; e, quando há três paradas visitadas, exibir “Passeio concluído” com link \`curriculo/\` e botão \`data-page="contact"\`.

Processar \`data-tour\` antes de \`data-page\`: \`start\` usa \`startTour\`; \`resume\` usa \`resumeTour\`; \`cancel\` usa \`cancelTour\`; \`open-current\` chama \`open(stop)\`. Em todos os casos: salvar, renderizar, focar ou limpar o destino conforme o retorno. No início de \`open(page)\`, chamar \`completeTourStop\` somente se ativo, renderizar o cartão e focar a próxima parada. Fechar modal, Diário, loja e ferramentas não avançam o passeio.

No CSS: desktop abaixo do contexto profissional, com contraste e z-index acima do canvas. Em telas menores de 700px, quando ativo, posicionar acima da toolbar e limitar largura a \`min(calc(100vw - 24px), 360px)\`. Incluir foco visível e respeitar \`prefers-reduced-motion\`.

- [x] **Passo 4: verificar fluxo completo.**

Rodar:

    npm test
    npm run build
    node scripts/browser-smoke.mjs http://127.0.0.1:5173
    node scripts/resume-smoke.mjs http://127.0.0.1:5173

Inspecionar capturas desktop/mobile. Confirmar que o cartão não cobre a toolbar, que o marcador não interfere em destino de caminhada, que o avanço ocorre só ao abrir a página, e que cancelar/recarregar não altera fazenda ou história.

- [ ] **Passo 5: commit.**

    git add index.html src/intro.css src/main.ts scripts/browser-smoke.mjs
    git commit -m "feat: add optional professional portfolio tour"

### Tarefa 4: documentação e regressão da história

**Arquivos:** modificar \`README.md\`, \`docs/PLANO-EVOLUCAO.md\`.

- [x] **Passo 1: documentar somente depois da implementação validada.**

No README, adicionar em Jogar: “Use Conhecer Matheus → Começar passeio para uma rota opcional de apresentação, projetos e trajetória. Pode interromper a qualquer momento; currículo e seções continuam livres.”

No roteiro de evolução, marcar a etapa 1 entregue apenas quando os critérios forem validados; manter as etapas 2 a 5 pendentes.

- [x] **Passo 2: executar regressões.**

Com o servidor ativo:

    node --import tsx scripts/story-smoke.mjs http://127.0.0.1:5173
    node --import tsx scripts/decor-smoke.mjs http://127.0.0.1:5173
    git diff --check

Esperado: sete capítulos, encomendas, descobertas e decorações continuam verdes; sem erro de espaço no diff.

- [ ] **Passo 3: commit.**

    git add README.md docs/PLANO-EVOLUCAO.md
    git commit -m "docs: describe professional portfolio tour"

## Revisão

Cobertura: Tarefa 1 trata persistência/migração; Tarefa 2, o mundo; Tarefa 3, convite, avanço, cancelamento, acesso livre e mobile; Tarefa 4, documentação e regressões de Cartas do Vale.

Escopo excluído: novos cases, informações profissionais novas, automação rural, skins, leite, ovos, capítulos novos, deploy e refatoração geral.
