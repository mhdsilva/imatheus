import type { Crop } from "./model";
import type { FarmState } from "./model";

export const RESIDENTS = ["Lia", "Bento", "Rosa"] as const;
export type Resident = (typeof RESIDENTS)[number];
export type Site = "bench" | "well" | "mill" | "fair";
export const POSTFAIR_EVENTS = [
  {
    id: "lia-garden",
    npc: "Lia",
    title: "Um jardim para dividir",
    text: "Lia separou mudas para ampliar o jardim perto da casa. Ajude a escolher um lugar para a próxima flor.",
    action: "Escolher o lugar da flor",
    image: "flowerbed",
  },
  {
    id: "bento-workshop",
    npc: "Bento",
    title: "Uma oficina mais viva",
    text: "Bento quer deixar uma ferramenta pronta para quem visitar a feira. Passe na oficina e confira o ajuste.",
    action: "Conferir o ajuste",
    image: "workbench",
  },
  {
    id: "rosa-table",
    npc: "Rosa",
    title: "Lugar na mesa",
    text: "Rosa está preparando uma pequena mesa para as próximas visitas. Ajude a escolher o que fica no centro.",
    action: "Preparar a mesa",
    image: "picnic",
  },
] as const;
export type PostfairEvent = (typeof POSTFAIR_EVENTS)[number];

const ACTIVITIES: Record<Resident, readonly string[]> = {
  Lia: ["rega a horta", "observa as flores", "leva colheita à praça", "cuida dos canteiros"],
  Bento: ["confere as ferramentas", "ajusta o trator", "testa uma peça", "faz uma pausa"],
  Rosa: ["separa os produtos", "confere as receitas", "organiza a banca"],
};
const AMBIENT_DIALOGUE: Record<Resident, readonly string[]> = {
  Lia: [
    "As plantas parecem ouvir quando alguém para um minuto para olhar. Talvez todo mundo seja um pouco assim.",
    "Deixei algumas flores perto da janela. Pequenos sinais ajudam a lembrar que a casa está viva.",
  ],
  Bento: [
    "O trator não saiu do lugar, mas hoje ele fez um barulho promissor. Isso já conta como conversa.",
    "Uma ferramenta bem guardada economiza tempo. Uma boa companhia também.",
  ],
  Rosa: [
    "Organizar uma banca é imaginar quem vai passar por ela. Sempre deixo espaço para surpresa.",
    "Tem dia que uma receita começa com a colheita e termina com uma boa conversa.",
  ],
};

export function residentActivity(npc: Resident, goal: number) {
  const activities = ACTIVITIES[npc];
  return activities[goal % activities.length];
}

export function residentDialogue(farm: FarmState, npc: Resident, now = Date.now()) {
  const s = farm.valley;
  if (s.chapter >= 7)
    return {
      Lia: "A feira está viva outra vez. Às vezes, tudo o que a gente precisa é de alguém que volte para conversar.",
      Bento: "O moinho está funcionando e já tenho novas ideias. Mas hoje também cabe uma pausa na feira.",
      Rosa: "Sempre tem uma encomenda nova por aqui. E a mesa da feira continua com um lugar para você.",
    }[npc];
  if (!s.daily.chatted.includes(npc))
    return CHAPTERS[s.chapter].dialogue[npc];
  const daySeed = new Date(now).getUTCDate();
  return AMBIENT_DIALOGUE[npc][daySeed % AMBIENT_DIALOGUE[npc].length];
}

export function dailyPostfair(farm: FarmState): PostfairEvent {
  const day = Math.floor(Date.parse(`${farm.valley.day}T12:00:00Z`) / 86400000);
  const index =
    ((day % POSTFAIR_EVENTS.length) +
      POSTFAIR_EVENTS.length) %
    POSTFAIR_EVENTS.length;
  return POSTFAIR_EVENTS[index];
}
export type Chapter = {
  title: string;
  sender: string;
  letter: string[];
  recipient: Resident;
  tasks: { flag: string; label: string }[];
  crops: Partial<Record<Crop, number>>;
  gift: Partial<Record<Crop, number>>;
  outcome: string;
  tomorrow: string;
  dialogue: Record<Resident, string>;
};

