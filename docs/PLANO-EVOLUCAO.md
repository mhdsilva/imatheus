# Próximos passos do portfólio

Data: 8 de setembro de 2026.

Status: proposta para revisão. Este documento autoriza somente planejamento; nenhuma etapa abaixo foi iniciada por sua criação. A ordem é recomendada, e funcionalidades novas dependem da revisão do Matheus antes da implementação.

## 1. Direção do produto

O visitante deve sair sabendo quem é Matheus, que problemas ele sabe resolver e como entrar em contato. A fazenda oferece uma maneira acolhedora de conhecer esse trabalho e um motivo próprio para retornar.

Planejar três ritmos de visita:

| Visita | Experiência pretendida | Sinal de sucesso |
| --- | --- | --- |
| Direta, 1–2 minutos | Ler o currículo e localizar experiências, projetos e contato | A pessoa encontra as informações sem entrar no jogo |
| Exploração inicial, cerca de 10 minutos | Conhecer Matheus enquanto conversa, explora e experimenta a fazenda | A pessoa entende que está em um portfólio e consegue citar um trabalho ou competência concreta |
| Retorno, cerca de 5 minutos | Encontrar uma novidade, realizar uma atividade e perceber uma mudança | A sessão tem um pequeno desfecho satisfatório e pode terminar sem obrigação de continuar |

Os tempos são metas de experiência a validar em partidas, não limites impostos ao visitante.

## 2. Base existente

Conferida nos arquivos do projeto nesta data; este planejamento não executou novamente os testes do jogo.

- Mundo fullscreen, caminhada por clique e moradores e animais com deslocamentos próprios.
- PNGs originais gerados por código e personagens pequenos com quadros-fonte detalhados.
- Plantio, rega, colheita, venda, compra de sementes e expansão de canteiros.
- História Cartas do Vale com sete capítulos, encomendas diárias, lembranças, amizade e três decorações.
- Reconstruções que mudam o cenário e participação dos moradores na feira após o final.
- Salvamento local, com migração do formato antigo; sem conta ou sincronização.
- Conteúdo profissional compartilhado entre o jogo e `/curriculo/`, inclusive currículo em HTML sem JavaScript e impressão.
- Abertura ampliada e translúcida, menu Conhecer Matheus e atalhos profissionais nas conversas.

As principais oportunidades estão na profundidade dos projetos apresentados, na ligação entre exploração e carreira, nas atividades visíveis dos NPCs e na variedade depois dos sete capítulos. A história da fazenda e a apresentação profissional ainda podem se conectar melhor.

## 3. Restrições preservadas

- O jogo ocupa a janela inteira; o currículo direto continua sendo uma alternativa independente.
- Nenhuma plaquinha ou identificação fixa espalhada pelo mapa.
- Mouse suficiente para jogar; toque precisa de alvos confortáveis, sem depender de hover.
- Pixel art colorida e acolhedora, com identidade própria e PNGs gerados por código.
- Manter personagens pequenos e detalhados; preparar futuras skins sem aumentar sua escala por padrão.
- Informações profissionais acessíveis sem moedas, amizade, missões ou espera por outro dia.
- Ausência não causa perda de colheitas, amizade, recompensas já ganhas ou progresso.
- Não inventar experiências, resultados, métricas, clientes ou depoimentos.
- Preservar os saves existentes ao acrescentar dados.
- Não mudar limites do sistema ou fechar outros aplicativos para resolver watchers; preservar a solução local do projeto.
- Somente repositório público por enquanto. Deploy, serviços externos e coleta de dados exigem decisão separada.
- Manter Matheus Henrique como identidade visível; não retomar Vale do Matheus como nome do portfólio.

## 4. Alternativas de evolução

| Abordagem | Ganho principal | Custo ou limitação |
| --- | --- | --- |
| Portfólio e jogo em etapas conectadas — recomendada | Melhora a apresentação profissional e cria retornos com conteúdo e personalidade | Exige manter o foco de cada entrega |
| Expandir primeiro a simulação rural | Mais atividades, itens e progressão | Pode aumentar bastante o jogo sem melhorar o entendimento sobre Matheus |
| Priorizar apenas conteúdo profissional | Cases e currículo ficam mais fortes rapidamente | O retorno diário e a vida da fazenda evoluem pouco |

