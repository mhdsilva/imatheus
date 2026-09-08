# Cartas do Vale

Design aprovado na conversa: mistério acolhedor + reconstrução, com sete capítulos em sete dias de visita, pedidos diários, uma descoberta por dia e decoração comprável. A implementação continua no projeto atual e será disponibilizada localmente. Não inclui hospedagem.

## Experiência

Lia guardou as sementes e a memória de uma feira abandonada. Uma carta anônima convida o visitante a recuperar o vale. Bento ajuda a reconstruir o moinho; Rosa recupera as receitas e a feira. A autoria da carta é revelada no sexto capítulo. No sétimo, os moradores voltam a usar a feira e aparecem luzes na margem oposta do rio.

Cada visita oferece aproximadamente cinco minutos: ler a carta, cultivar, resolver o pedido do capítulo, descobrir um objeto e escolher uma recompensa. Os pedidos continuam após o final da história. O jogador pode ficar mais tempo cultivando; não há limite de sessão.

## Regras

- Um capítulo pode ser concluído por data de calendário, no fuso do navegador registrado no save. O dia seguinte libera o próximo capítulo, sem espera móvel de 24 horas.
- Não existem sequências obrigatórias, perda por ausência ou expiração do capítulo em andamento. Ações do capítulo persistem entre visitas.
- O relógio visual de dez minutos deixa de controlar o contador de visitas. Recarregar na mesma data não cria outra visita. Retroceder o relógio não libera recompensas.
- Uma encomenda e uma descoberta por data. Conversar aumenta a amizade no máximo uma vez por morador por data.
- Entregas consomem os produtos exigidos de forma atômica. Repetir cliques não duplica recompensas.
- Cartas fornecem sementes para seus requisitos; a encomenda diária também entrega suas sementes. Ler novamente não duplica o presente.
- Sementes não morrem. Saves anteriores preservam moedas, inventário, canteiros e melhoria da horta.
- O progresso permanece local. O fuso e o calendário não são um mecanismo de segurança contra edição deliberada de saves.
- O jogo continua em tela cheia, com sprites PNG gerados por código, personagens pequenos, movimento por clique e sem placas no cenário.
- O portfólio continua acessível livremente; o correio passa a abrir o diário e o contato continua no menu e na casa.

## Arco de sete visitas

1. A carta sem assinatura: falar com Lia e entregar duas cenouras. Um canteiro de flores reaparece.
2. Madeira que ainda serve: conversar com Bento, trabalhar na bancada e entregar duas cenouras. A bancada é restaurada.
3. O cheiro da antiga feira: conversar com Rosa, cuidar de uma galinha e entregar dois nabos. A primeira banca é montada.
4. Quem guardou as sementes: falar com Lia, cuidar de uma vaca e recuperar o poço. O poço volta a funcionar.
5. Luzes para o reencontro: falar com Rosa e Bento e entregar dois milhos. Lanternas iluminam a praça.
6. O que o moinho guardava: falar com Bento, examinar o moinho e entregar três cenouras. O moinho gira e Lia revela que escreveu a carta.
7. A feira das pequenas coisas: falar com os três moradores, preparar a feira e entregar duas cenouras, um nabo e um milho. A feira abre; as rotinas dos moradores passam por ela.

## Interface e mundo

Um botão Diário abre a carta, os objetivos, capítulos concluídos, encomenda, descobertas e decoração. A lateral apresenta o capítulo atual, sua disponibilidade e o pedido do dia. Pedidos são entregues ao morador correspondente após caminhar até ele. Descobertas são recolhidas no cenário. Moinho, bancada, poço e feira têm interações contextuais; não há teletransporte por menu.

Selos da feira compram jardim, tapete de piquenique e bandeirinhas da casa. Recompensas compradas podem ser ativadas e desativadas, sem cobrança repetida. Colecionáveis têm descrição e permanecem no diário.

## Verificação

Testes controlam o tempo explicitamente e percorrem sete datas. Devem detectar duplicação de recompensa, consumo parcial, mudança de fuso, virada de meia-noite, retrocesso de relógio, perda por ausência e perda de saves v1. O navegador verifica carta, diálogo, pedido, descoberta, decoração, cenário reconstruído e portfólio livre. O build de produção precisa passar.