export const CHAPTERS: Chapter[] = [
  {
    title: "A carta sem assinatura",
    sender: "Alguém que ainda acredita no vale",
    letter: [
      "Ainda guardei as sementes. Achei que alguém voltaria.",
      "Quando o moinho parou, a feira foi ficando vazia. Um por um, deixamos de montar as bancas. A terra continuou aqui, esperando.",
      "Lia sabe onde começar. Leve duas cenouras para ela. Algumas coisas pequenas merecem uma segunda chance.",
    ],
    recipient: "Lia",
    tasks: [{ flag: "talk:Lia", label: "Conversar com Lia" }],
    crops: { carrot: 2 },
    gift: { carrot: 2 },
    outcome:
      "Lia planta as flores que guardava numa caixa. A entrada da casa ganha cor pela primeira vez em muito tempo.",
    tomorrow:
      "Bento encontrou uma bancada entre as tábuas antigas. Amanhã, ele vai precisar de uma mão.",
    dialogue: {
      Lia: "Essa letra… me lembra alguém. Vamos começar pelas cenouras? Minha mãe dizia que uma horta bonita sempre guarda um lugar para as flores.",
      Bento:
        "Aquele moinho já teve dias melhores. Ainda escuto o barulho das hélices quando venta. Mania de mecânico, talvez.",
      Rosa: "Você é a pessoa da carta? Finalmente! Quero dizer… bem-vindo. Tenho sementes e bastante assunto.",
    },
  },
  {
    title: "Madeira que ainda serve",
    sender: "Bento, com um pouco de serragem",
    letter: [
      "Achei nossa velha bancada. Está torta, mas já vi móveis mais tortos sobreviverem a uma feira inteira.",
      "Passe na bancada, ao sul da horta, para separar as peças. Depois me traga duas cenouras. Trabalhar dá fome; trabalhar com fome dá parafusos sobrando.",
      "Se recuperarmos as ferramentas, talvez eu consiga olhar o moinho de verdade.",
    ],
    recipient: "Bento",
    tasks: [
      { flag: "talk:Bento", label: "Conversar com Bento" },
      { flag: "work:bench", label: "Separar as peças da bancada" },
    ],
    crops: { carrot: 2 },
    gift: { carrot: 2 },
    outcome:
      "A bancada está firme outra vez. Bento organiza as ferramentas e guarda um lugar para quem quiser ajudar.",
    tomorrow:
      "Rosa sentiu falta do cheiro da feira. Ela está procurando uma receita antiga.",
    dialogue: {
      Lia: "Bento disse que não estava animado. Depois passou a manhã assobiando enquanto procurava o martelo.",
      Bento:
        "Uma boa bancada precisa de três coisas: madeira, paciência e alguém para segurar a outra ponta. Vá separar as peças e depois me encontre aqui.",
      Rosa: "Se isso virar uma feira, eu já tenho algumas ideias. Só algumas. Está bem, um caderno inteiro.",
    },
  },
  {
    title: "O cheiro da antiga feira",
    sender: "Rosa, entre receitas e lembranças",
    letter: [
      "Encontrei uma receita de caldo de nabo. A folha está tão manchada que provavelmente também serve de tempero.",
      "Preciso de dois nabos para testar. Antes, veja como estão as galinhas. Elas sempre foram minhas críticas gastronômicas mais exigentes.",
      "Se der certo, vou montar uma banca. Mesmo que a primeira cliente seja uma galinha.",
    ],
    recipient: "Rosa",
    tasks: [
      { flag: "talk:Rosa", label: "Conversar com Rosa" },
      { flag: "care:chicken", label: "Cuidar de uma galinha" },
    ],
    crops: { turnip: 2 },
    gift: { turnip: 2 },
    outcome:
      "O caldo fica pronto e Rosa abre a primeira banca. Bento aparece, experimenta e pede outra tigela. Ninguém comenta o sorriso dele.",
    tomorrow: "Lia quer mostrar uma coisa que guardou perto do poço.",
    dialogue: {
      Lia: "A receita da Rosa era a minha preferida. Engraçado como um cheiro consegue trazer um lugar inteiro de volta.",
      Bento:
        "Eu vim conferir a estrutura da banca. Se houver caldo sobrando, posso conferir isso também.",
      Rosa: "As galinhas estão lá no cercado. Dê um carinho nelas e depois traga os dois nabos. Prometo guardar a primeira tigela para você.",
    },
  },
  {
    title: "Quem guardou as sementes",
    sender: "Lia, desta vez com assinatura",
    letter: [
      "Tenho cuidado de uma caixa de sementes desde que a feira fechou. Algumas eram da minha mãe. Nunca soube onde plantá-las.",
      "O velho poço, perto da casa, precisa de uma limpeza. Veja também nossa vaquinha. Ela parece ouvir melhor quando alguém está preocupado.",
      "Talvez guardar uma coisa por muito tempo seja só outro jeito de esperar companhia.",
    ],
    recipient: "Lia",
    tasks: [
      { flag: "talk:Lia", label: "Conversar com Lia" },
      { flag: "care:cow", label: "Cuidar de uma vaca" },
      { flag: "work:well", label: "Limpar o poço antigo" },
    ],
    crops: {},
    gift: { carrot: 2 },
    outcome:
      "A água volta a refletir o céu. Lia planta uma das sementes da caixa; uma flor azul se abre perto do poço, mesmo sem ninguém ter visto o botão.",
    tomorrow:
      "A feira vai precisar de luz. Rosa teve uma ideia e Bento já está procurando fio.",
    dialogue: {
      Lia: "Eu achei que, se plantasse as últimas sementes, acabaria também a lembrança. Hoje acho que talvez fosse o contrário.",
      Bento:
        "O poço fica logo abaixo da casa. Tire as folhas da borda; eu cuido da corda. Cada um com sua especialidade.",
      Rosa: "Tem uma flor azul perto da caixa da Lia. Juro que ontem não estava lá. Deve ser a primavera… provavelmente.",
    },
  },
  {
    title: "Luzes para o reencontro",
    sender: "Rosa e Bento, em letra desencontrada",
    letter: [
      "Decidimos pendurar lanternas na praça. Bento diz que o fio aguenta. Rosa diz que a cor precisa combinar. Os dois estão certos, evidentemente.",
      "Converse com nós dois e traga dois milhos. Vamos testar a comida da noite de abertura.",
      "Não marque uma data por nossa causa. O vale abre quando você estiver por aqui.",
    ],
    recipient: "Rosa",
    tasks: [
      { flag: "talk:Rosa", label: "Combinar a comida com Rosa" },
      { flag: "talk:Bento", label: "Conversar sobre as luzes com Bento" },
    ],
    crops: { corn: 2 },
    gift: { corn: 2 },
    outcome:
      "As lanternas acendem sobre a praça. Pela primeira vez, a feira parece um lugar esperando pessoas, e não uma lembrança esperando poeira.",
    tomorrow:
      "Bento ouviu uma peça solta dentro do moinho. Há alguma coisa guardada lá.",
    dialogue: {
      Lia: "Quando as lanternas acenderam, fiquei um tempo aqui fora. Minha mãe teria gostado das amarelas.",
      Bento:
        "O fio aguenta. Eu testei. Duas vezes. A terceira foi porque Rosa queria ver se as luzes eram bonitas.",
      Rosa: "Milho assado e lanternas. Às vezes, planejar uma festa é apenas escolher duas coisas boas e chamar os amigos.",
    },
  },
  {
    title: "O que o moinho guardava",
    sender: "Bento, quase sem conseguir esperar",
    letter: [
      "A porta do moinho abriu. Dentro havia ferramentas, uma caixa de receitas e vários envelopes sem selo.",
      "Examine o mecanismo do moinho, a oeste da casa, e depois me encontre. Três cenouras ajudam a terminar a manutenção com energia.",
      "Acho que Lia tem algo para contar. Talvez ela estivesse tentando desde o primeiro dia.",
    ],
    recipient: "Bento",
    tasks: [
      { flag: "talk:Bento", label: "Conversar com Bento" },
      { flag: "work:mill", label: "Examinar o mecanismo do moinho" },
    ],
    crops: { carrot: 3 },
    gift: { carrot: 3 },
    outcome:
      "As hélices giram. Lia respira fundo: “Fui eu que escrevi a carta. Tentei tantas vezes pedir ajuda que esqueci que podia simplesmente pedir.” Rosa abraça a amiga; Bento finge estar muito ocupado com um parafuso.",
    tomorrow:
      "Está tudo pronto para a feira. Falta uma última colheita e todo mundo junto.",
    dialogue: {
      Lia: "Sobre aquela carta… quando o moinho voltar a girar, eu queria conversar com vocês. Tem uma coisa que preciso dizer.",
      Bento:
        "O mecanismo está na base do moinho. Dê uma olhada na peça presa. Eu separo as ferramentas e encontro você aqui depois.",
      Rosa: "Às vezes a gente reconhece a letra e espera a pessoa encontrar a coragem. Eu guardei todos os envelopes.",
    },
  },
  {
    title: "A feira das pequenas coisas",
    sender: "Lia, Bento e Rosa",
    letter: [
      "A banca está pronta. As lanternas estão acesas. O moinho finalmente resolveu participar.",
      "Passe para conversar com cada um, prepare a banca da feira e traga duas cenouras, um nabo e um milho para a mesa compartilhada.",
      "Não precisamos que tudo seja grandioso. Você voltou. Nós também. Já é um belo começo.",
    ],
    recipient: "Rosa",
    tasks: [
      { flag: "talk:Lia", label: "Encontrar Lia" },
      { flag: "talk:Bento", label: "Encontrar Bento" },
      { flag: "talk:Rosa", label: "Encontrar Rosa" },
      { flag: "work:fair", label: "Preparar a banca da feira" },
    ],
    crops: { carrot: 2, turnip: 1, corn: 1 },
    gift: { carrot: 2, turnip: 1, corn: 1 },
    outcome:
      "A feira abre. Os moradores dividem comida, histórias e planos. Do outro lado do rio, pequenas luzes aparecem entre as árvores. Lia sorri: “Parece que mais alguém percebeu que voltamos.” Você concluiu Cartas do Vale. Os pedidos, as descobertas e as amizades continuam por aqui.",
    tomorrow:
      "O vale continua: uma nova encomenda, uma descoberta e tempo para cultivar o seu cantinho.",
    dialogue: {
      Lia: "Não vou mais guardar todas as sementes numa caixa. Algumas lembranças ficam melhores quando a gente divide.",
      Bento:
        "Zero parafusos sobrando. Isso é quase tão emocionante quanto a feira. Quase.",
      Rosa: "Prepare a banca e traga a última colheita. Depois, sente um pouquinho com a gente. Hoje ninguém está com pressa.",
    },
  },
];

