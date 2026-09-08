# Portfólio — fazenda interativa

## Objetivo

Criar um portfólio pessoal apresentado como um jogo de fazenda 2D no navegador. A primeira visita deve oferecer aproximadamente dez minutos de exploração e um ciclo completo de plantio, colheita, venda e compra de uma melhoria. A estrutura deve permitir expansões que incentivem visitas futuras.

Este documento registra o planejamento e as decisões de produto. A primeira versão jogável já está implementada; instruções de execução e limites atuais estão no README.

O roteiro de evolução a partir de 8 de setembro de 2026 está em [Próximos passos do portfólio](docs/PLANO-EVOLUCAO.md), com estado atual, prioridades propostas, critérios de conclusão e limites de escopo. As propostas iniciais abaixo preservam o histórico; para os próximos passos, consulte esse roteiro.

## Decisões confirmadas

- Repositório público `mhdsilva/imatheus`, com informações profissionais das seções reais do `meta-portifolio`. Somente o código será publicado por enquanto; hospedagem não foi autorizada nesta etapa.
- O site inteiro é o jogo em tela cheia, sem cabeçalho ou conteúdo de página ao redor do cenário.
- O cenário não terá plaquinhas nem nomes fixos identificando os lugares. O conteúdo continua acessível por interações e pelo menu interno.
- A entrada acontece por uma tela de carregamento com instruções, seguida diretamente pelo jogo.
- Elementos menores no cenário, principalmente personagens, com mais detalhe nos desenhos. Os personagens usam quadros-fonte de 32 × 48 pixels e são exibidos em escala reduzida.
- Visual de pixel art colorido e acolhedor, inspirado no clima rural de Stardew Valley, com identidade própria.
- Sprites PNG produzidos por código, com desenhos controlados, paleta compartilhada e exportação reproduzível.
- Mouse suficiente para todas as ações; teclado não obrigatório.
- Clique no chão para caminhar até um destino, contornando obstáculos.
- Clique em personagens e objetos para se aproximar e interagir.
- NPCs com atividades e deslocamentos próprios.
- Fazenda com vacas, galinhas, celeiro, trator e plantações.
- Informações de carreira, experiências, tecnologias e projetos distribuídas pelo mundo.
- Jogo com colheita, venda e compra, além da exploração do portfólio.
- Sessão inicial de cerca de dez minutos, com possibilidade de expansão futura.

## Propostas de escopo inicial

### Mundo e portfólio

Um mapa compacto com casa, oficina/garagem, mercado, celeiro, galinheiro e horta. A câmera acompanha o jogador, respeitando os limites do mapa.

| Local                | Conteúdo ou atividade                              |
| -------------------- | -------------------------------------------------- |
| Casa                 | Apresentação pessoal e currículo                   |
| Oficina              | Projetos e tecnologias                             |
| Casa e menu interno  | Experiências e trajetória                          |
| Mercado              | Venda de produtos e compra de sementes e melhorias |
| Celeiro e galinheiro | Animais e atividades rurais                        |
| Horta                | Plantar, regar e colher                            |
| Caixa de correio     | Contato e links profissionais                      |

O conteúdo profissional também terá acesso direto por um menu HTML, sem exigir caminhada, moedas ou missões. Textos longos usarão fonte legível. Links reais e dados profissionais serão preenchidos com informações fornecidas pelo proprietário; conteúdo provisório deve estar identificado, sem inventar experiências.

### Ritmo da primeira visita

| Tempo aproximado | Atividade sugerida                                       |
| ---------------- | -------------------------------------------------------- |
| 0–1 min          | Chegada, apresentação curta e aprendizado do clique      |
| 1–3 min          | Colheita de plantas já maduras e apresentação do mercado |
| 3–5 min          | Venda, compra de sementes e primeiro plantio             |
| 5–8 min          | Exploração do portfólio enquanto as plantas crescem      |
| 8–10 min         | Nova colheita e compra de uma melhoria visível           |