A proposta segue a primeira abordagem. Cada etapa precisa resultar em uma melhoria perceptível, utilizável e verificável por si só.

## 5. Etapa 1 — Uma visita que apresenta Matheus

Prioridade: primeira entrega recomendada.

O plano técnico está em [Passeio Profissional Opcional](superpowers/plans/2026-09-08-passeio-profissional.md). A implementação local foi concluída em 8 de setembro de 2026: há início, pausa, retomada persistente, três paradas destacadas e encerramento com atalhos para currículo e contato.

### Experiência proposta

- Oferecer na entrada do jogo um convite opcional: conhecer Matheus em um passeio curto. Exploração livre e currículo continuam disponíveis.
- Organizar três paradas sugeridas: casa/Lia para apresentação e formação; oficina/Bento para projetos e tecnologias; conversa com Rosa para trajetória e contato.
- Usar diálogos breves, destaque temporário no destino e uma orientação recolhível na interface. Não adicionar placas ao cenário.
- Permitir interromper ou retomar o passeio, abrir qualquer seção diretamente e mudar de destino por clique.
- Ao final, oferecer contato, currículo e exploração livre, sem exigir terminar atividades agrícolas.
- Reduzir a orientação persistente depois que a pessoa a dispensar. O menu profissional permanece encontrável.
- Preservar o acesso à loja nas conversas comerciais: conhecer a carreira e comprar sementes devem continuar sendo ações distintas e claras.

### Critérios de conclusão

- Uma pessoa em uma primeira visita identifica de quem é o portfólio e encontra apresentação, projetos e contato sem explicação externa.
- O passeio funciona somente com mouse; no celular, nenhuma instrução essencial depende de passar o cursor.
- Cancelar o passeio não interfere em caminhos, missões, economia ou salvamento.
- Currículo e todas as seções profissionais continuam disponíveis desde o início.
- Recarregar preserva a preferência de orientação, sem marcar conteúdo não aberto como visitado.

## 6. Etapa 2 — Projetos com evidências do trabalho

Prioridade: após o passeio; levantamento de conteúdo pode acontecer antes.

### Entregas propostas

- Apresentar inicialmente dois cases completos dos projetos públicos já disponíveis: a fazenda e o Meta-Developer Portfolio.
- Estruturar cada case com contexto, problema, participação do Matheus, decisões técnicas, dificuldades, resultado verificável e links públicos.
- Acrescentar capturas reais dos projetos e explicações curtas de decisões importantes.
- Relacionar tecnologias a exemplos de uso nos cases, além da lista atual de ferramentas.
- Compartilhar os dados entre jogo e currículo, com resumo no currículo e aprofundamento nos painéis de projetos.
- Reservar futuros cases profissionais para informações que Matheus confirmar como públicas.

Status em 8 de setembro de 2026: os dois cases dos projetos públicos foram adicionados aos painéis do jogo, com contexto, decisões técnicas e evidências dos repositórios. Capturas reais e cases de experiências profissionais continuam dependentes de uma curadoria posterior.

### Conteúdo que depende do Matheus

Para cada case de empresa: o que pode ser divulgado, qual foi sua responsabilidade, que decisões tomou e quais resultados podem ser demonstrados. Sem números confirmados, descrever resultados qualitativos verificáveis. Não acessar sistemas de trabalho ou publicar material de clientes para preencher essas lacunas.

### Critérios de conclusão

- Cada case permite entender o problema e a contribuição pessoal, além da tecnologia utilizada.
- Links e imagens representam o projeto real; nenhum dado confidencial ou conquista presumida entra no conteúdo.
- Jogo e currículo não divergem nos fatos compartilhados.

## 7. Etapa 3 — Moradores com personalidade e atividades visíveis

Prioridade: depois de consolidar a apresentação profissional.

### Entregas propostas