export const REQUESTS: {
  id: string;
  npc: Resident;
  crop: Crop;
  count: number;
  text: string;
}[] = [
  {
    id: "lia-carrots",
    npc: "Lia",
    crop: "carrot",
    count: 2,
    text: "Vou preparar uma sopa para dividir. Você tem duas cenouras?",
  },
  {
    id: "rosa-turnips",
    npc: "Rosa",
    crop: "turnip",
    count: 2,
    text: "Minha receita ganhou fãs. Preciso de dois nabos para a panela de hoje.",
  },
  {
    id: "bento-corn",
    npc: "Bento",
    crop: "corn",
    count: 2,
    text: "Prometi milho assado para o pessoal. O teste de qualidade fica por minha conta.",
  },
  {
    id: "rosa-carrots",
    npc: "Rosa",
    crop: "carrot",
    count: 2,
    text: "Uma cliente pediu bolo de cenoura. Duas cenouras e eu resolvo o resto.",
  },
  {
    id: "bento-turnips",
    npc: "Bento",
    crop: "turnip",
    count: 2,
    text: "Estou tentando a receita da Rosa. Dois nabos. E um pouco de sorte.",
  },
  {
    id: "lia-corn",
    npc: "Lia",
    crop: "corn",
    count: 2,
    text: "Quero guardar milho para a mesa compartilhada. Você pode trazer dois?",
  },
];
export const DISCOVERIES = [
  {
    id: "blue-seed",
    name: "A semente azul",
    text: "Parece guardar um pedacinho do céu. Lia diz que nunca viu uma igual.",
  },
  {
    id: "old-button",
    name: "Botão de cobre",
    text: "Bento reconheceu: era do primeiro avental que usou na feira.",
  },
  {
    id: "recipe",
    name: "Receita dobrada",
    text: "Na margem, alguém escreveu: um pouco mais de canela nunca fez mal.",
  },
  {
    id: "ribbon",
    name: "Fita de primavera",
    text: "Uma fita amarela das antigas lanternas. Ainda balança com o menor vento.",
  },
  {
    id: "feather",
    name: "Pena dourada",
    text: "As galinhas negam qualquer envolvimento. Parecem bastante orgulhosas.",
  },
  {
    id: "key",
    name: "Chave do moinho",
    text: "Uma cópia antiga. Na etiqueta: para quem precisar entrar.",
  },
  {
    id: "river-stone",
    name: "Pedra do outro lado",
    text: "Uma pedrinha lisa, com um brilho que aparece só quando você para de procurar.",
  },
] as const;
export const DECORATIONS = [
  {
    id: "flowerbed",
    name: "Jardim da janela",
    price: 3,
    image: "flowerbed",
    description: "Flores coloridas para receber quem chega.",
  },
  {
    id: "picnic",
    name: "Piquenique no gramado",
    price: 4,
    image: "picnic",
    description: "Um lugar para parar entre uma colheita e outra.",
  },
  {
    id: "bunting",
    name: "Casa em festa",
    price: 5,
    image: "bunting",
    description: "Bandeirinhas que deixam a varanda com cara de domingo.",
  },
] as const;
export type Decoration = (typeof DECORATIONS)[number]["id"];