Esses tempos orientam o balanceamento, sem obrigar uma ordem. Uma possível missão introdutória é preparar a fazenda para uma feira. A missão permanece uma proposta, não uma decisão confirmada.

O visitante começa com plantas maduras e recursos suficientes para experimentar o ciclo. Nesta versão, não haverá morte de plantações, energia limitante ou obrigação de retornar diariamente. Custos, produção e duração do crescimento serão ajustados por uma partida completa de validação.

### Mecânicas

- Três tipos de plantação com estados visuais de crescimento.
- Inventário, sementes, produtos e moedas.
- Venda de produtos e compra de sementes.
- Uma melhoria comprável com efeito visível na fazenda.
- Vacas e galinhas com atividades ambientais; produção de leite e ovos pode entrar depois do ciclo agrícola básico.
- Trator presente na garagem. Direção e automação de tarefas ficam para uma expansão.
- Salvamento automático local no navegador, com versão do formato salvo. Não oferece sincronização entre dispositivos.

### Controles por clique

| Alvo                | Resultado                                            |
| ------------------- | ---------------------------------------------------- |
| Chão acessível      | Caminhar até o ponto escolhido                       |
| NPC                 | Caminhar até uma posição próxima e iniciar conversa  |
| Canteiro            | Aproximar-se e executar a ação contextual disponível |
| Mercado             | Aproximar-se e abrir a loja                          |
| Objeto profissional | Aproximar-se e abrir seu conteúdo                    |

Um novo clique substitui o destino e cancela a interação anterior ainda pendente. A ação só acontece ao alcançar uma posição válida próxima ao alvo. Cliques na interface não movimentam o personagem.

O destino recebe um marcador. Objetos interativos recebem destaque e indicação da ação ao passar o mouse. Destinos inacessíveis recebem retorno visual, sem atravessar obstáculos ou prender o personagem em tentativas infinitas.

Na horta, a ação depende do estado: plantar a semente selecionada, regar ou colher. Durante compras e diálogos, a interface captura os cliques. Quando o alvo é um NPC em movimento, o caminho deve acompanhar seu deslocamento; ao iniciar a conversa, ele pausa e vira para o jogador, retomando a rotina ao final.

### Vida dos NPCs

Começar com três moradores e rotinas programadas, sem IA generativa:

- Fazendeira: caminha até os canteiros, rega e leva produtos ao mercado.
- Mecânico: trabalha no trator, faz uma pausa e visita a loja.
- Comerciante: organiza produtos e circula pela praça.

As rotinas alternam deslocamento, atividade e descanso. Os animais alternam caminhada, alimentação e repouso dentro de áreas delimitadas. O sistema precisa tratar caminhos bloqueados e permitir que diálogos interrompam e retomem atividades.

Na primeira versão, atividades agrícolas dos NPCs serão ambientais: não consumirão sementes, produtos ou moedas do visitante.

## Produção de arte

Escala atual: terreno em blocos de 16 × 16 pixels, personagens com quadros-fonte de 32 × 48 pixels exibidos menores no mundo e construções compostas por múltiplos blocos. A densidade adicional permite detalhes de rosto, cabelo, roupas e acessórios.

Os desenhos serão descritos por código, usando matrizes de pixels e formas pequenas com cores de uma paleta comum. A aleatoriedade será reservada a detalhes ambientais e terá semente fixa para exportações reproduzíveis.

O gerador produz PNGs com transparência e metadados dos quadros de animação. Não há geração de sprites durante a visita ao site. A renderização usa suavização desabilitada; a câmera adapta a escala ao tamanho da tela para preencher o navegador.

Personagens terão quatro direções, com estado parado e caminhada inicialmente. Ações de trabalho serão adicionadas conforme as mecânicas. Árvores, telhados e personagens devem se sobrepor de forma coerente com sua posição no chão.

A geração por código controla dimensões, paleta e alinhamento, mas não substitui a inspeção visual de proporções, costuras do terreno e animações.

