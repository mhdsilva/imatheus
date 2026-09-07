# Vale do Matheus

Portfólio de **Matheus Henrique da Silva**, Tech Lead na Humanizadas e cofundador da Kairoo Tech.

[LinkedIn](https://linkedin.com/in/matheushenrique2773) · [GitHub](https://github.com/mhdsilva) · [Contato](mailto:matheushenrique2773@gmail.com)

Portfólio em forma de fazenda 2D que ocupa toda a janela do navegador, com tela inicial de carregamento e instruções. Não há página envolvendo o jogo. A pixel art original é gerada por código; personagens pequenos usam sprites-fonte detalhados de 32 × 48 pixels. A implementação usa TypeScript, Phaser e Vite.

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

## Jogar

- Clique no chão para andar; um novo clique substitui o destino.
- Clique em um NPC, construção ou objeto para se aproximar e interagir.
- Clique nas plantas maduras para colher.
- Visite o mercado à esquerda da praça para vender a colheita e comprar sementes.
- Selecione uma semente na barra e clique em um canteiro vazio para plantar. Clique outra vez para regar.
- Cenoura, nabo e milho crescem em 60, 90 e 120 segundos após a rega, respectivamente.
- Compre a expansão de 240 moedas para liberar mais seis canteiros.
- Use o menu Portfólio dentro do jogo para acessar os conteúdos diretamente. Escape fecha as janelas. O botão ? reabre as instruções.

O progresso é salvo neste navegador. Limpar os dados do site apaga o progresso; não há sincronização entre dispositivos. O crescimento usa o tempo decorrido após a rega, inclusive durante a ausência. A economia é local e não envolve dinheiro real.

## Organização

- `scripts/generate-assets.mjs`: desenhos em pixels, codificador PNG e manifesto das imagens. Execute `npm run assets` para gerar os 45 arquivos em `public/assets`. O comando também roda antes do desenvolvimento e do build.
- `src/model.ts`: regras de cultivo, inventário, economia, validação de salvamentos e busca de caminhos.
- `src/game.ts`: mapa, cenário, movimento, rotinas e interações.
- `src/main.ts`: interface HTML, conteúdo do portfólio, loja e persistência.
- `src/portfolio.ts`: apresentação, experiências, formação, tecnologias, projetos e contatos profissionais.
- `src/portfolio-view.ts` e `src/portfolio.css`: painéis profissionais dentro do jogo.
- `src/style.css`: apresentação e adaptação de layout.
- `tests/model.test.ts`: verificações do ciclo agrícola, economia, salvamento e caminhos.
- `PLANO.md`: planejamento original, decisões e expansões previstas.

As imagens são produzidas antes da publicação, a partir de formas e uma paleta definidas no código, sem geração por IA ou dependência de imagens externas. A aleatoriedade dos detalhes usa semente fixa. Fontes web são opcionais: há fontes locais de fallback.

## Conteúdo e limites atuais

Os dados profissionais foram trazidos das seções exibidas no [meta-portifolio](https://github.com/mhdsilva/meta-portifolio), no commit `1ccbcde604a26c3e94c916052f39c585f2b09775`: apresentação, Kairoo Tech, Humanizadas, BeUni, Videomatik, The Brooklyn Brothers, formação, tecnologias, idiomas e contatos. Os períodos foram preservados conforme essa fonte. Exemplos fictícios de arquivos de demonstração não fazem parte deste portfólio.

Para atualizar o perfil, edite `src/portfolio.ts`. Os projetos apresentados são o Vale do Matheus e o Meta-Developer Portfolio, ambos com links para seus repositórios. Não há um PDF de currículo, pois o repositório de origem não fornece esse arquivo.

Este repositório publica o código do portfólio. Hospedagem e deploy automático não estão ativados.

Três moradores seguem rotinas; vacas e galinhas circulam nas áreas rurais. As atividades dos NPCs são ambientais e não alteram o inventário do visitante. O trator é um ponto de interação da oficina; direção, automação, leite e ovos ficam para expansões.

O layout se adapta a telas menores e recebe toques, mas a experiência principal é a navegação com mouse. Os painéis profissionais são HTML acessível por teclado; o mundo interativo ainda não oferece navegação completa para leitores de tela.