- Dar a Lia, Bento e Rosa pequenas histórias próprias, preferências e objetivos relacionados à recuperação da fazenda.
- Tornar suas atividades reconhecíveis: regar, examinar o trator, organizar a banca, descansar e conversar na feira.
- Gerar por código os quadros de animação necessários, mantendo paleta, escala e alinhamento existentes.
- Fazer a amizade abrir falas e cenas opcionais. Informações profissionais continuam públicas desde a primeira visita.
- Variar falas pelo capítulo e pelo que já aconteceu; evitar anunciar acontecimentos que ainda não foram liberados.
- Pausar a atividade durante uma conversa e retomá-la ao terminar, com tratamento de caminhos bloqueados.

Status em 8 de setembro de 2026: as rotinas agora mostram atividades textuais no mundo e cada morador alterna diálogo contextual após a primeira conversa diária. Quadros de animação de trabalho e cenas de amizade continuam como evolução futura.

### Critérios de conclusão

- É possível reconhecer pelo menos uma atividade própria de cada morador observando o cenário.
- Diálogos respeitam o estado da história e não se repetem integralmente a cada clique.
- NPCs não gastam itens ou moedas do visitante em suas rotinas ambientais.
- Conversar durante uma caminhada ou atividade não deixa personagem preso nem ação duplicada.

## 8. Etapa 4 — Vida depois da feira

Prioridade: ampliar o retorno após os sete capítulos existentes.

### Ciclo diário proposto

Chegar e perceber uma novidade → escolher uma atividade principal → conversar ou produzir → receber uma recompensa → ver uma pequena mudança no mundo.

Começar com um conjunto finito e bem escrito de acontecimentos pós-feira. Exemplos de propostas: preparar uma banca temática com Rosa, ajudar Bento em uma melhoria da oficina e organizar um jardim com Lia. Esses acontecimentos são ficção da fazenda, não relatos da carreira real.

Status em 8 de setembro de 2026: a primeira entrega está implementada com três variações diárias (Lia, Bento e Rosa), uma recompensa única por data e um detalhe visual persistente após a conclusão. A cadeia maior de eventos e novas cenas continua como evolução futura.

- Oferecer uma atividade principal por visita, com alternativas simples quando depender de um recurso que o visitante não tem.
- Preservar encomendas e descobertas existentes, evitando apresentar muitas obrigações simultâneas.
- Alternar atividades entre cultivo, conversa, exploração e preparação da feira.
- Dar recompensas cosméticas e cenas dos moradores; limitar repetição antes de ampliar o catálogo.
- Exibir um fechamento claro: o visitante fez algo relevante e pode encerrar a sessão.
- Manter eventos incompletos para a próxima visita; não exigir sequência de dias nem criar recompensas exclusivas que desapareçam por ausência.

### Critérios de conclusão

- Uma partida pós-capítulo sete oferece uma atividade compreensível e concluível em aproximadamente cinco minutos, validada em sessão real.
- Visitar após vários dias de ausência não elimina conteúdo pendente.
- Cada recompensa só é concedida uma vez por evento ou data aplicável, inclusive após recarregar.
- O calendário preserva o fuso e as regras atuais; relógio local não é tratado como mecanismo antifraude.
- As novidades funcionam sem servidor e sem geração automática de histórias por IA.

## 9. Etapa 5 — Personalização e uma nova cadeia de produção

Prioridade: expansão posterior, dividida em duas entregas independentes.

### 5A. Aparência e decoração

- Criar um pequeno catálogo inicial de roupas, cabelo e acessórios compatíveis com os sprites atuais.
- Garantir todas as direções e quadros de caminhada de cada combinação oferecida.
- Permitir experimentar a aparência antes de confirmar e salvar a escolha localmente.
- Ampliar os pontos de decoração existentes antes de considerar posicionamento totalmente livre.
- Cosméticos não concedem acesso privilegiado ao portfólio e não envolvem dinheiro real.

Conclusão: trocar a aparência e a decoração funciona durante caminhada, diálogos e recarregamento, sem desalinhamento, perda de itens ou compra duplicada.

### 5B. Leite e ovos

- Acrescentar produção animal como uma cadeia curta: cuidar, coletar e vender ou entregar.
- Definir um limite simples por data e comunicar quando o produto estará disponível.
- Rebalancear pedidos e preços para a produção animal complementar o cultivo.
- Não adicionar fome, doença ou punição aos animais por ausência.