## Estrutura técnica proposta

- TypeScript e Phaser para renderização, cenas, entrada e animações.
- HTML/CSS para textos profissionais, diálogos e menus legíveis.
- Busca de caminhos sobre uma grade de colisão compartilhada pelo mapa.
- Tiled como opção para editar o mapa e marcar obstáculos e pontos de interação.
- Conteúdo profissional em dados separados das regras do jogo.
- Hospedagem estática e persistência local no início, sem conta obrigatória ou servidor de jogo.

Separar módulos pelas responsabilidades que concentram:

- Mundo e navegação: posições, colisões, caminhos e pontos de interação.
- Simulação da fazenda: inventário, economia, crescimento e ações válidas.
- Rotinas: destinos, atividades e interrupções dos moradores e animais.
- Apresentação: sprites, câmera, animações e retorno visual.
- Portfólio: conteúdo profissional e sua apresentação.
- Persistência: gravação, leitura, versão e recuperação de dados locais inválidos.

As interfaces devem ser pequenas: a apresentação solicita ações à simulação e exibe seus resultados, sem duplicar regras econômicas nos menus. Relógio e aleatoriedade precisam ser controláveis para verificar crescimento e rotinas.

Referências técnicas consultadas no planejamento: [Phaser](https://docs.phaser.io/) e [camadas do Tiled](https://doc.mapeditor.org/en/stable/manual/layers/).

## Entregas e critérios de conclusão

### 1. Cena visual e navegação

Uma área com personagem, casa, cercas, canteiros, uma vaca, duas galinhas e dois NPCs demonstrando atividades. Todos os sprites vêm do gerador em código.

Concluída quando for possível caminhar por clique, contornar obstáculos, substituir o destino, reconhecer alvos interativos e conversar com um NPC que retoma a rotina. A cena deve permitir avaliar paleta, escala, transparência, animação e sobreposição antes da produção de mais arte.

### 2. Experiência completa de dez minutos

Expandir para os locais previstos, três NPCs, conteúdo profissional provisório identificado, ciclo agrícola completo, loja, melhoria e salvamento local.

Concluída quando uma partida nova permitir colher, vender, comprar sementes, plantar, regar, esperar o crescimento e comprar uma melhoria; recarregar deve preservar o progresso. O portfólio deve ser acessível diretamente sem completar tarefas.

### 3. Conteúdo real e acabamento

Inserir apresentação, experiências, tecnologias, projetos, currículo e links reais. Ajustar economia após uma sessão cronometrada. Refinar animações, legibilidade, carregamento e retorno das interações. Sons são uma possibilidade de acabamento, com controle de áudio.

Validar regras de compra, venda e crescimento, interrupção de caminhos, cliques na interface, retomada de rotinas e recuperação de salvamento inválido. Conferir visualmente os sprites e executar uma visita completa pelo navegador.

## Evoluções futuras

A expansão **Cartas do Vale** acrescenta sete capítulos em visitas não consecutivas, encomendas diárias, sete lembranças, amizade e três decorações. Moinho, poço, bancada e feira mudam conforme a história; os moradores incluem a feira em suas rotinas após a reconstrução. Especificação em `docs/superpowers/specs/2026-09-07-cartas-do-vale-design.md`.

Trator dirigível, leite e ovos como produção, novas plantações, mais decorações e pedidos, áreas desbloqueáveis e ciclo visual de dia e noite. Retorno em outros dias deve trazer conteúdo e progresso, sem punir a ausência.

Suporte a celular ainda não foi definido. A navegação por clique facilita a adaptação para toque, mas será necessário planejar tamanho de controles, enquadramento, ausência de hover e desempenho em telas menores.

## Próximas definições

Podemos iniciar a cena de validação com personagem e textos provisórios. Antes da publicação, precisamos definir a aparência do avatar, receber o conteúdo profissional e confirmar idiomas e dispositivos prioritários.
