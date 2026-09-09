# Matheus Henrique · Portfólio

Portfólio de **Matheus Henrique da Silva**, Tech Lead na Humanizadas e cofundador da Kairoo Tech.

[LinkedIn](https://linkedin.com/in/matheushenrique2773) · [GitHub](https://github.com/mhdsilva) · [Contato](mailto:matheushenrique2773@gmail.com)

Portfólio em forma de fazenda 2D que ocupa toda a janela do navegador, com tela inicial de carregamento e instruções. Não há página envolvendo o jogo. A pixel art original é gerada por código; personagens pequenos usam sprites-fonte detalhados de 32 × 48 pixels. A implementação usa TypeScript, Phaser e Vite.

Para quem quer ir direto ao perfil profissional, `/curriculo/` reúne resumo, experiências, tecnologias, formação, projetos e contatos em uma única página. Ela não carrega o Phaser, não inicia uma visita e não modifica o save. O conteúdo já vem no HTML, inclusive sem JavaScript; o botão **Imprimir / salvar PDF** usa a impressão do navegador com um layout próprio. Há atalhos na abertura e no menu do jogo.

## Executar

Requer Node.js 22.12 ou mais recente.

```sh
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

```sh
npm test
npm run build
npm run preview
```

O build gera o diretório `dist`, pronto para hospedagem estática. Não é necessário servidor de jogo, conta ou chave de acesso.

O desenvolvimento usa polling de um segundo em `vite.config.ts`, evitando o erro `ENOSPC: System limit for number of file watchers reached` quando outros aplicativos esgotam o inotify do Linux. O hot reload continua funcionando, com até um segundo de atraso na detecção e algum custo adicional de CPU. Não é necessário fechar aplicativos ou alterar limites do sistema. Para apenas jogar sem monitorar arquivos: `npm run build` e `npm run preview -- --port 5173`.

## Jogar

- Clique no chão para andar; um novo clique substitui o destino.
- Clique em um NPC, construção ou objeto para se aproximar e interagir.
- Clique nas plantas maduras para colher.
- Visite o mercado à esquerda da praça para vender a colheita e comprar sementes.
- Selecione uma semente na barra e clique em um canteiro vazio para plantar. Clique outra vez para regar.
- Cenoura, nabo e milho crescem em 60, 90 e 120 segundos após a rega, respectivamente.
- Compre a expansão de 240 moedas para liberar mais seis canteiros.
- Abra o **Diário** ou clique no correio para começar **Cartas do Vale**: uma história de sete capítulos sobre recuperar a antiga feira, descobrir quem escreveu uma carta e aproximar os moradores.
- Guarde a carta para receber sementes. Converse, cultive, cuide dos animais e visite os locais indicados; entregue os produtos ao morador para concluir o capítulo.
- A cada nova data há uma encomenda e um pacote escondido no gramado. Pedidos de cultivo entregam sementes automaticamente; pedidos de produto animal pedem leite ou ovos recolhidos no celeiro. Entregue o item ao morador indicado.
- Ganhe selos da feira e troque por flores, piquenique e bandeirinhas em **Diário → Meu cantinho**. Decorações podem ser guardadas e recolocadas sem pagar novamente.
- Em **Diário → Meu personagem**, escolha entre três paletas visuais e acessórios (lenço ou bolsa de ferramentas). Depois da feira, conclua três atividades pós-feira para liberar o **Broche da feira**. A combinação muda imediatamente, acompanha caminhada e diálogos e fica salva neste navegador; ela não altera as informações profissionais nem a economia.
- Observe os moradores enquanto passeiam: Lia leva o regador, Bento trabalha com uma chave inglesa e Rosa organiza a cesta. As ferramentas balançam durante as pausas, sem criar tarefas obrigatórias nem consumir seus recursos.
- Use o menu Portfólio dentro do jogo para acessar os conteúdos diretamente. Escape fecha as janelas. O botão ? reabre as instruções.
- Em **Conhecer Matheus**, escolha **Começar passeio** para uma rota opcional por apresentação, projetos e trajetória. Ela pode ser pausada e retomada; currículo e seções continuam livres.

O progresso é salvo neste navegador. Limpar os dados do site apaga o progresso; não há sincronização entre dispositivos. O crescimento usa o tempo decorrido após a rega, inclusive durante a ausência. A economia é local e não envolve dinheiro real.

É possível concluir um capítulo por data de calendário no fuso registrado na primeira visita — não precisa esperar 24 horas nem voltar em dias consecutivos. Não há perda por ausência, plantas mortas ou sequência obrigatória. Um capítulo incompleto continua de onde parou. Após o final, encomendas e descobertas continuam em rotação; há sete lembranças e três decorações nesta versão. Depois da feira, cada data também traz uma atividade curta com Lia, Bento ou Rosa, que rende +1 selo, +15 moedas e uma pequena mudança visual no cenário. Vacas e galinhas agora podem ser cuidadas e produzir uma vez por data; leite e ovos entram na mochila, podem ser vendidos no mercado e também aparecem em algumas encomendas diárias. Com 3 pontos de amizade, cada morador também revela uma memória opcional, registrada no diário e disponível uma única vez. O ritmo pretendido é uma visita curta de aproximadamente cinco minutos, sem limitar o tempo de jogo.

Saves v1 e v2 migram preservando a fazenda; o inventário animal e as memórias de amizade começam vazios quando os campos ainda não existiam. A chave de armazenamento permanece `vale-do-matheus:v1` por compatibilidade. O calendário usa o relógio local e impede renovação ao retrocedê-lo, mas não pretende proteger contra edição deliberada do save ou avanço manual da data.

## Organização

- `scripts/generate-assets.mjs`: desenhos em pixels, codificador PNG e manifesto das imagens. Execute `npm run assets` para gerar os 75 arquivos em `public/assets`, incluindo o cartão social 1200 × 630. O comando também roda antes do desenvolvimento e do build.
- `src/model.ts`: regras de cultivo, inventário, economia, aparência e acessórios, validação de salvamentos e busca de caminhos.
- `src/valley.ts` e `src/valley-content.ts`: calendário, capítulos, amizade, encomendas e recompensas.
- `src/valley-view.ts`, `src/valley.css` e `src/valley-world.ts`: diário, coleção, decoração e reconstrução do cenário.
- `src/game.ts`: mapa, cenário, movimento, rotinas e interações.
- `src/main.ts`: interface HTML, conteúdo do portfólio, loja e persistência.
- `src/portfolio.ts`: apresentação, experiências, formação, tecnologias, projetos e contatos profissionais.
- `src/portfolio-view.ts` e `src/portfolio.css`: painéis profissionais dentro do jogo.
- `src/resume-view.ts`, `src/resume.css`, `src/resume.ts` e `curriculo/index.html`: versão direta do currículo. O Vite gera seu HTML a partir de `src/portfolio.ts`, sem duplicar os dados profissionais.
- `src/intro.css`: abertura ampliada com instruções, escolha de experiência e degradê sobre o cenário em tempo real.
- `src/style.css`: apresentação e adaptação de layout.
- `tests/model.test.ts`: verificações do ciclo agrícola, economia, salvamento e caminhos.
- `tests/valley.test.ts`: migração, calendário, entregas atômicas, recompensas únicas e os sete capítulos.
- `scripts/story-smoke.mjs`: verificações de história no navegador com relógio controlado. Execute `node --import tsx scripts/story-smoke.mjs http://localhost:5173` com o servidor de desenvolvimento ativo e o Chrome instalado. Para o ciclo agrícola e o layout móvel: `npm run test:browser`.
- `scripts/decor-smoke.mjs`: compra, ordem de desenho, salvamento e remoção gratuita de decorações. Execute com `node --import tsx scripts/decor-smoke.mjs http://localhost:5173`. A história é percorrida por cliques em sete datas no teste anterior; a partir do segundo capítulo, apenas os produtos de entrega são fornecidos por fixtures, sem simular todo o cultivo novamente.
- `PLANO.md`: planejamento original, decisões e expansões previstas.

As imagens são produzidas antes da publicação, a partir de formas e uma paleta definidas no código, sem geração por IA ou dependência de imagens externas. A aleatoriedade dos detalhes usa semente fixa. Fontes web são opcionais: há fontes locais de fallback.

## Conteúdo e limites atuais

Os dados profissionais foram trazidos das seções exibidas no [meta-portifolio](https://github.com/mhdsilva/meta-portifolio), no commit `1ccbcde604a26c3e94c916052f39c585f2b09775`: apresentação, Kairoo Tech, Humanizadas, BeUni, Videomatik, The Brooklyn Brothers, formação, tecnologias, idiomas e contatos. Os períodos foram preservados conforme essa fonte. Exemplos fictícios de arquivos de demonstração não fazem parte deste portfólio.

Para atualizar o perfil nas duas versões, edite `src/portfolio.ts` e refaça o build. Os projetos apresentados são o portfólio em uma fazenda e o Meta-Developer Portfolio, ambos com links para seus repositórios. A opção de salvar PDF imprime os dados publicados; não há um arquivo de currículo externo inventado ou copiado de outra fonte.

No jogo, cada projeto agora também abre um case com contexto, decisões técnicas e evidências públicas. Os cases iniciais se baseiam exclusivamente nos README e repositórios abertos de `imatheus` e `meta-portifolio`; não incluem métricas, clientes ou resultados de trabalhos privados.

`node scripts/resume-smoke.mjs http://localhost:5173` verifica acesso direto, HTML sem JavaScript, ausência do download do jogo, impressão, celular e o atalho da abertura. O build é multipágina e inclui `dist/curriculo/index.html`. A chave antiga `vale-do-matheus:v1` foi mantida para preservar o progresso após a troca do título visível.

Este repositório publica o código do portfólio. Hospedagem e deploy automático não estão ativados.

Três moradores seguem rotinas; vacas e galinhas circulam nas áreas rurais. As atividades dos NPCs são ambientais e não alteram o inventário do visitante. O trator é um ponto de interação da oficina; direção e automação ficam para expansões. O cuidado diário dos animais já rende leite e ovos, com venda e encomendas integradas ao ciclo da fazenda.

Lia, Bento e Rosa exibem no cenário o que estão fazendo e alternam conversas após o primeiro encontro do dia. As falas acompanham o capítulo atual e, depois da feira, refletem a vida do vale restaurado.

O layout se adapta a telas menores e recebe toques, mas a experiência principal é a navegação com mouse. Os painéis profissionais são HTML acessível por teclado; o mundo interativo ainda não oferece navegação completa para leitores de tela.