Conclusão: produção e coleta têm regras explícitas, não duplicam ao recarregar e entram na economia sem tornar culturas e pedidos anteriores irrelevantes.

Trator dirigível, receitas e automação ficam fora dessas duas entregas; cada um precisa justificar seu próprio ciclo de jogo antes de entrar no escopo.

## 10. Qualidade em todas as etapas

- Revisar abertura, contraste, tamanho dos textos, foco dos painéis e possibilidade de reduzir animações decorativas.
- Verificar cliques rápidos, troca de destino, alvo inacessível, NPC em movimento e ausência de clique atravessando menus.
- Avaliar computador e celular, incluindo toque, painéis abertos, orientação recolhida e retorno ao jogo.
- Medir carregamento e fluidez antes de adicionar novos mapas ou grandes conjuntos de sprites; otimizar onde houver evidência.
- Preservar o currículo independente do download do jogo e conferir HTML sem JavaScript e impressão.
- Acrescentar testes de regras para mudanças em economia, calendário, recompensas e migração; usar verificações de navegador para os fluxos afetados e inspeção visual para arte e layout.
- Validar migração com saves existentes: fazenda inicial, história em andamento e história concluída. Recuperar campos novos inválidos sem apagar progresso válido.
- Conferir o endereço do currículo e os links no build estático quando houver uma decisão de hospedagem.

Não há meta de desempenho medida neste documento. Registrar equipamento, navegador e condição de teste antes de transformar uma medição em critério numérico.

## 11. Organização técnica prevista

Manter TypeScript, Phaser, Vite, a geração de PNGs e a separação de dados profissionais já existente. Não iniciar uma reescrita geral.

| Frente | Pontos atuais a considerar no plano técnico futuro |
| --- | --- |
| Passeio e orientação | `src/main.ts`, `src/game.ts`, `index.html`, `src/intro.css`; isolar estado do passeio se o fluxo crescer |
| Cases e conteúdo | `src/portfolio.ts`, `src/portfolio-view.ts`, `src/resume-view.ts` e estilos correspondentes |
| NPCs e animações | `src/game.ts`, `scripts/generate-assets.mjs` e conteúdo narrativo |
| Pós-feira | `src/valley.ts`, `src/valley-content.ts`, `src/valley-view.ts`, `src/valley-world.ts` |
| Aparência e produção | Gerador de assets, apresentação do personagem, `src/model.ts` e validação do save |
| Verificação | `tests/` e scripts de navegador existentes, ampliados conforme o fluxo alterado |

Antes de executar cada etapa, escrever um plano técnico limitado a ela, com interfaces, arquivos, regras de persistência e cenários de teste. Separar responsabilidades quando necessário à entrega, sem refatorações paralelas de todo o projeto.

## 12. Fora do escopo deste ciclo

- Login, banco de dados remoto, sincronização e multiplayer.
- Rankings, competição e economia com dinheiro real.
- Mapa enorme, novas regiões ou interiores para todas as construções.
- IA generativa em diálogos e sprites.
- Notificações, e-mails de retorno e sequências obrigatórias de visitas.
- Analytics ou rastreamento adicionados sem decisão sobre privacidade.
- Publicação do site, domínio e deploy automático sem autorização específica.

## 13. Ordem e revisão

- [x] Revisar este roteiro e confirmar o escopo da etapa 1.
- [x] Detalhar tecnicamente e implementar o passeio profissional opcional.
- [ ] Preparar os dois primeiros cases públicos e validar seu conteúdo com Matheus.
- [ ] Evoluir atividades e pequenas histórias dos três moradores.
- [x] Criar o primeiro conjunto de acontecimentos pós-feira e testar visitas curtas.
- [ ] Reavaliar a prioridade entre personalização e produção animal com base nas partidas.

O primeiro ponto de revisão deve observar duas experiências completas: alguém que quer apenas o currículo e alguém que entra para explorar. Perguntas úteis: ficou claro quem é Matheus? Qual projeto chamou atenção? Onde procuraria contato? Em que momento não soube o que fazer? Qual novidade daria vontade de ver em outra visita?

Este documento é um roteiro de produto, não uma promessa de prazo nem um plano técnico pronto para execução. A criação do roteiro não implica commit, push, deploy ou aprovação automática de todas as propostas.
