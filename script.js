/* =====================================================================
   CLUB MANAGER — script.js
   JOGO COMPLETO — JavaScript puro, orientado a objetos, sem frameworks.
   Sistemas: criação de clube, elenco, mercado (compra/venda/empréstimo/
   leilão/renovação), treinamento, finanças, patrocinadores, estádio,
   academia de base, partidas simuladas minuto a minuto, calendário e
   tabela (20 clubes / 38 rodadas), Copa Nacional, Supercopa, torneio
   internacional, IA dos clubes, conquistas, eventos aleatórios, notícias
   e salvamento automático completo via LocalStorage.
   ===================================================================== */

'use strict';

/* =====================================================================
   1. DADOS BASE / CONSTANTES
   ===================================================================== */

const STORAGE_KEY = 'clubManager.save.v2';

const POSITIONS = [
  { id: 'GOL', nome: 'Goleiro' },
  { id: 'ZAG', nome: 'Zagueiro' },
  { id: 'LD',  nome: 'Lateral Direito' },
  { id: 'LE',  nome: 'Lateral Esquerdo' },
  { id: 'VOL', nome: 'Volante' },
  { id: 'MEI', nome: 'Meia' },
  { id: 'MEIA',nome: 'Meia Ofensivo' },
  { id: 'PD',  nome: 'Ponta Direita' },
  { id: 'PE',  nome: 'Ponta Esquerda' },
  { id: 'CA',  nome: 'Centroavante' },
];
const ATACANTE_POS = ['CA','PD','PE','MEIA'];
const DEFENSOR_POS = ['ZAG','LD','LE','VOL','GOL'];

// Elenco inicial do clube do jogador (15 jogadores)
const SQUAD_TEMPLATE = ['GOL','GOL','ZAG','ZAG','ZAG','LD','LE','VOL','VOL','MEI','MEIA','PD','PE','CA','CA'];
// Elenco padrão de clubes da IA (18 jogadores)
const SQUAD_TEMPLATE_AI = ['GOL','GOL','ZAG','ZAG','ZAG','LD','LD','LE','LE','VOL','VOL','MEI','MEIA','MEIA','PD','PE','CA','CA'];

const COUNTRIES = [
  'Brasil','Argentina','Portugal','Espanha','Inglaterra','Itália','Alemanha',
  'França','Holanda','Uruguai','Bélgica','Croácia','Japão','Colômbia',
  'Estados Unidos','México','Chile','Nigéria','Senegal','Marrocos'
];

const FIRST_NAMES = [
  'Lucas','Gabriel','Matheus','Rafael','João','Pedro','Bruno','Rodrigo','Thiago',
  'Diego','Felipe','Vinícius','Gustavo','André','Carlos','Eduardo','Miguel',
  'Nicolás','Santiago','Mateo','Tomás','Martín','Alejandro','Emiliano','Kevin',
  'Hugo','Rui','Tiago','Francisco','Marco','Luca','Alessandro',
  'Leon','Maximilian','Jonas','Lars','Erik','Yusuf','Amadou','Ibrahim',
  'Kenji','Haruto','Ryan','Marcus','Ethan','Jamal','Ousmane','Sadio','Renato','Ícaro'
];

const LAST_NAMES = [
  'Silva','Souza','Oliveira','Santos','Pereira','Costa','Almeida','Ribeiro',
  'Carvalho','Gomes','Martins','Rocha','Araújo','Barbosa','Fernandes','Teixeira',
  'Moreira','Cardoso','Correia','Nunes','Dubois','Moreau','Fischer','Weber',
  'Müller','Bakker','Jansen','Kovačić','Modrić','Nakamura','Tanaka',
  'García','Fernández','Rodríguez','López','Martínez','Traoré','Diallo','Cissé',
  'Mendy','Ndiaye','Johnson','Williams','Brown','Anderson','Ferreira','Lima'
];

const PERSONALITIES = [
  'Ambicioso','Líder Nato','Profissional','Temperamental','Calmo',
  'Determinado','Volátil','Modelo de Conduta','Egocêntrico','Trabalhador'
];

const KIT_COLORS = [
  '#e3543d','#4fb0e8','#3ed27a','#e8b84b','#8a5ce8','#e84fa0',
  '#2c3e50','#ffffff','#111111','#f39c12','#16a085','#c0392b'
];

const CREST_DEFS = [
  {shape:'shield', c1:'#e3543d', c2:'#161616'}, {shape:'shield', c1:'#4fb0e8', c2:'#0d1b2a'},
  {shape:'shield', c1:'#3ed27a', c2:'#0a2e1a'}, {shape:'shield', c1:'#e8b84b', c2:'#2a1d05'},
  {shape:'circle', c1:'#e3543d', c2:'#ffffff'}, {shape:'circle', c1:'#4fb0e8', c2:'#ffffff'},
  {shape:'circle', c1:'#3ed27a', c2:'#0a2e1a'},  {shape:'circle', c1:'#8a5ce8', c2:'#1a0a2e'},
  {shape:'star',   c1:'#e8b84b', c2:'#111111'},  {shape:'star',   c1:'#e3543d', c2:'#111111'},
  {shape:'diamond',c1:'#4fb0e8', c2:'#04101c'},  {shape:'diamond',c1:'#3ed27a', c2:'#04140a'},
  {shape:'shield', c1:'#e84fa0', c2:'#1a0512'},  {shape:'shield', c1:'#2c3e50', c2:'#e8b84b'},
  {shape:'circle', c1:'#16a085', c2:'#04140f'},  {shape:'circle', c1:'#c0392b', c2:'#1a0505'},
  {shape:'star',   c1:'#ffffff', c2:'#111111'},  {shape:'diamond',c1:'#e8b84b', c2:'#111111'},
  {shape:'shield', c1:'#111111', c2:'#e8b84b'},  {shape:'shield', c1:'#8a5ce8', c2:'#ffffff'},
];

const DIFFICULTIES = [
  { id:'facil',  nome:'Fácil',   desc:'Orçamento generoso e IA mais branda. Ideal para aprender.' },
  { id:'normal', nome:'Normal',  desc:'Experiência equilibrada, fiel ao futebol de verdade.' },
  { id:'dificil',nome:'Difícil', desc:'Rivais mais espertos e finanças mais apertadas.' },
  { id:'extremo',nome:'Extremo', desc:'Sobreviva: pressão máxima da diretoria e do mercado.' },
];

const FORMATIONS = {
  '4-3-3':   ['GOL','LD','ZAG','ZAG','LE','VOL','MEI','MEIA','PD','CA','PE'],
  '4-4-2':   ['GOL','LD','ZAG','ZAG','LE','MEI','VOL','VOL','MEI','CA','CA'],
  '3-5-2':   ['GOL','ZAG','ZAG','ZAG','VOL','MEI','MEIA','LD','LE','CA','CA'],
  '4-2-3-1': ['GOL','LD','ZAG','ZAG','LE','VOL','VOL','MEIA','PD','PE','CA'],
  '5-3-2':   ['GOL','LD','ZAG','ZAG','ZAG','LE','VOL','MEI','MEIA','CA','CA'],
  '3-4-3':   ['GOL','ZAG','ZAG','ZAG','LD','VOL','MEI','LE','PD','CA','PE'],
  'Personalizada': ['GOL','?','?','?','?','?','?','?','?','?','?'],
};

const ESTILOS_JOGO = {
  'Equilibrado':    { posse:50, pressao:50, contraAtaque:50, linhaDefensiva:50, largura:50, ritmo:50, agressividade:50 },
  'Ofensivo':       { posse:65, pressao:70, contraAtaque:40, linhaDefensiva:70, largura:70, ritmo:65, agressividade:55 },
  'Defensivo':      { posse:40, pressao:35, contraAtaque:55, linhaDefensiva:30, largura:35, ritmo:40, agressividade:45 },
  'Contra-Ataque':  { posse:32, pressao:40, contraAtaque:85, linhaDefensiva:32, largura:55, ritmo:75, agressividade:50 },
  'Toque Curto':    { posse:80, pressao:55, contraAtaque:25, linhaDefensiva:55, largura:45, ritmo:35, agressividade:38 },
  'Pressão Alta':   { posse:55, pressao:85, contraAtaque:45, linhaDefensiva:78, largura:55, ritmo:72, agressividade:70 },
};

const TRAINING_TYPES = [
  { id:'finalizacao',   nome:'Finalização',    attr:'finalizacao', icon:'🎯' },
  { id:'passe',         nome:'Passe',          attr:'passe',       icon:'🎽' },
  { id:'drible',        nome:'Drible',         attr:'drible',      icon:'⚡' },
  { id:'defesa',        nome:'Defesa',         attr:'defesa',      icon:'🛡️' },
  { id:'velocidade',    nome:'Velocidade',     attr:'velocidade',  icon:'💨' },
  { id:'resistencia',   nome:'Resistência',    attr:'fisico',      icon:'🏃' },
  { id:'posicionamento',nome:'Posicionamento', attr:'defesa',      icon:'📐' },
  { id:'bolasparadas',  nome:'Bolas Paradas',  attr:'finalizacao', icon:'⚽' },
];

const STADIUM_UPGRADES = [
  { id:'arquibancada',   nome:'Arquibancada',    icon:'🪑', custo:2_000_000, tipo:'nivel', max:5 },
  { id:'gramado',        nome:'Gramado',         icon:'🌱', custo:1_200_000, tipo:'nivel', max:5 },
  { id:'iluminacao',     nome:'Iluminação',      icon:'💡', custo:900_000,   tipo:'nivel', max:5 },
  { id:'museu',          nome:'Museu do Clube',  icon:'🏛️', custo:600_000,   tipo:'flag' },
  { id:'loja',           nome:'Loja Oficial',    icon:'🛍️', custo:800_000,   tipo:'flag' },
  { id:'restaurante',    nome:'Restaurante',     icon:'🍽️', custo:700_000,   tipo:'flag' },
  { id:'estacionamento', nome:'Estacionamento',  icon:'🅿️', custo:500_000,   tipo:'flag' },
  { id:'academiaMedica', nome:'Centro Médico',   icon:'⛑️', custo:1_500_000, tipo:'flag' },
  { id:'telao',          nome:'Telão de LED',    icon:'📺', custo:900_000,   tipo:'flag' },
  { id:'muralTrofeus',   nome:'Mural de Troféus',icon:'🏆', custo:400_000,   tipo:'flag' },
  { id:'estatuaIdolo',   nome:'Estátua de Ídolo',icon:'🗿', custo:1_000_000, tipo:'flag', requerHallDaFama:true },
];

const SPONSOR_NAMES = [
  'TechCorp','Aviação Azul','Banco Sul','Cervejaria Real','Refrigerantes Nova',
  'Seguradora Prime','Telecom Norte','Energia Solar+','AutoMundo','Moda Elite',
  'Laticínios Vale','Combustíveis União'
];

const EMBAIXADOR_NOMES = [
  'Ricardo "Rei" Fontoura', 'Marina Estrela', 'Bruno Águia', 'Sofia Bandeira',
  'Diego Comandante', 'Helena Lenda', 'Tiago Relâmpago', 'Carla Imperatriz',
];

const AI_CLUB_NAMES = [
  'Atlético do Norte','Grêmio Estelar','União Metropolitana','Costa Azul FC',
  'Ferroviário Central','Real Vitória','Comercial Bandeirante','Esporte Fluminense',
  'Náutico da Serra','Independente Sport','Cruzeiro das Águas','Palestra Popular',
  'Vasco do Litoral','Botafogo da Baixada','Internacional Rio Claro','Guarani Estrela',
  'Sport Colonial','Fortaleza do Vale','Bahia Tropical','Paraná Fronteira'
];

// Nomes de clubes gerados por país, para que a liga combine com o país escolhido
// na criação do clube (ex: escolher Espanha gera uma liga com nomes espanhóis).
const COUNTRY_CLUB_DATA = {
  'Brasil': { cidades:['Vitória','Recife','Belém','Curitiba','Natal','Fortaleza','Manaus','Goiânia','Campinas','Santos','Uberlândia','Maceió'],
    templates:['Atlético {c}','Grêmio {c}','{c} Esporte Clube','União {c}','Náutico {c}','{c} Futebol Clube'] },
  'Argentina': { cidades:['Rosario','Mendoza','Córdoba','Salta','Tucumán','San Juan','Santa Fe','Neuquén','Bahía Blanca','Mar del Plata'],
    templates:['Atlético {c}','Deportivo {c}','{c} Central','Club {c}','Sportivo {c}','Estudiantes {c}'] },
  'Portugal': { cidades:['Braga','Coimbra','Setúbal','Faro','Aveiro','Leiria','Viseu','Guimarães','Évora','Beja'],
    templates:['Sporting {c}','{c} FC','União {c}','Vitória {c}','Académico {c}','{c} SC'] },
  'Espanha': { cidades:['Sevilla','Valencia','Toledo','Málaga','Zaragoza','Bilbao','Granada','Murcia','Vigo','Salamanca'],
    templates:['Real {c}','Atlético {c}','{c} CF','Deportivo {c}','Sporting {c}','Unión {c}'] },
  'Inglaterra': { cidades:['Manchester','Liverpool','Leeds','Newcastle','Sheffield','Nottingham','Bristol','Leicester','Southampton','Sunderland'],
    templates:['{c} United','{c} City','{c} Athletic','{c} Rovers','{c} Town','{c} Wanderers'] },
  'Itália': { cidades:['Torino','Bologna','Firenze','Genova','Verona','Bari','Padova','Cagliari','Parma','Brescia'],
    templates:['{c} Calcio','AC {c}','US {c}','{c} FC','Virtus {c}','Unione {c}'] },
  'Alemanha': { cidades:['München','Dortmund','Leipzig','Bremen','Hannover','Stuttgart','Frankfurt','Köln','Nürnberg','Dresden'],
    templates:['Borussia {c}','FC {c}','SV {c}','SC {c}','{c} 04','Eintracht {c}'] },
  'França': { cidades:['Lyon','Marselha','Lille','Nantes','Toulouse','Bordeaux','Rennes','Nice','Reims','Strasbourg'],
    templates:['Olympique {c}','Racing {c}','AS {c}','{c} FC','Stade {c}','FC {c} Étoile'] },
  'Holanda': { cidades:['Eindhoven','Utrecht','Groningen','Tilburg','Arnhem','Nijmegen','Breda','Haarlem','Zwolle','Enschede'],
    templates:['Sporting {c}','{c} FC','SC {c}','VV {c}','{c} United','Vitesse {c}'] },
  'Uruguai': { cidades:['Salto','Paysandú','Rivera','Maldonado','Tacuarembó','Melo','Mercedes','Artigas','Rocha','Durazno'],
    templates:['Atlético {c}','{c} FC','Deportivo {c}','Nacional {c}','Central {c}','Rampla {c}'] },
  'Bélgica': { cidades:['Antuérpia','Gante','Brugge','Liège','Charleroi','Mons','Leuven','Namur','Kortrijk','Mechelen'],
    templates:['Royal {c}','{c} FC','Standard {c}','Sporting {c}','{c} United','KV {c}'] },
  'Croácia': { cidades:['Split','Rijeka','Osijek','Zadar','Pula','Šibenik','Varaždin','Karlovac','Sisak','Zagreb'],
    templates:['NK {c}','Hajduk {c}','Dinamo {c}','{c} FC','Croácia {c}','Građanski {c}'] },
  'Japão': { cidades:['Osaka','Nagoya','Sapporo','Fukuoka','Sendai','Kobe','Yokohama','Hiroshima','Niigata','Kashima'],
    templates:['{c} FC','{c} United','Vissel {c}','Consadole {c}','{c} Antlers','{c} Frontale'] },
  'Colômbia': { cidades:['Cali','Medellín','Barranquilla','Bucaramanga','Cartagena','Pereira','Manizales','Cúcuta','Ibagué','Pasto'],
    templates:['Atlético {c}','Deportivo {c}','Real {c}','{c} FC','Independiente {c}','Unión {c}'] },
  'Estados Unidos': { cidades:['Austin','Denver','Portland','Nashville','Columbus','Cincinnati','Orlando','Phoenix','Charlotte','Sacramento'],
    templates:['{c} FC','{c} United','{c} SC','Real {c}','{c} City','Inter {c}'] },
  'México': { cidades:['Guadalajara','Puebla','Toluca','Querétaro','Mérida','Tijuana','León','Torreón','Veracruz','Morelia'],
    templates:['Atlético {c}','Deportivo {c}','Real {c}','{c} FC','Club {c}','Unión {c}'] },
  'Chile': { cidades:['Concepción','Valparaíso','Antofagasta','Temuco','La Serena','Rancagua','Talca','Iquique','Chillán','Osorno'],
    templates:['Deportivo {c}','Unión {c}','Real {c}','{c} FC','Atlético {c}','Provincial {c}'] },
  'Nigéria': { cidades:['Lagos','Ibadan','Kano','Enugu','Kaduna','Benin','Jos','Warri','Calabar','Owerri'],
    templates:['{c} United','{c} City FC','Real {c}','{c} Rangers','Sporting {c}','{c} Warriors'] },
  'Senegal': { cidades:['Dakar','Thiès','Kaolack','Ziguinchor','Saint-Louis','Rufisque','Diourbel','Louga','Kaffrine','Tambacounda'],
    templates:['{c} FC','Jaraaf {c}','Real {c}','ASC {c}','Casa {c}','{c} United'] },
  'Marrocos': { cidades:['Casablanca','Fez','Marrakech','Tânger','Agadir','Meknès','Oujda','Kenitra','Tétouan','Safi'],
    templates:['Raja {c}','Wydad {c}','{c} AC','Olympique {c}','Ittihad {c}','Chabab {c}'] },
};

function gerarNomesClubesPais(pais, qtd){
  const dados = COUNTRY_CLUB_DATA[pais];
  if (!dados) return shuffle(AI_CLUB_NAMES).slice(0, qtd);
  const combos = [];
  dados.cidades.forEach(c => dados.templates.forEach(t => combos.push(t.replace('{c}', c))));
  return shuffle(combos).slice(0, qtd);
}

// Nome da liga e da copa nacional, de acordo com o país escolhido na criação do clube.
const LEAGUE_NAMES = {
  'Brasil':'Campeonato Brasileiro', 'Argentina':'Liga Profissional Argentina', 'Portugal':'Liga Portuguesa',
  'Espanha':'Liga Espanhola', 'Inglaterra':'Liga Inglesa', 'Itália':'Liga Italiana', 'Alemanha':'Liga Alemã',
  'França':'Liga Francesa', 'Holanda':'Liga Holandesa', 'Uruguai':'Liga Uruguaia', 'Bélgica':'Liga Belga',
  'Croácia':'Liga Croata', 'Japão':'Liga Japonesa', 'Colômbia':'Liga Colombiana', 'Estados Unidos':'Liga Americana',
  'México':'Liga Mexicana', 'Chile':'Liga Chilena', 'Nigéria':'Liga Nigeriana', 'Senegal':'Liga Senegalesa', 'Marrocos':'Liga Marroquina',
};
const CUP_NAMES = {
  'Brasil':'Copa do Brasil', 'Argentina':'Copa da Argentina', 'Portugal':'Taça de Portugal', 'Espanha':'Copa da Espanha',
  'Inglaterra':'Copa da Inglaterra', 'Itália':'Copa da Itália', 'Alemanha':'Copa da Alemanha', 'França':'Copa da França',
  'Holanda':'Copa da Holanda', 'Uruguai':'Copa do Uruguai', 'Bélgica':'Copa da Bélgica', 'Croácia':'Copa da Croácia',
  'Japão':'Copa do Japão', 'Colômbia':'Copa da Colômbia', 'Estados Unidos':'Copa dos Estados Unidos', 'México':'Copa do México',
  'Chile':'Copa do Chile', 'Nigéria':'Copa da Nigéria', 'Senegal':'Copa do Senegal', 'Marrocos':'Copa do Marrocos',
};
function nomeLiga(pais){ return LEAGUE_NAMES[pais || (Game.club && Game.club.pais)] || 'Liga Nacional'; }
function nomeCopa(pais){ return CUP_NAMES[pais || (Game.club && Game.club.pais)] || 'Copa Nacional'; }
function nomeLigaAtual(){ return (Game.world && Game.world.divisaoAtual === 'B') ? `${nomeLiga()} - Série B` : nomeLiga(); }

const INTERNATIONAL_CLUB_NAMES = [
  'Real Fénix (ESP)','Milano Rossoneri (ITA)','London Lions (ENG)','Bavária United (GER)',
  'Paris Étoile (FRA)','River Plateado (ARG)','Tóquio Samurai (JPN)','Lisboa Celeste (POR)'
];

const RANDOM_EVENTS = [
  { id:'lesao_surpresa', nome:'Lesão surpresa', icon:'🚑',
    aplicar(club){
      const elegiveis = club.jogadores.filter(j => !j.lesoes.length);
      if (!elegiveis.length) return null;
      const jog = pick(elegiveis);
      const dias = rnd(2, 5);
      jog.lesoes.push({ tipo:'muscular', rodadasRestantes: dias });
      jog.fadiga = clamp(jog.fadiga + 25, 0, 100);
      return `${jog.nomeCompleto} sofreu uma lesão muscular e desfalca o time por ${dias} rodadas.`;
    }},
  { id:'proposta_inesperada', nome:'Proposta inesperada', icon:'📄',
    aplicar(club){
      if (!club.jogadores.length) return null;
      const jog = pick(club.jogadores);
      const oferta = Math.round(jog.valorMercado * (1.15 + Math.random()*0.3));
      return `Um clube estrangeiro sondou ${jog.nomeCompleto} por ${formatMoney(oferta)}. Fique de olho no mercado.`;
    }},
  { id:'clima', nome:'Mudança climática', icon:'🌧️',
    aplicar(club){
      club.estadio._bonusTemporario = -0.05;
      return `Chuva forte prevista para o próximo jogo em casa — pequena queda esperada na renda de bilheteria.`;
    }},
  { id:'jogador_insatisfeito', nome:'Jogador insatisfeito', icon:'😠',
    aplicar(club){
      const elegiveis = club.jogadores.filter(j => j.moral < 70);
      if (!elegiveis.length) return null;
      const jog = pick(elegiveis);
      jog.moral = clamp(jog.moral - 10, 0, 100);
      return `${jog.nomeCompleto} reclamou publicamente da falta de oportunidades. Moral do elenco pode ser afetada.`;
    }},
  { id:'torcida_revoltada', nome:'Torcida revoltada', icon:'📢',
    aplicar(club){
      club.moralElenco = clamp(club.moralElenco - 6, 0, 100);
      return `A torcida protestou nos arredores do estádio após maus resultados.`;
    }},
  { id:'patrocinador_extra', nome:'Patrocinador extra', icon:'💵',
    aplicar(club){
      const bonus = rnd(150_000, 600_000);
      club.orcamento += bonus;
      return `Um patrocinador extra decidiu apoiar o clube com um bônus de ${formatMoney(bonus)}.`;
    }},
  { id:'escandalo', nome:'Escândalo nos bastidores', icon:'📰',
    aplicar(club){
      const multa = rnd(50_000, 250_000);
      club.orcamento = Math.max(0, club.orcamento - multa);
      club.moralElenco = clamp(club.moralElenco - 4, 0, 100);
      return `Um escândalo nos bastidores custou uma multa de ${formatMoney(multa)} ao clube.`;
    }},
  { id:'nova_promessa', nome:'Nova promessa', icon:'🌟',
    aplicar(club){
      const jovem = new Player(pick(POSITIONS).id, { idade: rnd(15,17), potencial: rnd(85,99), paisPreferencial: club.pais });
      club.youthPlayers.push(jovem);
      return `Um olheiro descobriu uma nova promessa: ${jovem.nomeCompleto} (potencial ${jovem.potencial}) já está na academia.`;
    }},
  { id:'clausula_acionada', nome:'Cláusula de rescisão acionada', icon:'📜',
    aplicar(club){
      const elegiveis = club.jogadores.filter(j => !j.emprestado);
      if (elegiveis.length < 13) return null;
      const jog = pick(elegiveis);
      const valor = jog.clausulaRescisao;
      club.jogadores = club.jogadores.filter(p => p.id !== jog.id);
      club.orcamento += valor;
      club.estatisticasCarreira.receitaTransferencias += valor;
      const destino = pick(Game.world.clubes.filter(c => !c.isPlayer));
      if (destino) destino.squadRef.push(jog);
      return `Um clube estrangeiro pagou a cláusula de rescisão de ${jog.nomeCompleto} (${formatMoney(valor)})!`;
    }},
  { id:'pedido_transferencia', nome:'Pedido de transferência', icon:'🚪',
    aplicar(club){
      if (club._pedidoTransferencia) return null;
      const elegiveis = club.jogadores.filter(j => j.moral < 55 && !j.emprestado);
      if (!elegiveis.length) return null;
      const jog = pick(elegiveis);
      club._pedidoTransferencia = { jogadorId: jog.id, prazoRodadas: 3 };
      return `${jog.nomeCompleto} pediu para deixar o clube por falta de oportunidades.`;
    }},
  { id:'escandalo_doping', nome:'Investigação de doping', icon:'🧪',
    aplicar(club){
      if (Math.random() > 0.35) return null;
      const jog = pick(club.jogadores);
      const pontosPerdidos = rnd(1,3);
      const tabela = Game.world.tabela['player'];
      if (tabela) tabela.pontos = Math.max(0, tabela.pontos - pontosPerdidos);
      club.popularidade = clamp(club.popularidade - 8, 0, 100);
      return `Investigação de doping envolvendo ${jog.nomeCompleto}! O clube perdeu ${pontosPerdidos} ponto(s) na tabela.`;
    }},
  { id:'conselho_acionistas', nome:'Conselho de acionistas', icon:'🏦',
    aplicar(club){
      if (Math.random() < 0.5){
        const bonus = rnd(300_000, 1_200_000);
        club.orcamento += bonus;
        return `O conselho de acionistas aprovou um aporte extra de ${formatMoney(bonus)} no caixa do clube.`;
      } else {
        const corte = Math.round(club.orcamento * 0.05);
        club.orcamento -= corte;
        return `O conselho de acionistas exigiu um corte de gastos de ${formatMoney(corte)}.`;
      }
    }},
  { id:'central_rumores', nome:'Central de rumores', icon:'📡',
    aplicar(club){
      const outros = Game.world.clubes.filter(c => !c.isPlayer);
      if (outros.length < 2) return null;
      const [a, b] = shuffle(outros).slice(0,2);
      const jogAlvo = pick(a.squadRef);
      if (!jogAlvo) return null;
      return `Rumores no mercado: ${b.nome} estaria de olho em ${jogAlvo.nomeCompleto}, do ${a.nome}.`;
    }},
];

const STAFF_DEFS = {
  auxiliar: { nome:'Auxiliar Técnico', icon:'📋', custoMensal: 15_000, desc:'Sugestão automática de escalação e um pequeno bônus de consistência tática em campo.' },
  preparadorFisico: { nome:'Preparador Físico', icon:'💪', custoMensal: 15_000, desc:'Reduz a fadiga gerada pelos treinos e acelera a recuperação de lesões.' },
  olheiroChefe: { nome:'Olheiro-Chefe', icon:'🔭', custoMensal: 18_000, desc:'Revela o ponto fraco do próximo adversário e melhora os talentos achados na academia.' },
};

const MOMENTO_TIPOS = [
  { tipo:'chute', icon:'🎯', label:'Finalização', instrucao:'Escolha o canto do gol!', opcoes:['Canto Esquerdo Alto','Canto Esquerdo Baixo','Meio do Gol','Canto Direito Baixo','Canto Direito Alto'] },
  { tipo:'escanteio', icon:'🚩', label:'Escanteio', instrucao:'Escolha para onde cruzar a bola!', opcoes:['Primeiro Pau','Meio da Área','Segundo Pau'] },
  { tipo:'falta', icon:'⚽', label:'Cobrança de Falta', instrucao:'Escolha o lado da cobrança!', opcoes:['Canto Esquerdo','Por Cima da Barreira','Canto Direito'] },
  { tipo:'rebote', icon:'⚡', label:'Rebote na Área', instrucao:'A bola sobrou dentro da área! Decida rápido!', opcoes:['Bater de Primeira','Ajeitar e Bater','Cabecear'] },
];

const DESAFIOS_SEMANAIS = [
  { id:'sem_sofrer', desc:'Vença esta rodada sem sofrer gols', recompensa: 90_000,
    checar: (golsPro, golsContra) => golsPro > golsContra && golsContra === 0 },
  { id:'tres_gols', desc:'Marque 3 gols ou mais nesta rodada', recompensa: 70_000,
    checar: (golsPro) => golsPro >= 3 },
  { id:'vitoria_simples', desc:'Vença a partida desta rodada', recompensa: 45_000,
    checar: (golsPro, golsContra) => golsPro > golsContra },
  { id:'nao_perder', desc:'Não perca a partida desta rodada', recompensa: 30_000,
    checar: (golsPro, golsContra) => golsPro >= golsContra },
];

/* Banco de 100 perguntas da coletiva de imprensa pós-jogo. */
const PRESS_QUESTIONS = [
  'Como você avalia o desempenho do time hoje?',
  'O que deu certo taticamente na partida de hoje?',
  'A torcida merece essa atuação?',
  'Você está satisfeito com o resultado?',
  'O que faltou para um resultado melhor?',
  'Como está a moral do elenco depois desse jogo?',
  'Existe algum jogador que se destacou especialmente hoje?',
  'A pressão da torcida está afetando o time?',
  'Vocês já pensam no próximo confronto?',
  'A diretoria cobrou alguma coisa depois desse resultado?',
  'Como está fisicamente o elenco para a sequência da temporada?',
  'Você pretende mudar a escalação no próximo jogo?',
  'Algum jogador reclamou de falta de oportunidades?',
  'Como você avalia a arbitragem da partida?',
  'O time está pronto para brigar pelo título?',
  'Existe risco de rebaixamento esta temporada?',
  'Qual foi o ponto-chave da sua estratégia hoje?',
  'Você confia no elenco atual para os próximos desafios?',
  'Como está o relacionamento com a diretoria neste momento?',
  'O mercado de transferências pode trazer reforços em breve?',
  'Algum jogador pode sair no próximo período de negociações?',
  'Você teme perder jogadores importantes para outros clubes?',
  'A comissão técnica está satisfeita com a evolução do time?',
  'Como está a preparação física do elenco?',
  'Vocês pensam em repatriar algum ex-jogador?',
  'A academia de base pode ajudar o time principal em breve?',
  'Você vê algum jovem talento pronto para ser promovido?',
  'Qual sua expectativa para o restante da temporada?',
  'Como você lida com a pressão de ser o técnico deste clube?',
  'Você já pensou em pedir demissão em algum momento?',
  'O que o senhor diria aos torcedores neste momento?',
  'Existe uma cobrança maior por parte dos patrocinadores?',
  'Você acha que o time joga melhor em casa ou fora?',
  'A tática usada hoje foi um risco calculado?',
  'Como está a saúde física do elenco titular?',
  'Você mudaria algo na preparação para esse jogo?',
  'O adversário de hoje surpreendeu você taticamente?',
  'Qual jogador você destacaria pela dedicação nos treinos?',
  'Existe uma "pressão externa" que incomoda o grupo?',
  'Você acredita que o time está evoluindo temporada a temporada?',
  'Alguma lesão preocupa vocês para os próximos jogos?',
  'Como está o approach financeiro do clube neste momento?',
  'Vocês pretendem investir mais no estádio em breve?',
  'A torcida esteve presente em bom número hoje?',
  'Qual sua opinião sobre o nível da liga nesta temporada?',
  'Como está sua relação com o elenco no dia a dia?',
  'Existe algum conflito interno que você gostaria de comentar?',
  'Você vê o time preparado emocionalmente para os próximos desafios?',
  'Qual foi a orientação tática passada no intervalo?',
  'Você mudaria a formação para o próximo confronto?',
  'Como avalia o desempenho do goleiro nesta partida?',
  'A defesa surpreendeu você hoje, para o bem ou para o mal?',
  'O ataque correspondeu às expectativas?',
  'Você vê o time como favorito na próxima rodada?',
  'Existe alguma estratégia especial reservada para o próximo rival?',
  'Como está o entrosamento entre os novos contratados?',
  'O elenco está fisicamente pronto para o mata-mata?',
  'Você teme o desgaste físico com tantos jogos seguidos?',
  'A comissão técnica pensa em rodar o elenco na próxima rodada?',
  'Existe uma meta clara estabelecida pela diretoria para esta temporada?',
  'Você se sente pressionado pelos resultados recentes?',
  'Qual sua opinião sobre o comportamento da torcida hoje?',
  'Você pretende usar a academia de base com mais frequência?',
  'Como está o astral do elenco depois dessa sequência de jogos?',
  'Existe algum jogador insatisfeito que você gostaria de comentar?',
  'Você vê o time capaz de brigar por competições internacionais?',
  'Qual seu plano para melhorar o desempenho ofensivo?',
  'Como está a parte defensiva se planejando para os próximos jogos?',
  'Você acredita que faltou sorte no resultado de hoje?',
  'O que representa esse resultado para a temporada como um todo?',
  'Existe pressão para trazer reforços imediatos?',
  'Você teme a reação da diretoria após este resultado?',
  'Como está sua relação com a imprensa nesse momento da carreira?',
  'Você pretende conversar individualmente com algum jogador?',
  'O time sente o peso de disputar um clássico?',
  'Existe uma "cobrança extra" quando se enfrenta o rival histórico?',
  'Você vê o elenco atual como o melhor da sua gestão até agora?',
  'Como está a expectativa para a Copa Nacional este ano?',
  'Você acredita que o time pode surpreender no torneio internacional?',
  'Qual seu comentário sobre o desempenho da academia de base ultimamente?',
  'Existe algum planejamento especial para a pré-temporada?',
  'Você mudaria sua abordagem tática contra times mais defensivos?',
  'Como está a preparação psicológica do grupo para jogos decisivos?',
  'Existe alguma novidade sobre patrocínios em andamento?',
  'Você vê o estádio pronto para receber grandes públicos?',
  'Qual sua visão sobre o nível de rivalidade da competição atual?',
  'Você teme que a torcida perca a paciência com o time?',
  'Como está sua relação pessoal com a diretoria neste momento?',
  'Existe algum planejamento de longo prazo que você gostaria de comentar?',
  'Você vê espaço para crescimento tático nas próximas rodadas?',
  'Qual conselho você daria aos jovens da base neste momento?',
  'Você acredita que o time está mentalmente preparado para o restante da temporada?',
  'Existe uma expectativa de title race para esta edição da competição?',
  'Como você avalia a evolução física do elenco nesta temporada?',
  'Você pretende blindar algum jogador de sondagens externas?',
  'Qual sua opinião sobre o nível dos árbitros nesta competição?',
  'Existe algum plano de contingência caso percam jogadores-chave?',
  'Você se vê no comando deste clube por muitos anos ainda?',
  'Como está o clima no vestiário depois dessa sequência de resultados?',
];

function perguntaEntrevista(){
  const c = Game.club;
  if (Game.club.rivalId && Math.random() < 0.12){
    return `Como foi encarar o ${getClubeInfo(Game.club.rivalId).nome} sabendo da rivalidade histórica?`;
  }
  if (c.selecao?.ativo && Math.random() < 0.08){
    return `Como concilia o trabalho no ${c.nome} com o comando da Seleção de ${c.pais}?`;
  }
  return pick(PRESS_QUESTIONS);
}

function classificarPerguntaTexto(t){
  const s = t.toLowerCase();
  if (/demiss|risco|pressão|cobr.*diretoria|diretoria cobrou|perca a paciência|pedir demissão/.test(s)) return 'pressao';
  if (/transferência|reforço|mercado|sondagens|repatriar|contratados|sair no próximo|sondagem/.test(s)) return 'mercado';
  if (/patrocín|financ|estádio|orçamento/.test(s)) return 'financas';
  if (/rival|clássico/.test(s)) return 'classico';
  if (/seleção/.test(s)) return 'selecao';
  if (/base|jovem|academia|promovido/.test(s)) return 'base';
  if (/torcida|público|estádio/.test(s)) return 'estadio';
  if (/resultado|desempenho|atuação|jogo de hoje|partida|goleiro|defesa|ataque|tática|escalação|formação/.test(s)) return 'resultado';
  if (/futuro|temporada|título|expectativa|meta|liga|copa|torneio/.test(s)) return 'futuro';
  return 'geral';
}

const RESPOSTAS_POR_CATEGORIA = {
  resultado: [
    { tipo:'elogiar', label:'Elogiar a entrega do time' },
    { tipo:'cobrar', label:'Dizer que esperava mais' },
    { tipo:'humilde', label:'Analisar com equilíbrio' },
  ],
  pressao: [
    { tipo:'elogiar', label:'Defender publicamente o elenco' },
    { tipo:'cobrar', label:'Assumir a responsabilidade' },
    { tipo:'humilde', label:'Pedir paciência à torcida' },
  ],
  mercado: [
    { tipo:'elogiar', label:'Elogiar o trabalho da diretoria' },
    { tipo:'cobrar', label:'Cobrar reforços publicamente' },
    { tipo:'humilde', label:'Ser evasivo sobre o mercado' },
  ],
  financas: [
    { tipo:'elogiar', label:'Agradecer o apoio financeiro' },
    { tipo:'cobrar', label:'Cobrar mais investimento' },
    { tipo:'humilde', label:'Falar em cautela financeira' },
  ],
  classico: [
    { tipo:'elogiar', label:'Exaltar a entrega no clássico' },
    { tipo:'cobrar', label:'Provocar o rival' },
    { tipo:'humilde', label:'Minimizar a rivalidade' },
  ],
  selecao: [
    { tipo:'elogiar', label:'Falar com orgulho da Seleção' },
    { tipo:'cobrar', label:'Priorizar publicamente o clube' },
    { tipo:'humilde', label:'Dizer que concilia bem os dois' },
  ],
  base: [
    { tipo:'elogiar', label:'Valorizar a base do clube' },
    { tipo:'cobrar', label:'Cobrar mais investimento na base' },
    { tipo:'humilde', label:'Falar com cautela sobre os jovens' },
  ],
  estadio: [
    { tipo:'elogiar', label:'Agradecer o apoio da torcida' },
    { tipo:'cobrar', label:'Cobrar mais público no estádio' },
    { tipo:'humilde', label:'Entender as dificuldades da torcida' },
  ],
  futuro: [
    { tipo:'elogiar', label:'Projetar um futuro otimista' },
    { tipo:'cobrar', label:'Estabelecer metas ambiciosas' },
    { tipo:'humilde', label:'Falar em passo a passo' },
  ],
  geral: [
    { tipo:'elogiar', label:'Elogiar o elenco' },
    { tipo:'cobrar', label:'Cobrar mais' },
    { tipo:'humilde', label:'Ser humilde' },
  ],
};

function respostasParaPergunta(pergunta){
  return RESPOSTAS_POR_CATEGORIA[classificarPerguntaTexto(pergunta)] || RESPOSTAS_POR_CATEGORIA.geral;
}

const ACHIEVEMENTS = [
  { id:'primeira_vitoria', nome:'Primeira Vitória', desc:'Vença sua primeira partida.', icon:'🥇',
    check: c => c.estatisticasCarreira.vitorias >= 1 },
  { id:'dez_vitorias', nome:'Especialista em 3 Pontos', desc:'Vença 10 partidas.', icon:'🔟',
    check: c => c.estatisticasCarreira.vitorias >= 10 },
  { id:'cinquenta_vitorias', nome:'Máquina de Vencer', desc:'Vença 50 partidas.', icon:'🏅',
    check: c => c.estatisticasCarreira.vitorias >= 50 },
  { id:'primeiro_titulo', nome:'Primeiro Título', desc:'Conquiste seu primeiro título.', icon:'🏆',
    check: c => c.conquistas.length >= 1 },
  { id:'treinador_lendario', nome:'Treinador Lendário', desc:'Conquiste 5 títulos.', icon:'👑',
    check: c => c.conquistas.length >= 5 },
  { id:'cem_gols', nome:'100 Gols', desc:'Marque 100 gols com o clube.', icon:'⚽',
    check: c => c.estatisticasCarreira.golsMarcados >= 100 },
  { id:'quinhentos_gols', nome:'500 Gols', desc:'Marque 500 gols com o clube.', icon:'🥅',
    check: c => c.estatisticasCarreira.golsMarcados >= 500 },
  { id:'cem_milhoes', nome:'100 Milhões em Caixa', desc:'Acumule R$100 milhões no orçamento.', icon:'💰',
    check: c => c.orcamento >= 100_000_000 },
  { id:'invicto_10', nome:'Invencível', desc:'Fique 10 jogos sem perder.', icon:'🛡️',
    check: c => c.estatisticasCarreira.maiorSequenciaInvicta >= 10 },
  { id:'invicto_20', nome:'Muralha', desc:'Fique 20 jogos sem perder.', icon:'🧱',
    check: c => c.estatisticasCarreira.maiorSequenciaInvicta >= 20 },
  { id:'melhor_ataque', nome:'Melhor Ataque', desc:'Termine uma temporada com o ataque mais artilheiro.', icon:'🎯',
    check: c => c.premiosTemporada.some(p => p.tipo === 'melhor_ataque') },
  { id:'melhor_defesa', nome:'Melhor Defesa', desc:'Termine uma temporada com a defesa menos vazada.', icon:'🧤',
    check: c => c.premiosTemporada.some(p => p.tipo === 'melhor_defesa') },
  { id:'campeao_nacional', nome:'Campeão Nacional', desc:'Vença a liga nacional.', icon:'🥇',
    check: c => c.conquistas.some(x => x.tipo === 'liga') },
  { id:'campeao_copa', nome:'Campeão da Copa', desc:'Vença a copa nacional.', icon:'🏆',
    check: c => c.conquistas.some(x => x.tipo === 'copa') },
  { id:'campeao_internacional', nome:'Glória Internacional', desc:'Vença o torneio internacional.', icon:'🌍',
    check: c => c.conquistas.some(x => x.tipo === 'internacional') },
  { id:'campeao_mundial', nome:'Campeão Mundial', desc:'Conquiste o Mundial de Clubes.', icon:'🌐',
    check: c => c.conquistas.some(x => x.tipo === 'mundial') },
  { id:'gastador', nome:'Livre de Impostos', desc:'Gaste mais de R$50 milhões em transferências.', icon:'🛒',
    check: c => c.estatisticasCarreira.gastoTransferencias >= 50_000_000 },
  { id:'vendedor', nome:'Olho no Mercado', desc:'Fature mais de R$50 milhões vendendo jogadores.', icon:'🏷️',
    check: c => c.estatisticasCarreira.receitaTransferencias >= 50_000_000 },
  { id:'formador', nome:'Celeiro de Craques', desc:'Promova 5 jogadores da academia ao time principal.', icon:'🌱',
    check: c => c.estatisticasCarreira.promovidosAcademia >= 5 },
  { id:'construtor', nome:'Construtor de Impérios', desc:'Compre todas as melhorias de infraestrutura do estádio.', icon:'🏟️',
    check: c => ['museu','loja','restaurante','estacionamento','academiaMedica'].every(f => c.estadio[f]) },
  { id:'decada', nome:'Uma Década no Comando', desc:'Complete 10 temporadas no clube.', icon:'📆',
    check: c => c.temporada >= 10 },
  { id:'bolso_cheio', nome:'Bolso Cheio', desc:'Acumule R$1 milhão de patrimônio pessoal.', icon:'💼',
    check: c => c.patrimonioTreinador >= 1_000_000 },
  { id:'nome_conhecido', nome:'Nome Conhecido', desc:'Alcance 50 de reputação como técnico.', icon:'🗞️',
    check: c => c.reputacao >= 50 },
  { id:'lenda_do_futebol', nome:'Lenda do Futebol', desc:'Alcance 90 de reputação como técnico.', icon:'👑',
    check: c => c.reputacao >= 90 },
  { id:'convocado', nome:'Convocado', desc:'Assuma o comando de uma Seleção Nacional.', icon:'🌍',
    check: c => c.selecao && c.selecao.ativo },
  { id:'campeao_do_mundo_selecao', nome:'Campeão do Mundo pela Seleção', desc:'Vença a Copa do Mundo com a Seleção Nacional.', icon:'🌐',
    check: c => c.conquistas.some(x => x.tipo === 'selecao') },
  { id:'sobrevivente', nome:'Sobrevivente', desc:'Seja demitido e assuma outro clube sem desistir da carreira.', icon:'🔁',
    check: c => c.historicoClubes && c.historicoClubes.length >= 2 },
  { id:'comissao_completa', nome:'Comissão Completa', desc:'Contrate auxiliar técnico, preparador físico e olheiro-chefe.', icon:'👔',
    check: c => c.comissao.auxiliar && c.comissao.preparadorFisico && c.comissao.olheiroChefe },
  { id:'classico_vencido', nome:'Rei do Clássico', desc:'Vença seu clube rival 3 vezes.', icon:'⚔️',
    check: c => (c.estatisticasCarreira.vitoriasClassico || 0) >= 3 },
  { id:'idolo_aposentado', nome:'Um Ídolo se Vai', desc:'Tenha o primeiro jogador aposentado no Hall da Fama do clube.', icon:'🎉',
    check: c => c.hallDaFama && c.hallDaFama.length >= 1 },
  { id:'desafiador', nome:'Sempre à Altura', desc:'Complete 5 desafios semanais.', icon:'🎯',
    check: c => (c.estatisticasCarreira.desafiosCompletos || 0) >= 5 },
  { id:'acesso_conquistado', nome:'De Volta ao Topo', desc:'Suba de divisão após ser rebaixado.', icon:'🎉',
    check: c => (c.estatisticasCarreira.acessos || 0) >= 1 },
  { id:'fenix', nome:'Fênix', desc:'Seja rebaixado e volte a ser campeão depois.', icon:'🔥',
    check: c => (c.estatisticasCarreira.rebaixamentos || 0) >= 1 && c.conquistas.some(x => x.tipo === 'liga') },
  { id:'ídolo_popular', nome:'Queridinho da Torcida', desc:'Alcance 80 de popularidade.', icon:'❤️',
    check: c => c.popularidade >= 80 },
  { id:'imperio_global', nome:'Império Global', desc:'Tenha embaixador, naming rights e loja oficial ao mesmo tempo.', icon:'🌐',
    check: c => c.embaixador && c.estadio.namingVendido && c.estadio.loja },
  { id:'casa_cheia', nome:'Casa Cheia', desc:'Bata o recorde de público do clube.', icon:'📣',
    check: c => c.recordes.maiorPublico >= c.estadio.capacidade * 0.9 },
];

/* =====================================================================
   2. UTILITÁRIOS
   ===================================================================== */

function rnd(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr){ return arr && arr.length ? arr[rnd(0, arr.length - 1)] : undefined; }
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function uid(){ return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }
function shuffle(arr){
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--){
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function formatMoney(v){
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  let str;
  if (abs >= 1_000_000) str = (abs/1_000_000).toFixed(2).replace(/\.00$/,'') + 'M';
  else if (abs >= 1_000) str = (abs/1_000).toFixed(0) + 'K';
  else str = abs.toFixed(0);
  return sign + 'R$ ' + str;
}

/* =====================================================================
   3. CLASSE: Player
   ===================================================================== */

class Player {
  constructor(positionId, opts = {}){
    const posDef = POSITIONS.find(p => p.id === positionId) || POSITIONS[5];

    this.id = uid();
    this.nome = pick(FIRST_NAMES);
    this.sobrenome = pick(LAST_NAMES);
    this.idade = opts.idade ?? rnd(17, 34);
    this.pais = opts.pais ?? (opts.paisPreferencial && Math.random() < 0.68 ? opts.paisPreferencial : pick(COUNTRIES));
    this.posicao = posDef.id;
    this.numero = opts.numero ?? rnd(1, 99);

    this.potencial = opts.potencial ?? rnd(55, 92);
    const baseOverall = clamp(this.potencial - rnd(2, 18) - (this.idade < 21 ? rnd(5,15) : 0), 40, 99);
    this.overall = baseOverall;

    this.atributos = this._gerarAtributos(posDef.id);

    this.moral = rnd(60, 95);
    this.fadiga = rnd(0, 15);
    this.forma = rnd(60, 95);

    this.valorMercado = this._calcularValor();
    this.salario = Math.round(this.valorMercado * 0.0028 / 1000) * 1000;
    this.contrato = rnd(1, 5);
    this.clausulaRescisao = Math.round(this.valorMercado * (1.4 + Math.random()*0.8) / 1000) * 1000;

    this.personalidade = pick(PERSONALITIES);
    this.altura = rnd(165, 200);
    this.peso = rnd(60, 95);
    this.pernaDominante = Math.random() < 0.75 ? 'Direita' : (Math.random() < 0.9 ? 'Esquerda' : 'Ambidestro');
    this.lesoes = [];

    // Estatísticas de temporada (resetadas a cada nova temporada)
    this.golsTemporada = 0;
    this.assistenciasTemporada = 0;
    this.cartoesAmarelos = 0;
    this.cartoesVermelhos = 0;
    this.jogosTemporada = 0;

    // Estatísticas de carreira no clube (nunca resetam)
    this.golsClube = 0;
    this.assistenciasClube = 0;

    this.emprestado = false;
    this.clubeEmprestimoNome = null;
    this.rodadasEmprestimoRestantes = 0;

    this.foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.nome[0]+'+'+this.sobrenome[0])}&background=1b2620&color=3ed27a&bold=true&size=128`;
  }

  _gerarAtributos(pos){
    const base = () => rnd(45, 88);
    const atrib = { velocidade: base(), passe: base(), finalizacao: base(), drible: base(), defesa: base(), fisico: base() };
    const boost = (attr, min, max) => atrib[attr] = clamp(rnd(min, max), 1, 99);
    switch(pos){
      case 'GOL': boost('defesa', 70, 95); boost('fisico', 65, 90); boost('finalizacao', 10, 30); boost('drible', 15, 35); boost('passe', 30, 55); break;
      case 'ZAG': boost('defesa', 68, 92); boost('fisico', 65, 90); boost('finalizacao', 15, 40); boost('velocidade', 40, 70); break;
      case 'LD': case 'LE': boost('velocidade', 65, 90); boost('passe', 55, 80); boost('defesa', 55, 78); break;
      case 'VOL': boost('passe', 65, 88); boost('defesa', 60, 85); boost('fisico', 60, 85); break;
      case 'MEI': boost('passe', 70, 92); boost('drible', 60, 85); break;
      case 'MEIA': boost('passe', 68, 90); boost('drible', 68, 92); boost('finalizacao', 55, 80); break;
      case 'PD': case 'PE': boost('velocidade', 72, 95); boost('drible', 70, 93); boost('finalizacao', 55, 82); break;
      case 'CA': boost('finalizacao', 72, 95); boost('fisico', 60, 88); boost('velocidade', 55, 85); break;
    }
    return atrib;
  }

  recalcularOverall(){
    const a = this.atributos;
    const media = (a.velocidade + a.passe + a.finalizacao + a.drible + a.defesa + a.fisico) / 6;
    this.overall = clamp(Math.round(media), 30, Math.min(99, this.potencial + 3));
    this.valorMercado = this._calcularValor();
  }

  _calcularValor(){
    const idadeFator = this.idade <= 24 ? 1.35 : this.idade <= 29 ? 1.0 : this.idade <= 33 ? 0.55 : 0.25;
    const base = Math.pow(this.overall, 3.1) * 0.9;
    const potFator = 1 + ((this.potencial - this.overall) * 0.02);
    return Math.max(50_000, Math.round((base * idadeFator * potFator) / 1000) * 1000);
  }

  envelhecer(){
    this.idade++;
    if (this.idade <= 23 && Math.random() < 0.7) {
      Object.keys(this.atributos).forEach(k => this.atributos[k] = clamp(this.atributos[k] + rnd(0,3), 1, 99));
    } else if (this.idade >= 32) {
      Object.keys(this.atributos).forEach(k => this.atributos[k] = clamp(this.atributos[k] - rnd(0,4), 1, 99));
    } else if (Math.random() < 0.4) {
      Object.keys(this.atributos).forEach(k => this.atributos[k] = clamp(this.atributos[k] + rnd(-1,2), 1, 99));
    }
    this.recalcularOverall();
  }

  resetarTemporada(){
    this.golsTemporada = 0; this.assistenciasTemporada = 0;
    this.cartoesAmarelos = 0; this.cartoesVermelhos = 0; this.jogosTemporada = 0;
  }

  get nomeCompleto(){ return `${this.nome} ${this.sobrenome}`; }
  get suspenso(){ return this.cartoesAmarelos > 0 && this.cartoesAmarelos % 3 === 0; }
  get lesionado(){ return this.lesoes.some(l => l.rodadasRestantes > 0); }

  toJSON(){ return { ...this }; }
  static fromJSON(data){
    const p = Object.create(Player.prototype);
    Object.assign(p, data);
    return p;
  }
}

/* =====================================================================
   4. CLASSE: Club (clube do jogador)
   ===================================================================== */

class Club {
  constructor(cfg){
    this.nome = cfg.nome;
    this.cidade = cfg.cidade;
    this.pais = cfg.pais;
    this.escudoId = cfg.escudoId;
    this.kitPrimario = cfg.kitPrimario;
    this.kitSecundario = cfg.kitSecundario;
    this.treinador = cfg.treinador;
    this.dificuldade = cfg.dificuldade;

    this.fundadoEm = new Date().getFullYear();
    this.temporada = 1;
    this.moralElenco = 78;

    const orcamentos = { facil: 32_000_000, normal: 20_000_000, dificil: 12_000_000, extremo: 6_000_000 };
    this.orcamento = orcamentos[cfg.dificuldade] ?? 20_000_000;

    this.estadio = {
      nome: `Estádio Municipal de ${cfg.cidade}`,
      capacidade: 8000,
      nivelGramado: 1, nivelIluminacao: 1, nivelArquibancada: 1,
      museu: false, loja: false, restaurante: false, estacionamento: false, academiaMedica: false,
      telao: false, muralTrofeus: false, estatuaIdolo: false, namingVendido: false,
      _bonusTemporario: 0,
    };

    this.academia = { nivel: 1, alojamento: false };
    this.centroTreinamento = { nivel: 1 };

    this.jogadores = SQUAD_TEMPLATE.map(pos => new Player(pos, { paisPreferencial: cfg.pais }));
    assignNumeros(this.jogadores);

    this.youthPlayers = [];
    this.conquistas = [];
    this.historico = [{ ano: this.fundadoEm, evento: `Fundação do ${this.nome}` }];
    this.noticias = [];
    this.premiosTemporada = [];
    this.achievementsUnlocked = [];

    this.financas = { receitas: [], despesas: [] };
    this.sponsor = null;

    this.formacaoAtual = '4-3-3';
    this.escalacaoIds = [];
    this.bancoIds = [];
    this.capitaoId = null;
    this.batedorPenaltiId = null;
    this.batedorFaltaId = null;
    this.tatica = { posse: 50, pressao: 50, contraAtaque: 50, linhaDefensiva: 50, largura: 50, ritmo: 50, agressividade: 50 };
    this.estiloAtual = 'Equilibrado';
    this.treinoFeitoRodada = 0;

    this.estatisticasCarreira = {
      vitorias: 0, empates: 0, derrotas: 0,
      golsMarcados: 0, golsSofridos: 0,
      sequenciaInvicta: 0, maiorSequenciaInvicta: 0,
      gastoTransferencias: 0, receitaTransferencias: 0,
      promovidosAcademia: 0, vitoriasClassico: 0, desafiosCompletos: 0, rebaixamentos: 0, acessos: 0,
    };

    // Carreira do técnico: reputação, confiança da diretoria (risco de demissão),
    // patrimônio pessoal (salário próprio) e status na Seleção Nacional.
    this.reputacao = 20;
    this.confiancaDiretoria = 70;
    const salariosBase = { facil: 45_000, normal: 32_000, dificil: 22_000, extremo: 14_000 };
    this.salarioTreinadorBase = salariosBase[cfg.dificuldade] ?? 32_000;
    this.patrimonioTreinador = 0;
    this.historicoClubes = [{ nome: this.nome, desde: this.temporada }];
    this.selecao = { ativo: false };

    // Comissão técnica, rival, hall da fama, desafios e crise financeira.
    this.comissao = { auxiliar: null, preparadorFisico: null, olheiroChefe: null };
    this.rivalId = null;
    this.hallDaFama = [];
    this.desafioSemanal = null;
    this.mesesOrcamentoNegativo = 0;
    this.configModoJogavel = false;

    // Popularidade, embaixador, meta de carreira, foco de olheiro e recordes pessoais.
    this.popularidade = 30;
    this.embaixador = null;
    this.metaCarreira = null;
    this.olheiroFocoPais = null;
    this.recordes = { maiorOrcamento: this.orcamento, maiorPublico: 0, maisGolsTemporada: 0 };
  }

  get overallMedio(){
    if (!this.jogadores.length) return 0;
    return Math.round(this.jogadores.reduce((s,j) => s + j.overall, 0) / this.jogadores.length);
  }
  get folhaSalarial(){ return this.jogadores.reduce((s,j) => s + (j.emprestado ? 0 : j.salario), 0); }

  addNoticia(texto, icon = '📰'){
    this.noticias.unshift({ icon, texto, rodada: Game.world ? Game.world.rodadaAtual : 0, temporada: this.temporada });
    if (this.noticias.length > 60) this.noticias.length = 60;
  }

  toJSON(){ return { ...this, jogadores: this.jogadores.map(j => j.toJSON()), youthPlayers: this.youthPlayers.map(j => j.toJSON()) }; }
  static fromJSON(data){
    const c = Object.create(Club.prototype);
    Object.assign(c, data);
    c.jogadores = data.jogadores.map(Player.fromJSON);
    c.youthPlayers = (data.youthPlayers || []).map(Player.fromJSON);
    return c;
  }
}

function assignNumeros(squad){
  const usados = new Set();
  squad.forEach(j => {
    let n = j.numero;
    let tentativas = 0;
    while (usados.has(n) && tentativas < 200){ n = rnd(1, 99); tentativas++; }
    usados.add(n);
    j.numero = n;
  });
}

/* =====================================================================
   5. GERAÇÃO DO MUNDO (liga, clubes de IA, agentes livres)
   ===================================================================== */

function gerarClubeIA(nome, paisPreferencial, nivelFraco){
  const squad = SQUAD_TEMPLATE_AI.map(pos => new Player(pos, { paisPreferencial }));
  if (nivelFraco){
    squad.forEach(p => {
      p.potencial = clamp(p.potencial - 15, 40, 80);
      Object.keys(p.atributos).forEach(k => p.atributos[k] = clamp(p.atributos[k] - rnd(8,18), 20, 80));
      p.recalcularOverall();
    });
  }
  assignNumeros(squad);
  return {
    id: uid(),
    nome,
    pais: paisPreferencial,
    escudoId: rnd(0, CREST_DEFS.length - 1),
    isPlayer: false,
    squadRef: squad,
    orcamento: rnd(nivelFraco ? 1_500_000 : 5_000_000, nivelFraco ? 10_000_000 : 30_000_000),
    recemPromovido: false,
  };
}

function gerarCalendario(idsOriginal){
  let ids = [...idsOriginal];
  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  let list = ids.slice();
  const turno1 = [];
  for (let r = 0; r < rounds; r++){
    for (let i = 0; i < half; i++){
      const home = list[i], away = list[n - 1 - i];
      const mandanteId = r % 2 === 0 ? home : away;
      const visitanteId = r % 2 === 0 ? away : home;
      turno1.push({ rodada: r + 1, mandanteId, visitanteId, golsMandante: null, golsVisitante: null, jogado: false, eventos: null, estatisticas: null });
    }
    const fixed = list[0];
    const rest = list.slice(1);
    rest.unshift(rest.pop());
    list = [fixed, ...rest];
  }
  const turno2 = turno1.map(j => ({ rodada: j.rodada + rounds, mandanteId: j.visitanteId, visitanteId: j.mandanteId, golsMandante: null, golsVisitante: null, jogado: false, eventos: null, estatisticas: null }));
  return [...turno1, ...turno2];
}

function gerarOfertasPatrocinio(){
  const boost = (Game.club && Game.club.embaixador) ? 1.35 : 1;
  return shuffle(SPONSOR_NAMES).slice(0, 4).map(nome => ({
    id: uid(), nome,
    valorMensal: Math.round(rnd(80_000, 900_000) * boost),
    duracaoTemporadas: rnd(1, 3),
  }));
}

function gerarMundo(clubeNome, paisEscolhido){
  const nomesIA = gerarNomesClubesPais(paisEscolhido, 19);
  const clubes = [{ id: 'player', nome: clubeNome, isPlayer: true, squadRef: null }];
  nomesIA.forEach(nome => clubes.push(gerarClubeIA(nome, paisEscolhido)));

  const tabela = {};
  clubes.forEach(c => tabela[c.id] = { pontos:0, v:0, e:0, d:0, gp:0, gc:0, j:0 });

  const calendario = gerarCalendario(clubes.map(c => c.id));
  const freeAgents = [];
  for (let i = 0; i < 700; i++) freeAgents.push(new Player(pick(POSITIONS).id));

  return {
    clubes, tabela, calendario,
    rodadaAtual: 1,
    totalRodadas: Math.max(...calendario.map(j => j.rodada)),
    freeAgents,
    sponsorOfertasDisponiveis: gerarOfertasPatrocinio(),
    leilaoAtual: gerarLeilaoSemanal(freeAgents),
    copa: null,
    supercopa: null,
    internacional: null,
    ultimoResultadoJogador: null,
    ultimoCampeaoLiga: null,
    ultimoCampeaoCopa: null,
    divisaoAtual: 'A',
    reservaSerieA: null,
    reservaSerieB: null,
  };
}

function gerarLeilaoSemanal(freeAgents){
  const candidatos = freeAgents.filter(p => p.potencial >= 78 && p.idade <= 26);
  const jogador = candidatos.length ? pick(candidatos) : pick(freeAgents);
  if (!jogador) return null;
  return { jogadorId: jogador.id, lanceMinimo: Math.round(jogador.valorMercado * 0.8), encerrada: false };
}

function _findClubeQualquerLugar(clubId){
  let c = Game.world.clubes.find(x => x.id === clubId);
  if (!c && Game.world.internacional && Game.world.internacional.rivais) c = Game.world.internacional.rivais.find(x => x.id === clubId);
  if (!c && Game.world.copaDoMundoSelecoes && Game.world.copaDoMundoSelecoes.rivais) c = Game.world.copaDoMundoSelecoes.rivais.find(x => x.id === clubId);
  return c;
}
function getClubeInfo(clubId){
  if (clubId === 'player') return { nome: Game.club.nome, escudoId: Game.club.escudoId };
  if (clubId === 'selecao-jogador') return { nome: `Seleção de ${Game.club.pais}`, escudoId: Game.club.escudoId };
  const c = _findClubeQualquerLugar(clubId);
  return c ? { nome: c.nome, escudoId: c.escudoId } : { nome: '—', escudoId: 0 };
}

function getSquad(clubId){
  if (clubId === 'player') return Game.club.jogadores;
  const c = _findClubeQualquerLugar(clubId);
  return c ? c.squadRef : [];
}

/* =====================================================================
   6. MOTOR DE PARTIDA
   ===================================================================== */

function overallOf(list){
  if (!list || !list.length) return 50;
  return list.reduce((s,p) => s + p.overall, 0) / list.length;
}

function taticaFator(tatica){
  if (!tatica) return 1;
  return 1 + ((tatica.pressao - 50) / 500) + ((tatica.posse - 50) / 700) + ((tatica.largura||50) - 50) / 900 + ((tatica.ritmo||50) - 50) / 900;
}

function bestXI(squad){
  const disponiveis = squad.filter(p => !p.lesionado && !p.suspenso && !p.emprestado);
  const pool = disponiveis.length >= 11 ? disponiveis : squad.filter(p => !p.emprestado);
  const gks = pool.filter(p => p.posicao === 'GOL').sort((a,b) => b.overall - a.overall);
  const resto = pool.filter(p => p.posicao !== 'GOL').sort((a,b) => b.overall - a.overall);
  return [gks[0], ...resto.slice(0, 10)].filter(Boolean);
}

function getXIDoJogador(){
  const validos = Game.club.escalacaoIds
    .map(id => Game.club.jogadores.find(j => j.id === id))
    .filter(j => j && !j.lesionado && !j.suspenso && !j.emprestado);
  if (validos.length >= 7) return validos;
  return bestXI(Game.club.jogadores);
}

function simulateMatch(mandanteInfo, visitanteInfo){
  const forcaM = overallOf(mandanteInfo.xi) * taticaFator(mandanteInfo.tatica) * 1.06 * (mandanteInfo.bonus || 1);
  const forcaV = overallOf(visitanteInfo.xi) * taticaFator(visitanteInfo.tatica) * (visitanteInfo.bonus || 1);
  const total = forcaM + forcaV || 1;
  const probM = forcaM / total;

  const ritmoMedio = ((mandanteInfo.tatica?.ritmo ?? 50) + (visitanteInfo.tatica?.ritmo ?? 50)) / 2;
  const chances = clamp(rnd(9, 16) + Math.round((ritmoMedio - 50) / 12), 6, 22);
  const eventos = [];
  let golsM = 0, golsV = 0, finM = 0, finV = 0, escM = 0, escV = 0, cartM = 0, cartV = 0, defM = 0, defV = 0, xgM = 0, xgV = 0;
  const usadas = new Set();
  const minuto = () => { let m; let t=0; do { m = rnd(1,90); t++; } while (usadas.has(m) && t < 300); usadas.add(m); return m; };

  for (let i = 0; i < chances; i++){
    const timeM = Math.random() < probM;
    const xiAtaque = timeM ? mandanteInfo.xi : visitanteInfo.xi;
    const xiDefesa = timeM ? visitanteInfo.xi : mandanteInfo.xi;
    const atacantesPossiveis = xiAtaque.filter(p => ATACANTE_POS.includes(p.posicao));
    const atacante = atacantesPossiveis.length ? pick(atacantesPossiveis) : pick(xiAtaque);
    const goleiro = xiDefesa.find(p => p.posicao === 'GOL');

    if (!atacante) continue;
    if (timeM) finM++; else finV++;

    const chanceGol = clamp((atacante.atributos.finalizacao - (goleiro ? goleiro.atributos.defesa * 0.6 : 35)) / 140 + 0.28, 0.08, 0.72);
    if (timeM) xgM += chanceGol; else xgV += chanceGol;
    const min = minuto();

    if (Math.random() < chanceGol){
      if (timeM) golsM++; else golsV++;
      atacante.golsTemporada++; atacante.golsClube++;
      const outros = xiAtaque.filter(p => p !== atacante);
      let assistente = null;
      if (outros.length && Math.random() < 0.6){
        assistente = pick(outros);
        assistente.assistenciasTemporada++; assistente.assistenciasClube++;
      }
      eventos.push({ minuto: min, tipo:'gol', time: timeM?'mandante':'visitante', jogador: atacante.nomeCompleto, assistencia: assistente ? assistente.nomeCompleto : null });
    } else {
      if (goleiro){ if (timeM) defV++; else defM++; }
      if (Math.random() < 0.18){ eventos.push({ minuto: min, tipo:'escanteio', time: timeM?'mandante':'visitante' }); if (timeM) escM++; else escV++; }
      else if (Math.random() < 0.10){ eventos.push({ minuto: min, tipo:'impedimento', time: timeM?'mandante':'visitante' }); }
      else if (Math.random() < 0.06){ eventos.push({ minuto: min, tipo:'penalti_perdido', time: timeM?'mandante':'visitante', jogador: atacante.nomeCompleto }); }
    }

    if (Math.random() < 0.10 * (1 + (((timeM ? visitanteInfo.tatica?.agressividade : mandanteInfo.tatica?.agressividade) ?? 50) - 50) / 100)){
      const m2 = minuto();
      const ladoFalta = timeM ? visitanteInfo.xi : mandanteInfo.xi;
      const faltoso = pick(ladoFalta);
      if (faltoso){
        const chanceVermelho = faltoso.personalidade === 'Temperamental' ? 0.16 : faltoso.personalidade === 'Volátil' ? 0.13 : 0.08;
        const vermelho = Math.random() < chanceVermelho;
        if (timeM) cartV++; else cartM++;
        if (vermelho) faltoso.cartoesVermelhos++; else faltoso.cartoesAmarelos++;
        eventos.push({ minuto: m2, tipo: vermelho ? 'cartao_vermelho' : 'cartao_amarelo', time: timeM?'visitante':'mandante', jogador: faltoso.nomeCompleto });
      }
    }
    if (Math.random() < 0.045){
      const m3 = minuto();
      const ladoLesao = timeM ? mandanteInfo.xi : visitanteInfo.xi;
      const machucado = pick(ladoLesao);
      if (machucado){
        machucado.lesoes.push({ tipo:'jogo', rodadasRestantes: rnd(1,4) });
        eventos.push({ minuto: m3, tipo:'lesao', time: timeM?'mandante':'visitante', jogador: machucado.nomeCompleto });
      }
    }
  }

  eventos.sort((a,b) => a.minuto - b.minuto);
  const posseM = clamp(Math.round(50 + ((mandanteInfo.tatica?.posse ?? 50) - 50) / 2 + (probM - 0.5) * 30), 26, 78);

  [...mandanteInfo.xi, ...visitanteInfo.xi].forEach(p => p.jogosTemporada++);

  return {
    golsMandante: golsM, golsVisitante: golsV, eventos,
    estatisticas: {
      posse: [posseM, 100 - posseM],
      finalizacoes: [finM, finV],
      escanteios: [escM, escV],
      cartoes: [cartM, cartV],
      defesas: [defM, defV],
      xg: [Math.round(xgM*10)/10, Math.round(xgV*10)/10],
    },
  };
}

/* =====================================================================
   7. CALENDÁRIO / TABELA / RODADAS
   ===================================================================== */

function taticaNeutra(){ return { posse:50, pressao:50, contraAtaque:50, linhaDefensiva:50, largura:50, ritmo:50, agressividade:50 }; }

function fatorPressao(){
  return { facil:0.7, normal:1, dificil:1.3, extremo:1.6 }[Game.club.dificuldade] ?? 1;
}
function ganharReputacao(qtd){ Game.club.reputacao = clamp(Game.club.reputacao + qtd, 0, 100); }

function atualizarTabela(jogo){
  const t = Game.world.tabela;
  const m = t[jogo.mandanteId], v = t[jogo.visitanteId];
  if (!m || !v) return;
  m.j++; v.j++;
  m.gp += jogo.golsMandante; m.gc += jogo.golsVisitante;
  v.gp += jogo.golsVisitante; v.gc += jogo.golsMandante;

  if (jogo.golsMandante > jogo.golsVisitante){ m.v++; m.pontos += 3; v.d++; }
  else if (jogo.golsMandante < jogo.golsVisitante){ v.v++; v.pontos += 3; m.d++; }
  else { m.e++; v.e++; m.pontos++; v.pontos++; }

  if (jogo.mandanteId === 'player' || jogo.visitanteId === 'player'){
    const ehMandante = jogo.mandanteId === 'player';
    const golsPro = ehMandante ? jogo.golsMandante : jogo.golsVisitante;
    const golsContra = ehMandante ? jogo.golsVisitante : jogo.golsMandante;
    const stats = Game.club.estatisticasCarreira;
    const pressao = fatorPressao();
    stats.golsMarcados += golsPro; stats.golsSofridos += golsContra;
    if (golsPro > golsContra){
      stats.vitorias++; stats.sequenciaInvicta++; Game.club.addNoticia(`Vitória por ${golsPro}x${golsContra}!`, '✅');
      Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria + Math.round(3 / pressao), 0, 100);
      Game.club.popularidade = clamp(Game.club.popularidade + 1, 0, 100);
    } else if (golsPro < golsContra){
      stats.derrotas++; stats.sequenciaInvicta = 0; Game.club.addNoticia(`Derrota por ${golsContra}x${golsPro}.`, '❌');
      Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria - Math.round(5 * pressao), 0, 100);
      Game.club.popularidade = clamp(Game.club.popularidade - 1, 0, 100);
    } else {
      stats.empates++; stats.sequenciaInvicta++; Game.club.addNoticia(`Empate em ${golsPro}x${golsContra}.`, '➖');
      Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria - Math.round(1 * pressao), 0, 100);
    }
    stats.maiorSequenciaInvicta = Math.max(stats.maiorSequenciaInvicta, stats.sequenciaInvicta);
  }
}

function ordenarTabela(){
  const t = Game.world.tabela;
  return Object.keys(t)
    .map(id => ({ id, ...t[id], nome: getClubeInfo(id).nome, escudoId: getClubeInfo(id).escudoId }))
    .sort((a,b) => b.pontos - a.pontos || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp);
}

function simularJogosDaRodada(){
  const w = Game.world;
  const jogosRodada = w.calendario.filter(j => j.rodada === w.rodadaAtual && !j.jogado);
  const bonusStaff = Game.club.comissao.auxiliar ? 1.03 : 1;

  return jogosRodada.map(jogo => {
    const squadM = getSquad(jogo.mandanteId), squadV = getSquad(jogo.visitanteId);
    const xiM = jogo.mandanteId === 'player' ? getXIDoJogador() : bestXI(squadM);
    const xiV = jogo.visitanteId === 'player' ? getXIDoJogador() : bestXI(squadV);
    const tatM = jogo.mandanteId === 'player' ? Game.club.tatica : taticaNeutra();
    const tatV = jogo.visitanteId === 'player' ? Game.club.tatica : taticaNeutra();
    const res = simulateMatch(
      { xi: xiM, tatica: tatM, bonus: jogo.mandanteId === 'player' ? bonusStaff : 1 },
      { xi: xiV, tatica: tatV, bonus: jogo.visitanteId === 'player' ? bonusStaff : 1 }
    );
    return { jogo, res };
  });
}

function commitRodada(simulados){
  const w = Game.world;
  let resultadoJogador = null;

  if (!Game.club.desafioSemanal) Game.club.desafioSemanal = { ...pick(DESAFIOS_SEMANAIS), concluido: false };

  simulados.forEach(({ jogo, res }) => {
    Object.assign(jogo, { golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, eventos: res.eventos, estatisticas: res.estatisticas, jogado: true });
    atualizarTabela(jogo);

    if (jogo.mandanteId === 'player' || jogo.visitanteId === 'player'){
      resultadoJogador = jogo;
      const ehMandante = jogo.mandanteId === 'player';
      const golsPro = ehMandante ? jogo.golsMandante : jogo.golsVisitante;
      const golsContra = ehMandante ? jogo.golsVisitante : jogo.golsMandante;
      const adversarioId = ehMandante ? jogo.visitanteId : jogo.mandanteId;

      if (Game.club.rivalId && adversarioId === Game.club.rivalId){
        if (golsPro > golsContra){
          Game.club.estatisticasCarreira.vitoriasClassico++;
          Game.club.moralElenco = clamp(Game.club.moralElenco + 8, 0, 100);
          ganharReputacao(3);
          Game.club.addNoticia(`Vencemos o clássico contra ${getClubeInfo(Game.club.rivalId).nome}! 🔥`, '⚔️');
        } else if (golsPro < golsContra){
          Game.club.moralElenco = clamp(Game.club.moralElenco - 8, 0, 100);
          Game.club.addNoticia(`Perdemos o clássico para ${getClubeInfo(Game.club.rivalId).nome}...`, '⚔️');
        }
      }

      if (Game.club.desafioSemanal && !Game.club.desafioSemanal.concluido){
        const desafioDef = DESAFIOS_SEMANAIS.find(d => d.id === Game.club.desafioSemanal.id);
        if (desafioDef && desafioDef.checar(golsPro, golsContra)){
          Game.club.desafioSemanal.concluido = true;
          Game.club.orcamento += Game.club.desafioSemanal.recompensa;
          Game.club.estatisticasCarreira.desafiosCompletos++;
          Game.club.addNoticia(`Desafio da semana concluído: ${Game.club.desafioSemanal.desc} (+${formatMoney(Game.club.desafioSemanal.recompensa)})`, '🎯');
        }
      }
    }
  });

  w.ultimoResultadoJogador = resultadoJogador;
  w.rodadaAtual++;
  Game.club.treinoFeitoRodada = 0;
  Game.club.desafioSemanal = null;

  processarLesoes();
  processarFinancasMensal();
  rolarEventoAleatorio();
  verificarConquistas();

  let fimDeTemporada = false;
  if (w.rodadaAtual > w.totalRodadas){ finalizarTemporada(); fimDeTemporada = true; }

  const demitido = !fimDeTemporada && Game.club.confiancaDiretoria <= 0;
  if (demitido) Game.club.addNoticia(`A diretoria do ${Game.club.nome} perdeu a paciência com os resultados.`, '📉');

  Game.save();
  return { resultadoJogador, fimDeTemporada, demitido };
}

function simularRodada(){
  return commitRodada(simularJogosDaRodada());
}

function processarLesoes(){
  const recuperacao = Game.club.comissao.preparadorFisico ? 2 : 1;
  Game.club.jogadores.forEach(j => {
    j.lesoes.forEach(l => l.rodadasRestantes = Math.max(0, l.rodadasRestantes - recuperacao));
    j.lesoes = j.lesoes.filter(l => l.rodadasRestantes > 0);
    j.fadiga = clamp(j.fadiga - 6, 0, 100);
    if (j.emprestado){
      j.rodadasEmprestimoRestantes--;
      if (j.rodadasEmprestimoRestantes <= 0){ j.emprestado = false; j.clubeEmprestimoNome = null; Game.club.addNoticia(`${j.nomeCompleto} retornou de empréstimo.`, '↩️'); }
    }
  });

  if (Game.club._pedidoTransferencia){
    Game.club._pedidoTransferencia.prazoRodadas--;
    if (Game.club._pedidoTransferencia.prazoRodadas <= 0) Game.club._pedidoTransferencia = null;
  }

  const lideres = Game.club.jogadores.filter(j => j.personalidade === 'Líder Nato').length;
  if (lideres > 0) Game.club.moralElenco = clamp(Game.club.moralElenco + lideres, 0, 100);
}

/* =====================================================================
   8. FINANÇAS / PATROCINADORES
   ===================================================================== */

function processarFinancasMensal(){
  const c = Game.club;
  const capacidade = c.estadio.capacidade;
  const bonusEstadio = (c.estadio.loja?0.08:0) + (c.estadio.restaurante?0.06:0) + (c.estadio.estacionamento?0.05:0) + (c.estadio.museu?0.04:0);
  const publico = Math.round(capacidade * clamp(0.4 + (c.moralElenco-50)/180 + (c.popularidade-50)/180, 0.15, 0.98) * (1 + (c.estadio._bonusTemporario||0)));
  const ingressos = Math.round(publico * 45 * (1+bonusEstadio));
  const loja = c.estadio.loja ? rnd(20_000, 90_000) : rnd(4_000, 15_000);
  const tv = rnd(120_000, 320_000);
  const premiacao = 0;
  const patrocinio = c.sponsor ? c.sponsor.valorMensal : 0;

  if (publico > c.recordes.maiorPublico) c.recordes.maiorPublico = publico;

  const salarios = c.folhaSalarial;
  const custoComissao = (c.comissao.auxiliar ? STAFF_DEFS.auxiliar.custoMensal : 0)
    + (c.comissao.preparadorFisico ? STAFF_DEFS.preparadorFisico.custoMensal : 0)
    + (c.comissao.olheiroChefe ? STAFF_DEFS.olheiroChefe.custoMensal : 0);
  const impostos = Math.round((ingressos + loja + tv + patrocinio) * 0.12);
  const manutencao = Math.round(20_000 + capacidade * 2.2);

  const receitaTotal = ingressos + loja + tv + patrocinio + premiacao;
  const despesaTotal = salarios + impostos + manutencao + custoComissao;

  c.financas.receitas.push({ periodo: c.temporada + '-' + Game.world.rodadaAtual, ingressos, loja, tv, patrocinio, premiacao, total: receitaTotal });
  c.financas.despesas.push({ periodo: c.temporada + '-' + Game.world.rodadaAtual, salarios, impostos, manutencao, comissao: custoComissao, total: despesaTotal });
  if (c.financas.receitas.length > 24) c.financas.receitas.shift();
  if (c.financas.despesas.length > 24) c.financas.despesas.shift();

  c.orcamento += (receitaTotal - despesaTotal);
  c.estadio._bonusTemporario = 0;
  if (c.orcamento > c.recordes.maiorOrcamento) c.recordes.maiorOrcamento = c.orcamento;

  // Crise financeira: caixa negativo por muitos períodos seguidos força um corte salarial.
  if (c.orcamento < 0){
    c.mesesOrcamentoNegativo = (c.mesesOrcamentoNegativo || 0) + 1;
    if (c.mesesOrcamentoNegativo >= 3){
      c.jogadores.forEach(j => j.salario = Math.round(j.salario * 0.85));
      c.moralElenco = clamp(c.moralElenco - 10, 0, 100);
      c.addNoticia('Crise financeira! A diretoria decretou um corte de 15% nos salários do elenco.', '🚨');
      c.mesesOrcamentoNegativo = 0;
    }
  } else {
    c.mesesOrcamentoNegativo = 0;
  }

  // Salário pessoal do técnico: um fixo por reputação + uma fatia da receita da loja (e um pouco do resto).
  const salarioTreinador = Math.round(c.salarioTreinadorBase * (1 + c.reputacao/100) + loja * 0.2 + receitaTotal * 0.01);
  c.patrimonioTreinador += salarioTreinador;
  c._ultimoSalarioTreinador = salarioTreinador;

  if (c.sponsor){
    c.sponsor.rodadasRestantes--;
    if (c.sponsor.rodadasRestantes <= 0){ c.addNoticia(`O contrato com o patrocinador ${c.sponsor.nome} chegou ao fim.`, '📄'); c.sponsor = null; Game.world.sponsorOfertasDisponiveis = gerarOfertasPatrocinio(); }
  }
}

function aceitarPatrocinio(ofertaId){
  const oferta = Game.world.sponsorOfertasDisponiveis.find(o => o.id === ofertaId);
  if (!oferta) return;
  Game.club.sponsor = { nome: oferta.nome, valorMensal: oferta.valorMensal, rodadasRestantes: oferta.duracaoTemporadas * 4 };
  Game.club.addNoticia(`Novo patrocínio master fechado com ${oferta.nome}.`, '🤝');
  Game.world.sponsorOfertasDisponiveis = gerarOfertasPatrocinio();
  UI.toast(`Patrocínio com ${oferta.nome} fechado!`, 'ok');
  Game.save();
}

/* =====================================================================
   8b. COMISSÃO TÉCNICA / RIVAL / PEDIDOS DE TRANSFERÊNCIA / IMPRENSA
   ===================================================================== */

function contratarStaff(tipo){
  if (!STAFF_DEFS[tipo]) return;
  if (Game.club.comissao[tipo]) return UI.toast('Você já contratou esse profissional.', 'warn');
  Game.club.comissao[tipo] = true;
  Game.club.addNoticia(`${STAFF_DEFS[tipo].nome} contratado para a comissão técnica.`, STAFF_DEFS[tipo].icon);
  UI.toast(`${STAFF_DEFS[tipo].nome} contratado!`, 'ok');
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('treinamento');
}
function demitirStaff(tipo){
  if (!Game.club.comissao[tipo]) return;
  Game.club.comissao[tipo] = false;
  Game.club.addNoticia(`${STAFF_DEFS[tipo].nome} deixou a comissão técnica.`, '👋');
  Game.save();
  UI.renderAppScreen('treinamento');
}

function escolherRival(clubId){
  Game.club.rivalId = clubId || null;
  Game.club.addNoticia(clubId ? `${getClubeInfo(clubId).nome} agora é seu clássico rival!` : 'Rivalidade removida.', '⚔️');
  Game.save();
  UI.renderAppScreen('competicoes');
}

function liberarPedidoTransferencia(){
  const req = Game.club._pedidoTransferencia;
  if (!req) return;
  const jog = Game.club.jogadores.find(p => p.id === req.jogadorId);
  if (jog){
    Game.club.jogadores = Game.club.jogadores.filter(p => p.id !== jog.id);
    const destino = pick(Game.world.clubes.filter(c => !c.isPlayer));
    if (destino) destino.squadRef.push(jog);
    Game.club.addNoticia(`${jog.nomeCompleto} foi liberado sem custos, a pedido próprio.`, '🚪');
    UI.toast(`${jog.nomeCompleto} liberado.`, 'ok');
  }
  Game.club._pedidoTransferencia = null;
  Game.save();
  UI.renderAppScreen('elenco');
}
function recusarPedidoTransferencia(){
  const req = Game.club._pedidoTransferencia;
  if (!req) return;
  const jog = Game.club.jogadores.find(p => p.id === req.jogadorId);
  if (jog){
    jog.moral = clamp(jog.moral - 15, 0, 100);
    Game.club.moralElenco = clamp(Game.club.moralElenco - 3, 0, 100);
    Game.club.addNoticia(`Pedido de saída de ${jog.nomeCompleto} foi recusado.`, '🚫');
    UI.toast('Pedido recusado. A moral do elenco pode ser afetada.', 'warn');
  }
  Game.club._pedidoTransferencia = null;
  Game.save();
  UI.renderAppScreen('elenco');
}

function gerarManchete(){
  const c = Game.club;
  const ultima = c.noticias[0];
  if (!ultima) return `"Uma nova era começa no ${c.nome}"`;
  if (/CAMPEÃO|Conquista desbloqueada/.test(ultima.texto)) return `"HISTÓRIA! ${c.nome.toUpperCase()} NAS ALTURAS"`;
  if (/Vitória|clássico contra/.test(ultima.texto)) return `"${c.nome.toUpperCase()} IMPÕE RESPEITO EM CAMPO"`;
  if (/Derrota|demitido|Crise/.test(ultima.texto)) return `"${c.nome.toUpperCase()} VIVE MOMENTO DE PRESSÃO"`;
  if (/pediu para deixar|pediu/.test(ultima.texto)) return `"BASTIDORES AGITADOS NO ${c.nome.toUpperCase()}"`;
  return `"${c.nome.toUpperCase()} SEGUE NA LUTA PELA ${nomeLiga().toUpperCase()}"`;
}

function entrevistaPosJogo(tipo){
  const w = Game.world;
  if (Game.club._entrevistaFeitaRodada === w.rodadaAtual) return;
  Game.club._entrevistaFeitaRodada = w.rodadaAtual;
  if (tipo === 'elogiar'){
    Game.club.moralElenco = clamp(Game.club.moralElenco + 4, 0, 100);
    if (Math.random() < 0.3) ganharReputacao(1);
    UI.toast('Você elogiou o elenco na entrevista. Moral em alta!', 'ok');
  } else if (tipo === 'cobrar'){
    Game.club.moralElenco = clamp(Game.club.moralElenco - 3, 0, 100);
    Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria + 3, 0, 100);
    UI.toast('Você cobrou mais do elenco. A diretoria valorizou a ambição.', 'ok');
  } else {
    Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria + 2, 0, 100);
    Game.club.moralElenco = clamp(Game.club.moralElenco + 1, 0, 100);
    UI.toast('Uma resposta equilibrada e humilde.', 'ok');
  }
  Game.save();
}

/* =====================================================================
   8c. MINI-JOGO: COBRANÇA DECISIVA (60 segundos, cliques nas zonas do gol)
   ===================================================================== */

const MiniGame = { ativo:false, score:0, tentativas:0, tempoRestante:60, timer:null, premioPorGol:15_000 };

function abrirMiniJogoPenalti(){
  MiniGame.ativo = false; MiniGame.score = 0; MiniGame.tentativas = 0; MiniGame.tempoRestante = 60;
  UI.openModal(`
    <div class="modal-head"><h3>🎮 Cobrança Decisiva — Desafio do Patrocinador</h3><button class="btn-ghost" data-close-modal>✕</button></div>
    <p class="step-sub">Você tem 60 segundos. Clique nas zonas do gol pra chutar — cada gol vale ${formatMoney(MiniGame.premioPorGol)} de bônus pro clube!</p>
    <button class="btn-primary" style="margin-top:16px; width:100%;" data-action="comecar-minijogo">Começar (60s)</button>`, true);
}

function comecarMiniJogoPenalti(){
  MiniGame.ativo = true; MiniGame.score = 0; MiniGame.tentativas = 0; MiniGame.tempoRestante = 60;
  UI.renderMiniJogoView();
  clearInterval(MiniGame.timer);
  MiniGame.timer = setInterval(() => {
    if (!document.querySelector('#active-modal')){ clearInterval(MiniGame.timer); MiniGame.ativo = false; return; }
    MiniGame.tempoRestante--;
    if (MiniGame.tempoRestante <= 0){ clearInterval(MiniGame.timer); finalizarMiniJogoPenalti(); }
    else UI.renderMiniJogoView();
  }, 1000);
}

function chutarPenalti(zona){
  if (!MiniGame.ativo) return;
  MiniGame.tentativas++;
  const defesaGoleiro = rnd(1, 5);
  const golMarcado = defesaGoleiro !== zona;
  if (golMarcado) MiniGame.score++;
  UI.renderMiniJogoView(zona, golMarcado);
}

function finalizarMiniJogoPenalti(){
  MiniGame.ativo = false;
  const premio = MiniGame.score * MiniGame.premioPorGol;
  Game.club.orcamento += premio;
  Game.club.addNoticia(`Desafio do patrocinador: ${MiniGame.score} gols em ${MiniGame.tentativas} cobranças no mini-jogo! +${formatMoney(premio)}.`, '🎮');
  Game.save();
  UI.renderMiniJogoResultado(premio);
}

/* =====================================================================
   9. MERCADO DE TRANSFERÊNCIAS
   ===================================================================== */

function listarMercado(){
  const lista = [];
  Game.world.clubes.filter(c => !c.isPlayer).forEach(c => {
    c.squadRef.forEach(p => lista.push({ player: p, origemId: c.id, origemNome: c.nome, livre: false }));
  });
  Game.world.freeAgents.forEach(p => lista.push({ player: p, origemId: null, origemNome: 'Agente Livre', livre: true }));
  return lista;
}

function comprarJogador(playerId, origemId){
  const custoLuvas = 0.15;
  if (origemId === null){
    const idx = Game.world.freeAgents.findIndex(p => p.id === playerId);
    if (idx === -1) return UI.toast('Jogador indisponível.', 'warn');
    const jogador = Game.world.freeAgents[idx];
    const custo = Math.round(jogador.valorMercado * custoLuvas);
    if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente para pagar as luvas.', 'danger');
    Game.world.freeAgents.splice(idx, 1);
    Game.club.orcamento -= custo;
    Game.club.jogadores.push(jogador);
    assignNumeros(Game.club.jogadores);
    Game.club.estatisticasCarreira.gastoTransferencias += custo;
    Game.club.addNoticia(`${jogador.nomeCompleto} assinou como agente livre.`, '✍️');
    UI.toast(`${jogador.nomeCompleto} contratado!`, 'ok');
  } else {
    const clube = Game.world.clubes.find(c => c.id === origemId);
    if (!clube) return;
    const idx = clube.squadRef.findIndex(p => p.id === playerId);
    if (idx === -1) return UI.toast('Jogador indisponível.', 'warn');
    const jogador = clube.squadRef[idx];
    const pedido = Math.round(jogador.valorMercado * (0.95 + Math.random()*0.35));
    if (Game.club.orcamento < pedido) return UI.toast(`${clube.nome} pede ${formatMoney(pedido)}. Orçamento insuficiente.`, 'danger');
    if (!confirm(`${clube.nome} aceita vender ${jogador.nomeCompleto} por ${formatMoney(pedido)}. Confirmar proposta?`)) return;
    clube.squadRef.splice(idx, 1);
    Game.club.orcamento -= pedido;
    clube.orcamento += pedido;
    Game.club.jogadores.push(jogador);
    assignNumeros(Game.club.jogadores);
    Game.club.estatisticasCarreira.gastoTransferencias += pedido;
    Game.club.addNoticia(`${jogador.nomeCompleto} contratado junto ao ${clube.nome} por ${formatMoney(pedido)}.`, '✍️');
    UI.toast(`${jogador.nomeCompleto} contratado por ${formatMoney(pedido)}!`, 'ok');
  }
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('mercado');
}

function venderJogador(playerId){
  const idx = Game.club.jogadores.findIndex(p => p.id === playerId);
  if (idx === -1) return;
  const jogador = Game.club.jogadores[idx];
  if (Game.club.jogadores.length <= 12) return UI.toast('Você precisa manter pelo menos 12 jogadores no elenco.', 'warn');
  const oferta = Math.round(jogador.valorMercado * (0.8 + Math.random()*0.25));
  const comissaoAgente = Math.round(oferta * 0.08);
  const liquido = oferta - comissaoAgente;
  if (!confirm(`Vender ${jogador.nomeCompleto} por ${formatMoney(oferta)}? (o agente cobra ${formatMoney(comissaoAgente)} de comissão, líquido de ${formatMoney(liquido)})`)) return;
  Game.club.jogadores.splice(idx, 1);
  Game.club.orcamento += liquido;
  Game.club.estatisticasCarreira.receitaTransferencias += liquido;
  const destino = pick(Game.world.clubes.filter(c => !c.isPlayer));
  if (destino) destino.squadRef.push(jogador);
  Game.club.addNoticia(`${jogador.nomeCompleto} foi vendido por ${formatMoney(oferta)} (líquido ${formatMoney(liquido)} após comissão do agente).`, '💸');
  UI.toast(`${jogador.nomeCompleto} vendido! Líquido: ${formatMoney(liquido)}.`, 'ok');
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('elenco');
}

function emprestarJogador(playerId){
  const jogador = Game.club.jogadores.find(p => p.id === playerId);
  if (!jogador) return;
  if (jogador.emprestado) return UI.toast('Este jogador já está emprestado.', 'warn');
  jogador.emprestado = true;
  jogador.clubeEmprestimoNome = pick(gerarNomesClubesPais(Game.club.pais, 10));
  jogador.rodadasEmprestimoRestantes = rnd(4, 10);
  Game.club.addNoticia(`${jogador.nomeCompleto} foi emprestado ao ${jogador.clubeEmprestimoNome}.`, '📤');
  UI.toast(`${jogador.nomeCompleto} emprestado.`, 'ok');
  Game.save();
  UI.renderAppScreen('elenco');
}

function renovarContrato(playerId){
  const jogador = Game.club.jogadores.find(p => p.id === playerId);
  if (!jogador) return;
  if (jogador.contrato > 2) return UI.toast('Este jogador ainda tem contrato longo.', 'warn');
  const custo = Math.round(jogador.valorMercado * 0.08);
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente para a renovação.', 'danger');
  if (!confirm(`Renovar contrato de ${jogador.nomeCompleto} por ${formatMoney(custo)} em luvas? O salário será reajustado.`)) return;
  Game.club.orcamento -= custo;
  jogador.contrato = clamp(jogador.contrato + rnd(2,4), 1, 6);
  jogador.salario = Math.round(jogador.salario * (1.1 + Math.random()*0.15));
  jogador.moral = clamp(jogador.moral + 10, 0, 100);
  Game.club.addNoticia(`${jogador.nomeCompleto} renovou contrato até ${jogador.contrato} ano(s).`, '📝');
  UI.toast('Contrato renovado!', 'ok');
  Game.save();
  UI.renderAppScreen('elenco');
}

function darLanceLeilao(valor){
  const leilao = Game.world.leilaoAtual;
  if (!leilao || leilao.encerrada) return;
  const jogador = Game.world.freeAgents.find(p => p.id === leilao.jogadorId);
  if (!jogador) return;
  if (valor < leilao.lanceMinimo) return UI.toast(`O lance mínimo é ${formatMoney(leilao.lanceMinimo)}.`, 'warn');
  if (valor > Game.club.orcamento) return UI.toast('Orçamento insuficiente para este lance.', 'danger');

  const lanceRival = Math.round(leilao.lanceMinimo * (0.9 + Math.random() * 0.5));
  leilao.encerrada = true;
  if (valor >= lanceRival){
    Game.club.orcamento -= valor;
    Game.world.freeAgents = Game.world.freeAgents.filter(p => p.id !== jogador.id);
    Game.club.jogadores.push(jogador);
    assignNumeros(Game.club.jogadores);
    Game.club.estatisticasCarreira.gastoTransferencias += valor;
    Game.club.addNoticia(`Leilão vencido! ${jogador.nomeCompleto} está no elenco por ${formatMoney(valor)}.`, '🔨');
    UI.toast(`Você venceu o leilão por ${jogador.nomeCompleto}!`, 'ok');
  } else {
    Game.club.addNoticia(`Você perdeu o leilão por ${jogador.nomeCompleto} para um rival (lance de ${formatMoney(lanceRival)}).`, '🔨');
    UI.toast(`Você perdeu o leilão. Lance rival: ${formatMoney(lanceRival)}.`, 'danger');
  }
  Game.world.leilaoAtual = gerarLeilaoSemanal(Game.world.freeAgents);
  Game.save();
  UI.renderAppScreen('mercado');
}

/* =====================================================================
   10. TREINAMENTO
   ===================================================================== */

function treinarElenco(tipoId){
  if (Game.club.treinoFeitoRodada === Game.world.rodadaAtual) return UI.toast('O elenco já treinou nesta rodada.', 'warn');
  const tipo = TRAINING_TYPES.find(t => t.id === tipoId);
  if (!tipo) return;
  const bonusCT = Game.club.centroTreinamento.nivel - 1;
  const fatorFadiga = Game.club.comissao.preparadorFisico ? 0.8 : 1;
  Game.club.jogadores.forEach(j => {
    if (j.emprestado) return;
    j.atributos[tipo.attr] = clamp(j.atributos[tipo.attr] + rnd(1,3) + bonusCT, 1, Math.min(99, j.potencial + 3));
    j.fadiga = clamp(j.fadiga + Math.round(rnd(8,15) * fatorFadiga), 0, 100);
    j.recalcularOverall();
  });
  Game.club.treinoFeitoRodada = Game.world.rodadaAtual;
  Game.club.addNoticia(`Sessão de treino de ${tipo.nome} concluída.`, '🏋️');
  UI.toast(`Treino de ${tipo.nome} concluído!`, 'ok');
  Game.save();
  UI.renderAppScreen('treinamento');
}

function descansarElenco(){
  Game.club.jogadores.forEach(j => { j.fadiga = clamp(j.fadiga - 25, 0, 100); j.moral = clamp(j.moral + 4, 0, 100); });
  Game.club.addNoticia('O elenco teve um dia de folga para recuperação física.', '🧘');
  UI.toast('Elenco descansado.', 'ok');
  Game.save();
  UI.renderAppScreen('treinamento');
}

/* =====================================================================
   11. ESTÁDIO
   ===================================================================== */

function melhorarEstadio(upgradeId){
  const def = STADIUM_UPGRADES.find(u => u.id === upgradeId);
  if (!def) return;
  if (def.requerHallDaFama && !Game.club.hallDaFama.length) return UI.toast('Você precisa de um ídolo aposentado no Hall da Fama primeiro.', 'warn');
  if (Game.club.orcamento < def.custo) return UI.toast('Orçamento insuficiente para esta melhoria.', 'danger');

  if (def.tipo === 'flag'){
    if (Game.club.estadio[def.id]) return UI.toast('Melhoria já adquirida.', 'warn');
    Game.club.estadio[def.id] = true;
  } else {
    const nivelKey = 'nivel' + def.id[0].toUpperCase() + def.id.slice(1);
    Game.club.estadio[nivelKey] = clamp((Game.club.estadio[nivelKey]||1) + 1, 1, def.max);
    if (def.id === 'arquibancada') Game.club.estadio.capacidade += 2200;
  }
  Game.club.orcamento -= def.custo;
  Game.club.addNoticia(`Estádio recebeu melhoria: ${def.nome}.`, '🏗️');
  UI.toast(`${def.nome} concluído(a)!`, 'ok');
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('estadio');
}

function venderNamingRights(){
  if (Game.club.estadio.namingVendido) return UI.toast('Você já vendeu o naming rights nesta gestão.', 'warn');
  const patrocinador = pick(SPONSOR_NAMES);
  const valor = rnd(2_000_000, 6_000_000);
  Game.club.orcamento += valor;
  Game.club.estadio.nome = `Arena ${patrocinador}`;
  Game.club.estadio.namingVendido = true;
  Game.club.addNoticia(`Naming rights vendido para ${patrocinador} por ${formatMoney(valor)}! O estádio agora se chama Arena ${patrocinador}.`, '🏷️');
  UI.toast(`Naming rights vendido por ${formatMoney(valor)}!`, 'ok');
  Game.save();
  UI.renderAppScreen('estadio');
}

/* =====================================================================
   12. ACADEMIA DE BASE
   ===================================================================== */

function buscarTalentos(){
  const custo = 150_000 * Game.club.academia.nivel;
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente para a busca por talentos.', 'danger');
  Game.club.orcamento -= custo;
  const qtd = rnd(1,3);
  const paisFoco = Game.club.olheiroFocoPais || Game.club.pais;
  for (let i=0;i<qtd;i++){
    const potMin = 55 + Game.club.academia.nivel * 5 + (Game.club.comissao.olheiroChefe ? 5 : 0) + (Game.club.academia.alojamento ? 4 : 0);
    const jovem = new Player(pick(POSITIONS).id, { idade: rnd(15,18), potencial: clamp(rnd(potMin, 99), 55, 99), paisPreferencial: paisFoco });
    Game.club.youthPlayers.push(jovem);
    if (jovem.potencial >= 90) Game.club.addNoticia(`Um verdadeiro craque foi revelado na base: ${jovem.nomeCompleto}!`, '🌟');
  }
  Game.club.addNoticia(`A academia trouxe ${qtd} novo(s) talento(s).`, '🌱');
  UI.toast(`${qtd} jovem(ns) encontrado(s)!`, 'ok');
  Game.save();
  UI.renderAppScreen('academia');
}

function promoverJovem(playerId){
  const idx = Game.club.youthPlayers.findIndex(p => p.id === playerId);
  if (idx === -1) return;
  const jovem = Game.club.youthPlayers.splice(idx,1)[0];
  Game.club.jogadores.push(jovem);
  assignNumeros(Game.club.jogadores);
  Game.club.estatisticasCarreira.promovidosAcademia++;
  Game.club.addNoticia(`${jovem.nomeCompleto} foi promovido ao time principal!`, '⬆️');
  UI.toast(`${jovem.nomeCompleto} promovido ao elenco principal!`, 'ok');
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('academia');
}

function dispensarJovem(playerId){
  Game.club.youthPlayers = Game.club.youthPlayers.filter(p => p.id !== playerId);
  Game.save();
  UI.renderAppScreen('academia');
}

function melhorarAcademia(){
  const custo = 1_000_000 * Game.club.academia.nivel;
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente.', 'danger');
  Game.club.orcamento -= custo;
  Game.club.academia.nivel++;
  Game.club.addNoticia(`Academia de base evoluiu para o nível ${Game.club.academia.nivel}.`, '🌱');
  UI.toast('Academia aprimorada!', 'ok');
  Game.save();
  UI.renderAppScreen('academia');
}

function contratarEmbaixador(){
  if (Game.club.embaixador) return UI.toast('Você já tem um embaixador do clube.', 'warn');
  const custo = 2_000_000;
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente para contratar um embaixador.', 'danger');
  Game.club.orcamento -= custo;
  Game.club.embaixador = pick(EMBAIXADOR_NOMES);
  Game.club.popularidade = clamp(Game.club.popularidade + 12, 0, 100);
  Game.world.sponsorOfertasDisponiveis = gerarOfertasPatrocinio();
  Game.club.addNoticia(`${Game.club.embaixador} agora é o embaixador oficial do clube! Propostas de patrocínio ficaram mais atrativas.`, '🌟');
  UI.toast(`${Game.club.embaixador} contratado como embaixador!`, 'ok');
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('estadio');
}

function melhorarCentroTreinamento(){
  const custo = 800_000 * Game.club.centroTreinamento.nivel;
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente.', 'danger');
  Game.club.orcamento -= custo;
  Game.club.centroTreinamento.nivel++;
  Game.club.addNoticia(`Centro de Treinamento evoluiu para o nível ${Game.club.centroTreinamento.nivel}.`, '🏋️');
  UI.toast('Centro de Treinamento aprimorado!', 'ok');
  Game.save();
  UI.renderAppScreen('treinamento');
}

function construirAlojamentoBase(){
  if (Game.club.academia.alojamento) return UI.toast('Alojamento já construído.', 'warn');
  const custo = 900_000;
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente.', 'danger');
  Game.club.orcamento -= custo;
  Game.club.academia.alojamento = true;
  Game.club.addNoticia('Alojamento da base construído! Os jovens talentos vão se desenvolver com mais consistência.', '🏠');
  UI.toast('Alojamento da base construído!', 'ok');
  Game.save();
  UI.renderAppScreen('academia');
}

function definirFocoOlheiro(pais){
  Game.club.olheiroFocoPais = pais || null;
  Game.club.addNoticia(pais ? `Olheiros agora focam a busca de talentos em ${pais}.` : 'Foco de observação removido.', '🔭');
  Game.save();
  UI.renderAppScreen('academia');
}

/* =====================================================================
   13. EVENTOS ALEATÓRIOS / CONQUISTAS
   ===================================================================== */

function rolarEventoAleatorio(){
  if (Math.random() > 0.35) return;
  const evento = pick(RANDOM_EVENTS);
  const texto = evento.aplicar(Game.club);
  if (texto){
    Game.club.addNoticia(texto, evento.icon);
    UI.toast(texto, 'warn');
  }
}

function verificarConquistas(){
  ACHIEVEMENTS.forEach(a => {
    if (Game.club.achievementsUnlocked.includes(a.id)) return;
    if (a.check(Game.club)){
      Game.club.achievementsUnlocked.push(a.id);
      Game.club.addNoticia(`Conquista desbloqueada: ${a.nome}!`, a.icon);
      UI.toast(`🏆 Conquista: ${a.nome}`, 'ok');
      UI.confetti(50);
      ganharReputacao(2);
    }
  });
}

/* =====================================================================
   14. TEMPORADAS / COPAS
   ===================================================================== */

function finalizarTemporada(){
  const w = Game.world;
  const tabelaFinal = ordenarTabela();
  const campeaoId = tabelaFinal[0]?.id;
  const posJogador = tabelaFinal.findIndex(t => t.id === 'player') + 1;
  const zonaRebaixamento = posJogador > tabelaFinal.length - 3;
  const zonaAcesso = posJogador <= 2;
  const estavaNaSerieB = w.divisaoAtual === 'B';

  if (!estavaNaSerieB){
    w.ultimoCampeaoLiga = campeaoId;
    if (campeaoId === 'player'){
      Game.club.conquistas.push({ tipo:'liga', nome:`Campeão ${nomeLiga()}`, temporada: Game.club.temporada });
      Game.club.addNoticia(`CAMPEÃO ${nomeLiga().toUpperCase()}! Uma temporada histórica.`, '🏆');
      ganharReputacao(15);
      if (Game.club.metaCarreira && !Game.club.metaCarreira.cumprida && Game.club.temporada <= Game.club.metaCarreira.temporadas){
        Game.club.metaCarreira.cumprida = true;
        Game.club.addNoticia(`Meta de carreira cumprida: ${Game.club.metaCarreira.desc}!`, '🎯');
        ganharReputacao(10);
      }
      UI.confetti(140);
    } else {
      Game.club.addNoticia(`Temporada encerrada em ${posJogador}º lugar na ${nomeLiga()}.`, '🏁');
      if (posJogador <= 4) ganharReputacao(5);
      if (zonaRebaixamento) ganharReputacao(-8);
    }
  } else {
    Game.club.addNoticia(`Temporada encerrada em ${posJogador}º lugar na ${nomeLigaAtual()}.`, '🏁');
  }

  // Prêmios da temporada
  const artilheiro = [...Game.club.jogadores].sort((a,b)=>b.golsTemporada-a.golsTemporada)[0];
  const melhorAtaqueId = tabelaFinal.reduce((best,c)=> c.gp > (best?.gp ?? -1) ? c : best, null)?.id;
  const melhorDefesaId = tabelaFinal.reduce((best,c)=> c.gc < (best?.gc ?? Infinity) ? c : best, null)?.id;
  if (!estavaNaSerieB && melhorAtaqueId === 'player') Game.club.premiosTemporada.push({ tipo:'melhor_ataque', temporada: Game.club.temporada });
  if (!estavaNaSerieB && melhorDefesaId === 'player') Game.club.premiosTemporada.push({ tipo:'melhor_defesa', temporada: Game.club.temporada });
  if (artilheiro && artilheiro.golsTemporada > 0) Game.club.addNoticia(`Artilheiro do clube na temporada: ${artilheiro.nomeCompleto} (${artilheiro.golsTemporada} gols).`, '🎯');
  const golsClubeTemporada = Game.club.jogadores.reduce((s,j) => s + j.golsTemporada, 0);
  if (golsClubeTemporada > Game.club.recordes.maisGolsTemporada) Game.club.recordes.maisGolsTemporada = golsClubeTemporada;

  // Envelhecimento e reset de stats de temporada
  Game.club.jogadores.forEach(j => { j.envelhecer(); j.resetarTemporada(); });
  w.freeAgents.forEach(j => j.envelhecer());
  w.clubes.filter(c=>!c.isPlayer).forEach(c => c.squadRef.forEach(j => { j.envelhecer(); j.resetarTemporada(); }));

  // Aposentadoria: jogadores veteranos se despedem e entram no Hall da Fama do clube.
  if (Game.club.jogadores.length > 14){
    const aposentados = Game.club.jogadores.filter(j => j.idade >= 36);
    aposentados.forEach(j => {
      Game.club.hallDaFama.push({ nome: j.nomeCompleto, posicao: j.posicao, golsClube: j.golsClube, assistenciasClube: j.assistenciasClube });
      Game.club.addNoticia(`${j.nomeCompleto} anunciou aposentadoria após a temporada, com ${j.golsClube} gols pelo clube. Um ídolo se vai!`, '🎉');
    });
    if (aposentados.length) Game.club.jogadores = Game.club.jogadores.filter(j => j.idade < 36);
  }

  // --- ACESSO / REBAIXAMENTO DO JOGADOR ---
  let trocouDivisao = false;
  if (!estavaNaSerieB && zonaRebaixamento){
    // Rebaixado: guarda a Série A atual e assume (ou gera) a Série B.
    w.reservaSerieA = w.clubes.filter(c => !c.isPlayer);
    const serieB = w.reservaSerieB || shuffle(gerarNomesClubesPais(Game.club.pais, 19)).map(nome => gerarClubeIA(nome, Game.club.pais, true));
    w.clubes = [{ id:'player', nome: Game.club.nome, isPlayer:true, squadRef:null }, ...serieB];
    w.divisaoAtual = 'B';
    w.reservaSerieB = null;
    Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria - 20, 0, 100);
    ganharReputacao(-12);
    Game.club.estatisticasCarreira.rebaixamentos = (Game.club.estatisticasCarreira.rebaixamentos || 0) + 1;
    Game.club.addNoticia(`REBAIXADO! O ${Game.club.nome} caiu para a ${nomeLiga()} - Série B.`, '📉');
    trocouDivisao = true;
  } else if (estavaNaSerieB && zonaAcesso){
    // Acesso: guarda a Série B atual e retoma (ou gera) a Série A.
    w.reservaSerieB = w.clubes.filter(c => !c.isPlayer);
    const serieA = w.reservaSerieA || shuffle(gerarNomesClubesPais(Game.club.pais, 19)).map(nome => gerarClubeIA(nome, Game.club.pais));
    w.clubes = [{ id:'player', nome: Game.club.nome, isPlayer:true, squadRef:null }, ...serieA];
    w.divisaoAtual = 'A';
    w.reservaSerieA = null;
    Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria + 15, 0, 100);
    ganharReputacao(15);
    Game.club.conquistas.push({ tipo:'acesso', nome:`Acesso à ${nomeLiga()}`, temporada: Game.club.temporada });
    Game.club.estatisticasCarreira.acessos = (Game.club.estatisticasCarreira.acessos || 0) + 1;
    Game.club.addNoticia(`ACESSO GARANTIDO! O ${Game.club.nome} volta para a ${nomeLiga()}!`, '🎉');
    UI.confetti(140);
    trocouDivisao = true;
  }

  // Renovação dos 3 clubes mais fracos da divisão atual (fluxo de rotatividade), pulando quem já trocou de divisão.
  if (!trocouDivisao){
    const fracos = tabelaFinal.filter(t => t.id !== 'player').sort((a,b)=>a.pontos-b.pontos).slice(0,3);
    fracos.forEach(f => {
      const clube = w.clubes.find(c => c.id === f.id);
      if (clube){ clube.squadRef = SQUAD_TEMPLATE_AI.map(pos => new Player(pos, { paisPreferencial: clube.pais })); assignNumeros(clube.squadRef); clube.recemPromovido = true; }
    });
  }

  // Reset de temporada
  Game.club.temporada++;
  w.tabela = {};
  w.clubes.forEach(c => w.tabela[c.id] = { pontos:0, v:0, e:0, d:0, gp:0, gc:0, j:0 });
  w.calendario = gerarCalendario(w.clubes.map(c => c.id));
  w.rodadaAtual = 1;
  w.totalRodadas = Math.max(...w.calendario.map(j => j.rodada));
  w.copa = null; w.supercopa = null; w.internacional = null; w.copaDoMundoSelecoes = null;
  Game.club.confiancaDiretoria = clamp(Game.club.confiancaDiretoria + 20, 40, 100);

  Game.club.historico.push({ ano: Game.club.fundadoEm + Game.club.temporada - 1, evento: campeaoId === 'player' ? `Campeão ${nomeLiga()}` : `${posJogador}º lugar na ${estavaNaSerieB ? nomeLiga()+' - Série B' : nomeLiga()}` });

  verificarConquistas();
}

/* --- Demissão / Contratação por novo clube --- */
function contratarNovoClube(nomeClube, pais){
  const antigo = Game.club;
  const carreira = {
    reputacao: Math.max(10, antigo.reputacao - 8),
    patrimonioTreinador: antigo.patrimonioTreinador,
    achievementsUnlocked: antigo.achievementsUnlocked,
    conquistas: antigo.conquistas,
    estatisticasCarreira: antigo.estatisticasCarreira,
    historico: antigo.historico,
    historicoClubes: [...(antigo.historicoClubes||[]), { nome: nomeClube, desde: antigo.temporada + 1 }],
    temporada: antigo.temporada,
    treinador: antigo.treinador,
    dificuldade: antigo.dificuldade,
    selecao: antigo.selecao,
  };

  const cfg = {
    nome: nomeClube, cidade: `Sede de ${nomeClube}`, pais,
    escudoId: rnd(0, CREST_DEFS.length - 1),
    kitPrimario: antigo.kitPrimario, kitSecundario: antigo.kitSecundario,
    treinador: carreira.treinador, dificuldade: carreira.dificuldade,
  };
  Game.club = new Club(cfg);
  Object.assign(Game.club, carreira);
  Game.club.confiancaDiretoria = 65;
  Game.club.addNoticia(`Contratado pelo ${nomeClube} após deixar o ${antigo.nome}.`, '✍️');

  Game.world = gerarMundo(Game.club.nome, Game.club.pais);
  verificarConquistas();
  Game.save();
}

/* --- Copa Nacional (mata-mata) --- */
function iniciarCopaNacional(){
  const participantes = shuffle(Game.world.clubes.map(c => c.id)).slice(0, 16);
  Game.world.copa = { fase:'oitavas', chave: parearClubes(participantes), campeaoId:null, historico:[] };
  Game.club.addNoticia(`A ${nomeCopa()} começou! Chaveamento das oitavas de final definido.`, '🏆');
  Game.save();
  UI.renderAppScreen('competicoes');
}
function parearClubes(ids){
  const pares = [];
  for (let i=0;i<ids.length;i+=2) pares.push({ mandanteId: ids[i], visitanteId: ids[i+1], golsMandante:null, golsVisitante:null, vencedorId:null });
  return pares;
}
function simularFaseCopa(){
  const copa = Game.world.copa;
  if (!copa || copa.fase === 'concluida') return;
  copa.chave.forEach(jogo => {
    const xiM = jogo.mandanteId === 'player' ? getXIDoJogador() : bestXI(getSquad(jogo.mandanteId));
    const xiV = jogo.visitanteId === 'player' ? getXIDoJogador() : bestXI(getSquad(jogo.visitanteId));
    const tatM = jogo.mandanteId === 'player' ? Game.club.tatica : taticaNeutra();
    const tatV = jogo.visitanteId === 'player' ? Game.club.tatica : taticaNeutra();
    let res = simulateMatch({ xi:xiM, tatica:tatM }, { xi:xiV, tatica:tatV });
    let vencedorId;
    if (res.golsMandante === res.golsVisitante){
      // pênaltis simplificados
      vencedorId = Math.random() < overallOf(xiM)/(overallOf(xiM)+overallOf(xiV)) ? jogo.mandanteId : jogo.visitanteId;
    } else {
      vencedorId = res.golsMandante > res.golsVisitante ? jogo.mandanteId : jogo.visitanteId;
    }
    Object.assign(jogo, { golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, vencedorId });
    copa.historico.push({ fase: copa.fase, mandante: getClubeInfo(jogo.mandanteId).nome, visitante: getClubeInfo(jogo.visitanteId).nome, placar: `${res.golsMandante}x${res.golsVisitante}` });
  });

  const vencedores = copa.chave.map(j => j.vencedorId);
  if (copa.fase === 'oitavas'){ copa.fase = 'quartas'; copa.chave = parearClubes(vencedores); }
  else if (copa.fase === 'quartas'){ copa.fase = 'semi'; copa.chave = parearClubes(vencedores); }
  else if (copa.fase === 'semi'){ copa.fase = 'final'; copa.chave = parearClubes(vencedores); }
  else if (copa.fase === 'final'){
    copa.fase = 'concluida'; copa.campeaoId = vencedores[0];
    Game.world.ultimoCampeaoCopa = copa.campeaoId;
    if (copa.campeaoId === 'player'){
      Game.club.conquistas.push({ tipo:'copa', nome:`Campeão ${nomeCopa()}`, temporada: Game.club.temporada });
      ganharReputacao(10);
      Game.club.addNoticia('CAMPEÃO DA COPA NACIONAL! 🏆', '🏆');
      UI.confetti(140);
    } else {
      Game.club.addNoticia(`${getClubeInfo(copa.campeaoId).nome} venceu a ${nomeCopa()}.`, '🏆');
    }
  }
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('competicoes');
}

/* --- Supercopa --- */
function jogarSupercopa(){
  const w = Game.world;
  const campeaoLiga = w.ultimoCampeaoLiga || 'player';
  const campeaoCopa = w.ultimoCampeaoCopa && w.ultimoCampeaoCopa !== campeaoLiga ? w.ultimoCampeaoCopa : pick(Game.world.clubes.map(c=>c.id).filter(id=>id!==campeaoLiga));
  const xiM = campeaoLiga === 'player' ? getXIDoJogador() : bestXI(getSquad(campeaoLiga));
  const xiV = campeaoCopa === 'player' ? getXIDoJogador() : bestXI(getSquad(campeaoCopa));
  const res = simulateMatch({ xi:xiM, tatica: campeaoLiga==='player'?Game.club.tatica:taticaNeutra() }, { xi:xiV, tatica: campeaoCopa==='player'?Game.club.tatica:taticaNeutra() });
  let vencedorId = res.golsMandante === res.golsVisitante
    ? (Math.random() < 0.5 ? campeaoLiga : campeaoCopa)
    : (res.golsMandante > res.golsVisitante ? campeaoLiga : campeaoCopa);
  Game.world.supercopa = { mandanteId: campeaoLiga, visitanteId: campeaoCopa, golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, vencedorId, jogado:true };
  if (vencedorId === 'player'){
    Game.club.conquistas.push({ tipo:'supercopa', nome:'Campeão da Supercopa', temporada: Game.club.temporada });
    ganharReputacao(5);
    Game.club.addNoticia('CAMPEÃO DA SUPERCOPA! 🏆', '🏆');
    UI.confetti(120);
  } else {
    Game.club.addNoticia(`${getClubeInfo(vencedorId).nome} venceu a Supercopa.`, '🏆');
  }
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('competicoes');
}

/* --- Torneio Internacional / Mundial --- */
function elegivelInternacional(){
  const tabela = ordenarTabela();
  const posicaoPlayer = tabela.findIndex(t => t.id === 'player') + 1;
  return posicaoPlayer > 0 && posicaoPlayer <= 4 || Game.world.ultimoCampeaoCopa === 'player';
}
function iniciarInternacional(){
  if (!elegivelInternacional()) return UI.toast('Seu clube ainda não se classificou para o torneio internacional.', 'warn');
  const rivais = shuffle(INTERNATIONAL_CLUB_NAMES).slice(0,7).map(nome => gerarClubeIA(nome));
  const todos = ['player', ...rivais.map(r=>r.id)];
  // Os rivais internacionais ficam à parte (em internacional.rivais), nunca entram na lista
  // principal de clubes — assim a tabela e o calendário da Série A nunca são afetados.
  Game.world.internacional = { fase:'quartas', chave: parearClubes(shuffle(todos)), campeaoId:null, rivais };
  Game.club.addNoticia('Sua equipe embarca para o Torneio Internacional!', '🌍');
  Game.save();
  UI.renderAppScreen('competicoes');
}
function simularFaseInternacional(){
  const torneio = Game.world.internacional;
  if (!torneio || torneio.fase === 'concluida') return;
  torneio.chave.forEach(jogo => {
    const xiM = jogo.mandanteId === 'player' ? getXIDoJogador() : bestXI(getSquad(jogo.mandanteId));
    const xiV = jogo.visitanteId === 'player' ? getXIDoJogador() : bestXI(getSquad(jogo.visitanteId));
    const res = simulateMatch({ xi:xiM, tatica: jogo.mandanteId==='player'?Game.club.tatica:taticaNeutra() }, { xi:xiV, tatica: jogo.visitanteId==='player'?Game.club.tatica:taticaNeutra() });
    const vencedorId = res.golsMandante === res.golsVisitante
      ? (Math.random() < overallOf(xiM)/(overallOf(xiM)+overallOf(xiV)) ? jogo.mandanteId : jogo.visitanteId)
      : (res.golsMandante > res.golsVisitante ? jogo.mandanteId : jogo.visitanteId);
    Object.assign(jogo, { golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, vencedorId });
  });
  const vencedores = torneio.chave.map(j => j.vencedorId);
  if (torneio.fase === 'quartas'){ torneio.fase = 'semi'; torneio.chave = parearClubes(vencedores); }
  else if (torneio.fase === 'semi'){ torneio.fase = 'final'; torneio.chave = parearClubes(vencedores); }
  else if (torneio.fase === 'final'){
    torneio.fase = 'concluida'; torneio.campeaoId = vencedores[0];
    if (torneio.campeaoId === 'player'){
      Game.club.conquistas.push({ tipo:'internacional', nome:'Campeão Internacional', temporada: Game.club.temporada });
      ganharReputacao(20);
      Game.club.addNoticia('CAMPEÃO DO TORNEIO INTERNACIONAL! 🌍🏆', '🌍');
      UI.confetti(160);
    } else {
      Game.club.addNoticia(`${getClubeInfo(torneio.campeaoId).nome} venceu o torneio internacional.`, '🌍');
    }
  }
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('competicoes');
}
function jogarMundial(){
  if (!Game.club.conquistas.some(c => c.tipo === 'internacional')) return UI.toast('Vença o torneio internacional para disputar o Mundial.', 'warn');
  const rival = gerarClubeIA('Campeão Global FC');
  const xiM = getXIDoJogador(), xiV = bestXI(rival.squadRef);
  const res = simulateMatch({ xi:xiM, tatica:Game.club.tatica }, { xi:xiV, tatica:taticaNeutra() });
  const venceu = res.golsMandante >= res.golsVisitante;
  Game.world.mundial = { golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, venceu, adversario: rival.nome };
  if (venceu){
    Game.club.conquistas.push({ tipo:'mundial', nome:'Campeão Mundial de Clubes', temporada: Game.club.temporada });
    ganharReputacao(30);
    Game.club.addNoticia('CAMPEÃO MUNDIAL DE CLUBES! 🌐🏆', '🌐');
    UI.confetti(200);
  } else {
    Game.club.addNoticia(`Perdemos a final do Mundial para o ${rival.nome}.`, '🌐');
  }
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('competicoes');
}

/* --- Seleção Nacional --- */
const REPUTACAO_MINIMA_SELECAO = 50;

function melhoresJogadoresDoPais(pais, qtd){
  const todos = [
    ...Game.club.jogadores,
    ...Game.world.clubes.filter(c => !c.isPlayer).flatMap(c => c.squadRef),
  ];
  return todos.filter(p => p.pais === pais && !p.lesionado).sort((a,b) => b.overall - a.overall).slice(0, qtd);
}

function aceitarConviteSelecao(){
  if (Game.club.reputacao < REPUTACAO_MINIMA_SELECAO) return UI.toast('Você ainda não tem reputação suficiente.', 'warn');
  Game.club.selecao = { ativo: true, pais: Game.club.pais };
  Game.club.addNoticia(`Você aceitou comandar a Seleção de ${Game.club.pais}, acumulando com o clube!`, '🌍');
  UI.toast('Bem-vindo à Seleção Nacional!', 'ok');
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('competicoes');
}

function iniciarCopaDoMundoSelecoes(){
  if (!Game.club.selecao?.ativo) return;
  const meuXI = melhoresJogadoresDoPais(Game.club.pais, 23);
  if (meuXI.length < 11) return UI.toast('Não há jogadores suficientes dessa nacionalidade em atividade no momento.', 'warn');
  const paisesRivais = shuffle(COUNTRIES.filter(p => p !== Game.club.pais)).slice(0, 7);
  const rivais = paisesRivais.map(p => gerarClubeIA(`Seleção de ${p}`, p));
  const todos = shuffle(['selecao-jogador', ...rivais.map(r => r.id)]);
  Game.world.copaDoMundoSelecoes = { fase:'quartas', chave: parearClubes(todos), campeaoId:null, rivais, meuXI };
  Game.club.addNoticia(`A Seleção de ${Game.club.pais} embarca para a Copa do Mundo!`, '🌐');
  Game.save();
  UI.renderAppScreen('competicoes');
}

function simularFaseCopaDoMundoSelecoes(){
  const torneio = Game.world.copaDoMundoSelecoes;
  if (!torneio || torneio.fase === 'concluida') return;

  const getXIPorId = (id) => {
    if (id === 'selecao-jogador') return bestXI(torneio.meuXI);
    const r = torneio.rivais.find(x => x.id === id);
    return r ? bestXI(r.squadRef) : [];
  };

  torneio.chave.forEach(jogo => {
    const xiM = getXIPorId(jogo.mandanteId), xiV = getXIPorId(jogo.visitanteId);
    const tatM = jogo.mandanteId === 'selecao-jogador' ? Game.club.tatica : taticaNeutra();
    const tatV = jogo.visitanteId === 'selecao-jogador' ? Game.club.tatica : taticaNeutra();
    const res = simulateMatch({ xi:xiM, tatica:tatM }, { xi:xiV, tatica:tatV });
    const vencedorId = res.golsMandante === res.golsVisitante
      ? (Math.random() < overallOf(xiM)/(overallOf(xiM)+overallOf(xiV)) ? jogo.mandanteId : jogo.visitanteId)
      : (res.golsMandante > res.golsVisitante ? jogo.mandanteId : jogo.visitanteId);
    Object.assign(jogo, { golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, vencedorId });
  });

  const vencedores = torneio.chave.map(j => j.vencedorId);
  if (torneio.fase === 'quartas'){ torneio.fase = 'semi'; torneio.chave = parearClubes(vencedores); }
  else if (torneio.fase === 'semi'){ torneio.fase = 'final'; torneio.chave = parearClubes(vencedores); }
  else if (torneio.fase === 'final'){
    torneio.fase = 'concluida'; torneio.campeaoId = vencedores[0];
    if (torneio.campeaoId === 'selecao-jogador'){
      Game.club.conquistas.push({ tipo:'selecao', nome:`Campeão da Copa do Mundo com a Seleção de ${Game.club.pais}`, temporada: Game.club.temporada });
      Game.club.addNoticia('CAMPEÃO DA COPA DO MUNDO PELA SELEÇÃO! 🌐🏆', '🌐');
      ganharReputacao(25);
      UI.confetti(220);
    } else {
      Game.club.addNoticia(`${getClubeInfo(torneio.campeaoId).nome} venceu a Copa do Mundo de Seleções.`, '🌐');
    }
  }
  verificarConquistas();
  Game.save();
  UI.renderAppScreen('competicoes');
}

/* =====================================================================
   15. GERADORES DE SVG (escudos)
   ===================================================================== */

function crestSVG(def, size = 48){
  const { shape, c1, c2 } = def;
  let inner = '';
  switch(shape){
    case 'shield': inner = `<path d="M24 4 L42 10 V26 C42 38 24 46 24 46 C24 46 6 38 6 26 V10 Z" fill="${c1}" stroke="${c2}" stroke-width="3"/><circle cx="24" cy="24" r="8" fill="${c2}"/>`; break;
    case 'circle': inner = `<circle cx="24" cy="24" r="20" fill="${c1}" stroke="${c2}" stroke-width="3"/><polygon points="24,14 27,22 36,22 29,27 31,36 24,30 17,36 19,27 12,22 21,22" fill="${c2}"/>`; break;
    case 'star': inner = `<circle cx="24" cy="24" r="20" fill="${c2}"/><polygon points="24,6 29,19 43,19 32,28 36,42 24,34 12,42 16,28 5,19 19,19" fill="${c1}"/>`; break;
    case 'diamond': inner = `<polygon points="24,3 45,24 24,45 3,24" fill="${c1}" stroke="${c2}" stroke-width="3"/><rect x="17" y="17" width="14" height="14" fill="${c2}" transform="rotate(45 24 24)"/>`; break;
  }
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

/* =====================================================================
   16. GAME / SAVE MANAGER
   ===================================================================== */

const Game = {
  club: null,
  world: null,
  autosaveTimer: null,

  hasSave(){ return !!localStorage.getItem(STORAGE_KEY); },

  save(){
    if (!this.club) return;
    try {
      const payload = { club: this.club.toJSON(), world: this._serializeWorld(this.world), savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch(e){ console.error('Falha ao salvar', e); UI.toast('Não foi possível salvar o progresso.', 'danger'); }
  },

  _serializeWorld(world){
    if (!world) return null;
    return {
      ...world,
      clubes: world.clubes.map(c => c.isPlayer ? c : { ...c, squadRef: c.squadRef.map(p => p.toJSON()) }),
      freeAgents: world.freeAgents.map(p => p.toJSON()),
      internacional: world.internacional ? { ...world.internacional, rivais: (world.internacional.rivais||[]).map(c => ({ ...c, squadRef: c.squadRef.map(p => p.toJSON()) })) } : null,
      copaDoMundoSelecoes: world.copaDoMundoSelecoes ? { ...world.copaDoMundoSelecoes,
        rivais: (world.copaDoMundoSelecoes.rivais||[]).map(c => ({ ...c, squadRef: c.squadRef.map(p => p.toJSON()) })),
        meuXI: (world.copaDoMundoSelecoes.meuXI||[]).map(p => p.toJSON()),
      } : null,
    };
  },
  _deserializeWorld(data){
    if (!data) return null;
    return {
      ...data,
      clubes: data.clubes.map(c => c.isPlayer ? c : { ...c, squadRef: c.squadRef.map(Player.fromJSON) }),
      freeAgents: data.freeAgents.map(Player.fromJSON),
      internacional: data.internacional ? { ...data.internacional, rivais: (data.internacional.rivais||[]).map(c => ({ ...c, squadRef: c.squadRef.map(Player.fromJSON) })) } : null,
      copaDoMundoSelecoes: data.copaDoMundoSelecoes ? { ...data.copaDoMundoSelecoes,
        rivais: (data.copaDoMundoSelecoes.rivais||[]).map(c => ({ ...c, squadRef: c.squadRef.map(Player.fromJSON) })),
        meuXI: (data.copaDoMundoSelecoes.meuXI||[]).map(Player.fromJSON),
      } : null,
    };
  },

  load(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      this.club = Club.fromJSON(data.club);
      this.world = this._deserializeWorld(data.world) || gerarMundo(this.club.nome, this.club.pais);
      this._migrarSave();
      return true;
    } catch(e){ console.error('Save corrompido', e); return false; }
  },

  // Preenche com valores padrão qualquer campo que não existia em saves de versões
  // anteriores do jogo, para que uma carreira antiga nunca quebre com atualizações novas.
  _migrarSave(){
    const c = this.club, w = this.world;

    const migrarJogador = (p) => {
      if (!p) return;
      p.lesoes = p.lesoes || [];
      p.golsTemporada ??= 0; p.assistenciasTemporada ??= 0;
      p.cartoesAmarelos ??= 0; p.cartoesVermelhos ??= 0; p.jogosTemporada ??= 0;
      p.golsClube ??= 0; p.assistenciasClube ??= 0;
      p.emprestado ??= false; p.clubeEmprestimoNome ??= null; p.rodadasEmprestimoRestantes ??= 0;
      p.fadiga ??= 0; p.moral ??= 75; p.forma ??= 70;
      p.clausulaRescisao ??= Math.round((p.valorMercado||1_000_000) * 1.7 / 1000) * 1000;
    };

    c.pais ??= (COUNTRIES.includes(c.pais) ? c.pais : 'Brasil');
    c.moralElenco ??= 78;
    c.academia = c.academia || { nivel: 1 };
    c.academia.alojamento ??= false;
    c.centroTreinamento = c.centroTreinamento || { nivel: 1 };
    c.youthPlayers = c.youthPlayers || [];
    c.conquistas = c.conquistas || [];
    c.historico = c.historico || [{ ano: c.fundadoEm, evento: `Fundação do ${c.nome}` }];
    c.noticias = c.noticias || [];
    c.premiosTemporada = c.premiosTemporada || [];
    c.achievementsUnlocked = c.achievementsUnlocked || [];
    c.financas = c.financas || { receitas: [], despesas: [] };
    c.sponsor = c.sponsor ?? null;
    c.formacaoAtual = c.formacaoAtual || '4-3-3';
    c.escalacaoIds = c.escalacaoIds || [];
    c.bancoIds = c.bancoIds || [];
    c.capitaoId ??= null; c.batedorPenaltiId ??= null; c.batedorFaltaId ??= null;
    c.tatica = c.tatica || { posse:50, pressao:50, contraAtaque:50, linhaDefensiva:50, largura:50, ritmo:50, agressividade:50 };
    c.tatica.largura ??= 50; c.tatica.ritmo ??= 50; c.tatica.agressividade ??= 50;
    c.estiloAtual ??= 'Equilibrado';
    c.treinoFeitoRodada ??= 0;
    c.estatisticasCarreira = c.estatisticasCarreira || {
      vitorias:0, empates:0, derrotas:0, golsMarcados:0, golsSofridos:0,
      sequenciaInvicta:0, maiorSequenciaInvicta:0, gastoTransferencias:0, receitaTransferencias:0, promovidosAcademia:0,
    };
    c.estatisticasCarreira.vitoriasClassico ??= 0; c.estatisticasCarreira.desafiosCompletos ??= 0;
    c.estatisticasCarreira.rebaixamentos ??= 0; c.estatisticasCarreira.acessos ??= 0;
    c.estadio = c.estadio || { nome:`Estádio Municipal de ${c.cidade}`, capacidade: 8000 };
    c.estadio.nivelGramado ??= 1; c.estadio.nivelIluminacao ??= 1; c.estadio.nivelArquibancada ??= 1;
    c.estadio.museu ??= false; c.estadio.loja ??= false; c.estadio.restaurante ??= false;
    c.estadio.estacionamento ??= false; c.estadio.academiaMedica ??= false; c.estadio._bonusTemporario ??= 0;

    c.reputacao ??= 20;
    c.confiancaDiretoria ??= 70;
    c.salarioTreinadorBase ??= { facil:45_000, normal:32_000, dificil:22_000, extremo:14_000 }[c.dificuldade] ?? 32_000;
    c.patrimonioTreinador ??= 0;
    c.historicoClubes = c.historicoClubes || [{ nome: c.nome, desde: 1 }];
    c.selecao = c.selecao || { ativo: false };
    c.comissao = c.comissao || { auxiliar: false, preparadorFisico: false, olheiroChefe: false };
    c.rivalId ??= null;
    c.hallDaFama = c.hallDaFama || [];
    c.desafioSemanal ??= null;
    c.mesesOrcamentoNegativo ??= 0;
    c.configModoJogavel ??= false;
    c.popularidade ??= 30;
    c.embaixador ??= null;
    c.metaCarreira ??= null;
    c.olheiroFocoPais ??= null;
    c.recordes = c.recordes || { maiorOrcamento: c.orcamento, maiorPublico: 0, maisGolsTemporada: 0 };
    c.estadio.telao ??= false; c.estadio.muralTrofeus ??= false; c.estadio.estatuaIdolo ??= false; c.estadio.namingVendido ??= false;

    c.jogadores.forEach(migrarJogador);
    c.youthPlayers.forEach(migrarJogador);

    if (w){
      w.freeAgents = w.freeAgents || [];
      w.freeAgents.forEach(migrarJogador);
      w.clubes.forEach(cl => {
        if (cl.isPlayer) return;
        cl.pais ??= c.pais;
        cl.recemPromovido ??= false;
        (cl.squadRef || []).forEach(migrarJogador);
      });
      w.tabela = w.tabela || {};
      w.clubes.forEach(cl => { w.tabela[cl.id] = w.tabela[cl.id] || { pontos:0, v:0, e:0, d:0, gp:0, gc:0, j:0 }; });
      w.sponsorOfertasDisponiveis = w.sponsorOfertasDisponiveis || gerarOfertasPatrocinio();
      w.leilaoAtual = w.leilaoAtual || gerarLeilaoSemanal(w.freeAgents);
      w.copa ??= null; w.supercopa ??= null; w.internacional ??= null; w.mundial ??= null; w.copaDoMundoSelecoes ??= null;
      w.ultimoResultadoJogador ??= null; w.ultimoCampeaoLiga ??= null; w.ultimoCampeaoCopa ??= null;
      w.divisaoAtual ??= 'A'; w.reservaSerieA ??= null; w.reservaSerieB ??= null;
      if (w.internacional && w.internacional.rivais) w.internacional.rivais.forEach(cl => (cl.squadRef || []).forEach(migrarJogador));
    }
  },

  wipe(){ localStorage.removeItem(STORAGE_KEY); this.club = null; this.world = null; },

  startAutosave(){
    clearInterval(this.autosaveTimer);
    this.autosaveTimer = setInterval(() => { this.save(); }, 30000);
  },

  newClub(cfg){
    this.club = new Club(cfg);
    this.world = gerarMundo(this.club.nome, this.club.pais);
    this.save();
    this.startAutosave();
  },
};

/* =====================================================================
   17. UI CONTROLLER
   ===================================================================== */

const UI = {
  currentScreen: 'menu',
  creation: { step: 0, data: {} },

  init(){
    this.bindStaticEvents();
    this.updateContinueHint();
    this.renderRankingMenu();
  },

  showScreen(id){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
    this.currentScreen = id;
  },

  updateContinueHint(){
    document.getElementById('continue-hint').textContent = Game.hasSave() ? 'Uma carreira salva foi encontrada.' : 'Nenhuma carreira salva ainda.';
  },

  renderRankingMenu(){
    const list = document.getElementById('ranking-menu-list');
    const demo = [['Real Vitória',284], ['Atlético do Norte',271], ['Grêmio Estelar',260], ['União Metropolitana',244], ['Costa Azul FC',231], ['Ferroviário Central',219]];
    list.innerHTML = demo.map(([nome,pts],i) => `<div class="ranking-row"><span class="ranking-row__pos">#${i+1}</span><span class="ranking-row__name">${nome}</span><span class="ranking-row__pts">${pts} pts</span></div>`).join('');
  },

  toast(msg, type = 'ok'){
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'ok' ? '' : ' ' + type);
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3400);
  },

  confetti(count = 60){
    const colors = [KIT_COLORS[0], KIT_COLORS[1], KIT_COLORS[2], KIT_COLORS[3]];
    for (let i=0; i<count; i++){
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random()*100 + 'vw';
      el.style.background = pick(colors);
      el.style.animationDuration = (2 + Math.random()*1.5) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3600);
    }
  },

  openModal(html, wide = false){
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';
    overlay.innerHTML = `<div class="modal-box ${wide?'wide':''}">${html}</div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) this.closeModal(); });
    document.body.appendChild(overlay);
  },
  closeModal(){
    const m = document.getElementById('active-modal');
    if (m) m.remove();
    if (MiniGame.ativo){ MiniGame.ativo = false; clearInterval(MiniGame.timer); }
    if (this.partidaJogavelState && !this.partidaJogavelState.resolvido){
      clearInterval(this._partidaJogavelTimer);
      this.finalizarPartidaJogavel();
    }
  },

  renderMiniJogoView(ultimaZona, golMarcado){
    const box = document.querySelector('#active-modal .modal-box');
    if (!box){ clearInterval(MiniGame.timer); MiniGame.ativo = false; return; }
    const m = MiniGame;
    box.innerHTML = `
      <div class="modal-head"><h3>🎮 Cobrança Decisiva</h3><span style="font-family:var(--font-mono); font-size:1.2rem; color:${m.tempoRestante<=10?'var(--alert)':'var(--gold)'};">${m.tempoRestante}s</span></div>
      <p class="step-sub">Clique numa zona do gol para chutar. Se acertar o goleiro, é defesa!</p>
      <div style="display:flex; justify-content:center; gap:8px; margin:20px 0; flex-wrap:wrap;">
        ${[1,2,3,4,5].map(z => `<button class="btn-secondary" data-action="chutar-penalti" data-zona="${z}" style="width:56px; height:56px; font-size:1.3rem;">${z}</button>`).join('')}
      </div>
      <div style="text-align:center; font-size:1.1rem;">⚽ Gols: <b style="color:var(--grass);">${m.score}</b> · Tentativas: ${m.tentativas}</div>
      ${ultimaZona ? `<p style="text-align:center; margin-top:8px; font-weight:600; color:${golMarcado?'var(--grass)':'var(--alert)'};">${golMarcado ? '⚽ GOOOL!' : '🧤 DEFESA!'}</p>` : ''}`;
  },

  renderMiniJogoResultado(premio){
    this.openModal(`
      <div class="modal-head"><h3>🏁 Fim do desafio!</h3></div>
      <p class="step-sub">Você marcou <b style="color:var(--grass);">${MiniGame.score}</b> gol(s) em ${MiniGame.tentativas} cobrança(s).</p>
      <p class="step-sub">Prêmio conquistado: <b style="color:var(--gold);">${formatMoney(premio)}</b></p>
      <button class="btn-primary" style="margin-top:16px; width:100%;" data-close-modal>Fechar</button>`, true);
    this.toast(`Mini-jogo concluído! +${formatMoney(premio)}`, 'ok');
  },

  exportarSave(){
    if (!Game.club) return;
    Game.save();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return this.toast('Nenhuma carreira para exportar.', 'warn');
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataStr = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `club-manager-${Game.club.nome.replace(/\s+/g,'_')}-${dataStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    this.toast('Save exportado! Verifique seus downloads.', 'ok');
  },

  importarSaveArquivo(file){
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.club || !data.club.nome) throw new Error('Formato inválido');
        if (!confirm(`Importar a carreira de "${data.club.nome}"? Isso substitui sua carreira atual.`)) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (Game.load()){
          this.toast(`Carreira de ${Game.club.nome} importada com sucesso!`, 'ok');
          this.enterApp();
        } else {
          this.toast('Não foi possível carregar o arquivo importado.', 'danger');
        }
      } catch(err){
        console.error('Erro ao importar save', err);
        this.toast('Arquivo inválido. Verifique se é um save do Club Manager.', 'danger');
      }
    };
    reader.readAsText(file);
  },

  falarResumoPartida(resultadoJogador){
    if (!('speechSynthesis' in window)) return this.toast('Seu navegador não suporta leitura em voz.', 'warn');
    const nomeM = getClubeInfo(resultadoJogador.mandanteId).nome, nomeV = getClubeInfo(resultadoJogador.visitanteId).nome;
    const golsFeitos = (resultadoJogador.eventos||[]).filter(e => e.tipo === 'gol');
    let texto = `${nomeM} ${resultadoJogador.golsMandante} a ${resultadoJogador.golsVisitante} ${nomeV}. `;
    if (golsFeitos.length) texto += 'Gols de ' + golsFeitos.map(g => g.jogador).join(', ') + '. ';
    else texto += 'Um jogo sem gols. ';
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(texto);
    utter.lang = 'pt-BR';
    window.speechSynthesis.speak(utter);
  },

  simularTemporadaInteira(){
    if (Game.club.confiancaDiretoria <= 15) if (!confirm('Sua confiança com a diretoria está baixa — você pode ser demitido no meio do caminho. Continuar simulando a temporada inteira?')) return;
    let rodadas = 0;
    let demitidoNoMeio = false;
    while (Game.world.rodadaAtual <= Game.world.totalRodadas && rodadas < 45){
      const { demitido } = simularRodada();
      rodadas++;
      if (demitido){ demitidoNoMeio = true; break; }
    }
    if (demitidoNoMeio){
      const ofertas = gerarNomesClubesPais(Game.club.pais, 3);
      this.toast(`Você foi demitido durante a simulação da temporada.`, 'danger');
      UI.openModal(`
        <div class="modal-head"><h3>😔 Você foi demitido!</h3></div>
        <p class="step-sub">A diretoria perdeu a confiança no meio da temporada. Escolha seu próximo clube:</p>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
          ${ofertas.map(nome => `<button class="btn-secondary" data-action="assumir-clube" data-nome="${nome}">${nome}</button>`).join('')}
        </div>`, true);
      return;
    }
    this.toast(`Temporada simulada! (${rodadas} rodada(s))`, 'ok');
    this.renderAppScreen('calendario');
  },

  /* =========================================================
     EVENTOS ESTÁTICOS
     ========================================================= */
  bindStaticEvents(){
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      const digitando = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
      if (e.key === 'Escape' && document.getElementById('active-modal')){ this.closeModal(); return; }
      if (!digitando && (e.key === 's' || e.key === 'S') && document.getElementById('screen-app')?.classList.contains('active') && document.querySelector('.nav-item.active[data-screen="calendario"]') && !document.getElementById('active-modal')){
        this.simularRodadaComModal();
      }
    });

    document.body.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn){ this.closeModal(); return; }

      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;

      switch(action){
        case 'show-new-club':
          this.creation.step = 0;
          this.creation.data = { nome:'', cidade:'', pais: COUNTRIES[0], escudoId:0, kitPrimario: KIT_COLORS[0], kitSecundario: KIT_COLORS[7], treinador:'', dificuldade:'normal' };
          this.showScreen('creation'); this.renderCreationStep();
          break;
        case 'continue-career':
          if (Game.load()) this.enterApp(); else this.toast('Nenhuma carreira salva foi encontrada.', 'warn');
          break;
        case 'show-settings-menu': this.showScreen('settings-menu'); break;
        case 'show-ranking-menu': this.showScreen('ranking-menu'); break;
        case 'show-credits-menu': this.showScreen('credits-menu'); break;
        case 'back-to-menu': this.showScreen('menu'); this.updateContinueHint(); break;
        case 'wipe-save':
          if (confirm('Tem certeza que deseja apagar todo o progresso salvo?')){ Game.wipe(); this.toast('Dados salvos apagados.', 'warn'); this.updateContinueHint(); }
          break;
        case 'exit-to-menu':
          Game.save();
          document.getElementById('screen-app').classList.remove('active');
          this.showScreen('menu'); this.updateContinueHint();
          break;

        /* ---- Mercado ---- */
        case 'comprar-jogador': comprarJogador(actionEl.dataset.id, actionEl.dataset.origem === 'null' ? null : actionEl.dataset.origem); break;
        case 'dar-lance': {
          const input = document.getElementById('lance-input');
          const valor = parseInt(input.value.replace(/\D/g,''), 10) || 0;
          darLanceLeilao(valor);
          break;
        }

        /* ---- Elenco ---- */
        case 'vender-jogador': venderJogador(actionEl.dataset.id); break;
        case 'emprestar-jogador': emprestarJogador(actionEl.dataset.id); break;
        case 'renovar-jogador': renovarContrato(actionEl.dataset.id); break;
        case 'liberar-pedido': liberarPedidoTransferencia(); break;
        case 'recusar-pedido': recusarPedidoTransferencia(); break;

        /* ---- Treinamento ---- */
        case 'treinar': treinarElenco(actionEl.dataset.tipo); break;
        case 'descansar': descansarElenco(); break;
        case 'contratar-staff': contratarStaff(actionEl.dataset.tipo); break;
        case 'demitir-staff': demitirStaff(actionEl.dataset.tipo); break;
        case 'melhorar-ct': melhorarCentroTreinamento(); break;

        /* ---- Finanças ---- */
        case 'aceitar-patrocinio': aceitarPatrocinio(actionEl.dataset.id); break;

        /* ---- Estádio ---- */
        case 'melhorar-estadio': melhorarEstadio(actionEl.dataset.id); break;
        case 'vender-naming': venderNamingRights(); break;
        case 'contratar-embaixador': contratarEmbaixador(); break;

        /* ---- Academia ---- */
        case 'buscar-talentos': buscarTalentos(); break;
        case 'promover-jovem': promoverJovem(actionEl.dataset.id); break;
        case 'dispensar-jovem': dispensarJovem(actionEl.dataset.id); break;
        case 'melhorar-academia': melhorarAcademia(); break;
        case 'construir-alojamento': construirAlojamentoBase(); break;

        /* ---- Calendário / Partida ---- */
        case 'simular-rodada': this.simularRodadaComModal(); break;
        case 'sugestao-escalacao':
          Game.club.escalacaoIds = bestXI(Game.club.jogadores).map(p => p.id);
          Game.save();
          this.renderAppScreen('calendario');
          this.toast('Escalação sugerida aplicada!', 'ok');
          break;
        case 'aplicar-estilo':
          Game.club.tatica = { ...ESTILOS_JOGO[actionEl.dataset.estilo] };
          Game.club.estiloAtual = actionEl.dataset.estilo;
          Game.save();
          this.renderAppScreen('calendario');
          this.toast(`Estilo "${actionEl.dataset.estilo}" aplicado!`, 'ok');
          break;
        case 'entrevista':
          entrevistaPosJogo(actionEl.dataset.tipo);
          actionEl.parentElement.querySelectorAll('[data-action="entrevista"]').forEach(b => b.disabled = true);
          break;
        case 'abrir-minijogo': abrirMiniJogoPenalti(); break;
        case 'comecar-minijogo': comecarMiniJogoPenalti(); break;
        case 'chutar-penalti': chutarPenalti(parseInt(actionEl.dataset.zona, 10)); break;
        case 'escolher-momento': this.resolverMomentoJogavel(parseInt(actionEl.dataset.idx, 10)); break;
        case 'ouvir-resumo':
          if (Game.world.ultimoResultadoJogador) this.falarResumoPartida(Game.world.ultimoResultadoJogador);
          break;
        case 'simular-temporada-inteira': this.simularTemporadaInteira(); break;
        case 'exportar-save': this.exportarSave(); break;
        case 'disparar-importar-save': document.getElementById('input-importar-save')?.click(); break;

        /* ---- Competições ---- */
        case 'iniciar-copa': iniciarCopaNacional(); break;
        case 'simular-fase-copa': simularFaseCopa(); break;
        case 'jogar-supercopa': jogarSupercopa(); break;
        case 'iniciar-internacional': iniciarInternacional(); break;
        case 'simular-fase-internacional': simularFaseInternacional(); break;
        case 'jogar-mundial': jogarMundial(); break;
        case 'aceitar-convite-selecao': aceitarConviteSelecao(); break;
        case 'iniciar-copa-selecoes': iniciarCopaDoMundoSelecoes(); break;
        case 'simular-fase-selecoes': simularFaseCopaDoMundoSelecoes(); break;
        case 'assumir-clube':
          contratarNovoClube(actionEl.dataset.nome, Game.club.pais);
          this.closeModal();
          this.enterApp();
          this.toast(`Bem-vindo ao ${actionEl.dataset.nome}!`, 'ok');
          break;
      }
    });

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderAppScreen(btn.dataset.screen);
      });
    });

    document.getElementById('creation-next').addEventListener('click', () => this.creationNext());
    document.getElementById('creation-prev').addEventListener('click', () => this.creationPrev());
  },

  /* =========================================================
     ASSISTENTE DE CRIAÇÃO DE CLUBE
     ========================================================= */
  CREATION_STEPS: ['Identidade', 'Escudo', 'Uniformes', 'Comissão Técnica', 'Resumo'],

  renderCreationSteps(){
    document.getElementById('creation-steps').innerHTML = this.CREATION_STEPS.map((_, i) => {
      const cls = i < this.creation.step ? 'done' : (i === this.creation.step ? 'current' : '');
      return `<span class="${cls}"></span>`;
    }).join('');
  },

  renderCreationStep(){
    this.renderCreationSteps();
    const body = document.getElementById('creation-body');
    const d = this.creation.data;
    const step = this.creation.step;
    let html = '';

    if (step === 0){
      html = `<div class="step-title">Identidade do clube</div><div class="step-sub">Escolha o nome, cidade e país do seu clube.</div>
        <div class="field"><label>Nome do clube</label><input type="text" id="in-nome" placeholder="Ex: Atlético Vitória" value="${d.nome}"></div>
        <div class="field-row">
          <div class="field"><label>Cidade</label><input type="text" id="in-cidade" placeholder="Ex: Porto Alegre" value="${d.cidade}"></div>
          <div class="field"><label>País</label><select id="in-pais">${COUNTRIES.map(c => `<option value="${c}" ${c===d.pais?'selected':''}>${c}</option>`).join('')}</select></div>
        </div>`;
    }
    if (step === 1){
      html = `<div class="step-title">Escolha o escudo</div><div class="step-sub">Selecione um dos 20 modelos disponíveis.</div>
        <div class="crest-grid">${CREST_DEFS.map((def, i) => `<div class="crest-opt ${i===d.escudoId?'selected':''}" data-crest="${i}">${crestSVG(def, 40)}</div>`).join('')}</div>`;
    }
    if (step === 2){
      html = `<div class="step-title">Uniformes</div><div class="step-sub">Defina a cor principal e a cor reserva.</div>
        <div class="field"><label>Uniforme principal</label><div class="kit-grid">${KIT_COLORS.map(c => `<div class="kit-opt ${c===d.kitPrimario?'selected':''}" data-kit="primario" data-color="${c}" style="background:${c}"></div>`).join('')}</div></div>
        <div class="field"><label>Uniforme reserva</label><div class="kit-grid">${KIT_COLORS.map(c => `<div class="kit-opt ${c===d.kitSecundario?'selected':''}" data-kit="secundario" data-color="${c}" style="background:${c}"></div>`).join('')}</div></div>`;
    }
    if (step === 3){
      html = `<div class="step-title">Comissão técnica e dificuldade</div><div class="step-sub">Nomeie o treinador e escolha o nível de desafio.</div>
        <div class="field"><label>Nome do treinador</label><input type="text" id="in-treinador" placeholder="Ex: Ricardo Almeida" value="${d.treinador}"></div>
        <div class="field"><label>Dificuldade</label><div class="difficulty-grid">${DIFFICULTIES.map(diff => `<button type="button" class="diff-card ${diff.id===d.dificuldade?'selected':''}" data-diff="${diff.id}"><h4>${diff.nome}</h4><p>${diff.desc}</p></button>`).join('')}</div></div>`;
    }
    if (step === 4){
      html = `<div class="step-title">Resumo</div><div class="step-sub">Confira os dados antes de fundar o clube.</div>
        <div class="summary-card"><div class="summary-crest">${crestSVG(CREST_DEFS[d.escudoId], 64)}</div>
          <div class="summary-grid">
            <div>Clube: <b>${d.nome || '—'}</b></div><div>Treinador: <b>${d.treinador || '—'}</b></div>
            <div>Cidade: <b>${d.cidade || '—'}</b></div><div>País: <b>${d.pais}</b></div>
            <div>Dificuldade: <b>${DIFFICULTIES.find(x=>x.id===d.dificuldade).nome}</b></div>
            <div>Uniformes: <b style="color:${d.kitPrimario}">■</b> <b style="color:${d.kitSecundario}">■</b></div>
          </div></div>
        <p class="step-sub" style="margin-top:16px;">Ao fundar o clube você entra na ${LEAGUE_NAMES[d.pais] || 'Liga Nacional'} com 19 rivais controlados pela IA, disputando 38 rodadas.</p>`;
    }
    body.innerHTML = html;
    this.bindCreationStepEvents();
    this.updateCreationNav();
  },

  bindCreationStepEvents(){
    document.querySelectorAll('[data-crest]').forEach(el => el.addEventListener('click', () => { this.creation.data.escudoId = parseInt(el.dataset.crest,10); this.renderCreationStep(); }));
    document.querySelectorAll('[data-kit]').forEach(el => el.addEventListener('click', () => { const t = el.dataset.kit; this.creation.data[t==='primario'?'kitPrimario':'kitSecundario'] = el.dataset.color; this.renderCreationStep(); }));
    document.querySelectorAll('[data-diff]').forEach(el => el.addEventListener('click', () => { this.creation.data.dificuldade = el.dataset.diff; this.renderCreationStep(); }));

    const nome = document.getElementById('in-nome'); if (nome) nome.addEventListener('input', () => { this.creation.data.nome = nome.value; this.updateCreationNav(); });
    const cidade = document.getElementById('in-cidade'); if (cidade) cidade.addEventListener('input', () => { this.creation.data.cidade = cidade.value; this.updateCreationNav(); });
    const pais = document.getElementById('in-pais'); if (pais) pais.addEventListener('change', () => this.creation.data.pais = pais.value);
    const treinador = document.getElementById('in-treinador'); if (treinador) treinador.addEventListener('input', () => { this.creation.data.treinador = treinador.value; this.updateCreationNav(); });
  },

  updateCreationNav(){
    const prevBtn = document.getElementById('creation-prev'), nextBtn = document.getElementById('creation-next');
    prevBtn.style.visibility = this.creation.step === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = this.creation.step === this.CREATION_STEPS.length - 1 ? 'Fundar Clube' : 'Próximo';
    nextBtn.disabled = false;
    const d = this.creation.data;
    if (this.creation.step === 0 && (!d.nome.trim() || !d.cidade.trim())) nextBtn.disabled = true;
    if (this.creation.step === 3 && !d.treinador.trim()) nextBtn.disabled = true;
  },

  creationNext(){
    if (this.creation.step < this.CREATION_STEPS.length - 1){ this.creation.step++; this.renderCreationStep(); }
    else this.finalizeCreation();
  },
  creationPrev(){ if (this.creation.step > 0){ this.creation.step--; this.renderCreationStep(); } },

  finalizeCreation(){
    Game.newClub(this.creation.data);
    const metas = {
      facil: { temporadas: 6, desc:`Vencer a ${nomeLiga()} em até 6 temporadas` },
      normal: { temporadas: 5, desc:`Vencer a ${nomeLiga()} em até 5 temporadas` },
      dificil: { temporadas: 4, desc:`Vencer a ${nomeLiga()} em até 4 temporadas` },
      extremo: { temporadas: 3, desc:`Vencer a ${nomeLiga()} em até 3 temporadas` },
    };
    Game.club.metaCarreira = { ...metas[Game.club.dificuldade], cumprida: false };
    Game.save();
    this.toast(`${Game.club.nome} foi fundado! Boa sorte, treinador ${Game.club.treinador}.`, 'ok');
    this.confetti(80);
    this.enterApp();
  },

  /* =========================================================
     APP PRINCIPAL
     ========================================================= */
  enterApp(){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-app').classList.add('active');
    Game.startAutosave();
    this.renderSidebar();
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector('.nav-item[data-screen="dashboard"]').classList.add('active');
    this.renderAppScreen('dashboard');
  },

  renderSidebar(){
    const c = Game.club;
    document.getElementById('sidebar-crest').innerHTML = crestSVG(CREST_DEFS[c.escudoId], 32);
    document.getElementById('sidebar-club-name').textContent = c.nome;
    document.getElementById('sidebar-club-meta').textContent = `${c.cidade}, ${c.pais}`;
  },

  renderAppScreen(screenId){
    const main = document.getElementById('main-content');
    const builders = {
      dashboard: () => this.buildDashboard(), elenco: () => this.buildElenco(), mercado: () => this.buildMercado(),
      treinamento: () => this.buildTreinamento(), financas: () => this.buildFinancas(), estadio: () => this.buildEstadio(),
      academia: () => this.buildAcademia(), calendario: () => this.buildCalendario(), competicoes: () => this.buildCompeticoes(),
      historico: () => this.buildHistorico(), configuracoes: () => this.buildConfiguracoes(),
    };
    let html;
    try {
      html = (builders[screenId] || (()=>'<p>Tela não encontrada.</p>'))();
    } catch(e){
      console.error(`Erro ao renderizar a tela "${screenId}":`, e);
      this.toast(`Não foi possível abrir "${screenId}". Veja o console para detalhes.`, 'danger');
      html = `<div class="coming-soon"><span class="icon">⚠️</span><h3>Algo deu errado nesta tela</h3><p>Tente novamente. Se persistir, isso pode ser um save antigo — considere iniciar uma nova carreira.</p></div>`;
    }
    main.innerHTML = `<div class="content-screen active">${html}</div>`;
    this.renderSidebar();
    const after = {
      elenco: () => this.bindElencoEvents(), mercado: () => this.bindMercadoEvents(),
      calendario: () => this.bindCalendarioEvents(), competicoes: () => this.bindCompeticoesEvents(),
      configuracoes: () => this.bindConfiguracoesEvents(), academia: () => this.bindAcademiaEvents(),
    };
    try { if (after[screenId]) after[screenId](); } catch(e){ console.error(`Erro ao vincular eventos da tela "${screenId}":`, e); }
  },

  /* ---------- Dashboard ---------- */
  buildDashboard(){
    const c = Game.club, w = Game.world;
    const tabela = ordenarTabela();
    const posicao = tabela.findIndex(t => t.id === 'player') + 1;
    const confiancaClasse = c.confiancaDiretoria <= 25 ? 'alert' : c.confiancaDiretoria >= 70 ? 'sky' : '';
    return `
      <div class="page-head"><h2>Dashboard</h2><div class="sub">${c.nome} · Temporada ${c.temporada} · Rodada ${w.rodadaAtual}/${w.totalRodadas} · Técnico ${c.treinador}${c.selecao?.ativo ? ` · 🌍 Seleção de ${c.pais}` : ''}</div></div>
      <div class="panel-box" style="padding:14px 18px; font-family:var(--font-display); font-size:1.05rem; color:var(--text-hi); border-color:var(--gold);">📰 ${gerarManchete()}</div>
      ${c.confiancaDiretoria <= 25 ? `<div class="coming-soon" style="border-color:var(--alert); padding:16px; margin-bottom:18px;"><span class="icon">⚠️</span><h3>Seu emprego está em risco!</h3><p>A confiança da diretoria está em ${c.confiancaDiretoria}%. Melhore os resultados ou você pode ser demitido.</p></div>` : ''}
      ${posicao > tabela.length - 3 ? `<div class="coming-soon" style="border-color:var(--alert); padding:16px; margin-bottom:18px;"><span class="icon">📉</span><h3>Zona de rebaixamento!</h3><p>Você está em ${posicao}º lugar na ${nomeLigaAtual()}. Se a temporada terminar assim, seu clube cai de divisão.</p></div>` : ''}
      ${w.divisaoAtual === 'B' && posicao <= 2 ? `<div class="coming-soon" style="border-color:var(--grass); padding:16px; margin-bottom:18px;"><span class="icon">🎉</span><h3>Zona de acesso!</h3><p>Você está em ${posicao}º lugar. Se terminar assim, sobe de volta para a ${nomeLiga()}!</p></div>` : ''}
      <div class="card-grid">
        <div class="stat-card"><div class="stat-card__label">Orçamento</div><div class="stat-card__value">${formatMoney(c.orcamento)}</div><div class="stat-card__hint">Disponível para o mercado</div></div>
        <div class="stat-card gold"><div class="stat-card__label">Overall do Elenco</div><div class="stat-card__value">${c.overallMedio}</div><div class="stat-card__hint">${c.jogadores.length} jogadores</div></div>
        <div class="stat-card sky"><div class="stat-card__label">Posição na ${nomeLigaAtual()}</div><div class="stat-card__value">${posicao}º</div><div class="stat-card__hint">${tabela[posicao-1]?.pontos ?? 0} pontos</div></div>
        <div class="stat-card ${confiancaClasse}"><div class="stat-card__label">Confiança da Diretoria</div><div class="stat-card__value">${c.confiancaDiretoria}%</div><div class="stat-card__hint">Reputação: ${c.reputacao}/100</div></div>
      </div>
      <div class="panel-box"><h3>Resumo do clube</h3>
        <div class="summary-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
          <div>Fundado em: <b>${c.fundadoEm}</b></div><div>Dificuldade: <b>${DIFFICULTIES.find(x=>x.id===c.dificuldade)?.nome ?? c.dificuldade}</b></div>
          <div>Capacidade: <b>${c.estadio.capacidade.toLocaleString('pt-BR')}</b></div><div>Centro de Treinamento: <b>Nível ${c.centroTreinamento.nivel}</b></div>
          <div>Academia: <b>Nível ${c.academia.nivel}</b></div><div>Conquistas: <b>${c.conquistas.length}</b></div>
          <div>Vitórias/Empates/Derrotas: <b>${c.estatisticasCarreira.vitorias}/${c.estatisticasCarreira.empates}/${c.estatisticasCarreira.derrotas}</b></div>
          <div>Conquistas desbloqueadas: <b>${c.achievementsUnlocked.length}/${ACHIEVEMENTS.length}</b></div>
          <div>Patrimônio pessoal: <b>${formatMoney(c.patrimonioTreinador)}</b></div><div>Clubes na carreira: <b>${c.historicoClubes.length}</b></div>
          <div>Moral do elenco: <b>${c.moralElenco}%</b></div><div>Folha salarial: <b>${formatMoney(c.folhaSalarial)}/mês</b></div>
          <div>Popularidade: <b>${c.popularidade}%</b></div><div>Embaixador: <b>${c.embaixador || 'Nenhum'}</b></div>
          ${c.metaCarreira ? `<div>Meta de carreira: <b style="color:${c.metaCarreira.cumprida?'var(--grass)':'var(--text-hi)'};">${c.metaCarreira.desc}${c.metaCarreira.cumprida?' ✅':''}</b></div>` : ''}
        </div>
      </div>
      <div class="panel-box"><h3>Notícias recentes</h3>
        <ul style="margin:0; padding-left:0; list-style:none; color:var(--text-mid); font-size:.86rem; line-height:2;">
          ${c.noticias.slice(0,8).map(n => `<li>${n.icon} ${n.texto}</li>`).join('') || '<li>Nenhuma notícia ainda.</li>'}
        </ul>
      </div>`;
  },

  /* ---------- Elenco ---------- */
  buildElenco(){
    const c = Game.club;
    const pedido = c._pedidoTransferencia ? c.jogadores.find(j => j.id === c._pedidoTransferencia.jogadorId) : null;
    return `
      <div class="page-head"><h2>Elenco</h2><div class="sub">${c.jogadores.length} jogadores · Overall médio ${c.overallMedio}</div></div>
      ${pedido ? `<div class="panel-box" style="border-color:var(--alert);">
        <h3>🚪 Pedido de Transferência</h3>
        <p class="step-sub">${pedido.nomeCompleto} pediu para deixar o clube (expira em ${c._pedidoTransferencia.prazoRodadas} rodada(s)).</p>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button class="btn-secondary" data-action="liberar-pedido">Liberar sem custo</button>
          <button class="btn-ghost" data-action="recusar-pedido">Recusar pedido</button>
        </div>
      </div>` : ''}
      <div class="squad-toolbar">
        <select id="filter-pos"><option value="">Todas as posições</option>${POSITIONS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}</select>
        <select id="sort-by"><option value="overall">Ordenar: Overall</option><option value="idade">Ordenar: Idade</option><option value="valor">Ordenar: Valor de mercado</option><option value="nome">Ordenar: Nome</option></select>
        <input type="text" id="search-player" placeholder="Buscar jogador...">
      </div>
      <div class="panel-box" style="overflow-x:auto;">
        <table class="player-table">
          <thead><tr><th>#</th><th>Nome</th><th>Pos.</th><th>Idade</th><th>OVR</th><th>Pot.</th><th>Forma</th><th>Status</th><th>Valor</th><th>Contrato</th><th>Ações</th></tr></thead>
          <tbody id="elenco-tbody"></tbody>
        </table>
      </div>`;
  },
  bindElencoEvents(){
    const renderRows = () => {
      const c = Game.club;
      const posFilter = document.getElementById('filter-pos').value;
      const sortBy = document.getElementById('sort-by').value;
      const search = document.getElementById('search-player').value.toLowerCase();
      let list = [...c.jogadores];
      if (posFilter) list = list.filter(j => j.posicao === posFilter);
      if (search) list = list.filter(j => j.nomeCompleto.toLowerCase().includes(search));
      list.sort((a,b) => sortBy==='overall'?b.overall-a.overall : sortBy==='idade'?a.idade-b.idade : sortBy==='valor'?b.valorMercado-a.valorMercado : a.nomeCompleto.localeCompare(b.nomeCompleto));

      document.getElementById('elenco-tbody').innerHTML = list.map(j => {
        const ovrClass = j.overall >= 80 ? 'high' : j.overall >= 68 ? 'mid' : 'low';
        let status = `<span class="mini-bar"><span class="mini-bar__fill" style="width:${j.forma}%"></span></span>`;
        let statusTxt = j.emprestado ? `📤 Emprestado` : j.lesionado ? `🚑 Lesionado` : j.suspenso ? `🟨 Suspenso` : '✅ Disponível';
        return `<tr>
          <td>${j.numero}</td><td>${j.nomeCompleto}</td><td><span class="pos-badge">${j.posicao}</span></td><td>${j.idade}</td>
          <td><span class="ovr-badge ${ovrClass}">${j.overall}</span></td><td>${j.potencial}</td>
          <td>${status}</td><td style="font-size:.76rem;">${statusTxt}</td><td>${formatMoney(j.valorMercado)}</td><td>${j.contrato} ano(s)</td>
          <td class="row-actions">
            <button class="mini-btn" data-action="vender-jogador" data-id="${j.id}">Vender</button>
            <button class="mini-btn" data-action="emprestar-jogador" data-id="${j.id}" ${j.emprestado?'disabled':''}>Emprestar</button>
            <button class="mini-btn" data-action="renovar-jogador" data-id="${j.id}">Renovar</button>
          </td>
        </tr>`;
      }).join('');
    };
    document.getElementById('filter-pos').addEventListener('change', renderRows);
    document.getElementById('sort-by').addEventListener('change', renderRows);
    document.getElementById('search-player').addEventListener('input', renderRows);
    renderRows();
  },

  /* ---------- Mercado ---------- */
  buildMercado(){
    const leilao = Game.world.leilaoAtual;
    const jogadorLeilao = leilao ? [...Game.world.freeAgents].find(p => p.id === leilao.jogadorId) : null;
    return `
      <div class="page-head"><h2>Mercado de Transferências</h2><div class="sub">Orçamento disponível: ${formatMoney(Game.club.orcamento)}</div></div>

      ${jogadorLeilao ? `
      <div class="panel-box" style="border-color: var(--gold);">
        <h3>🔨 Leilão da Semana</h3>
        <div class="summary-card">
          <div class="summary-grid" style="flex:1;">
            <div>Jogador: <b>${jogadorLeilao.nomeCompleto}</b></div><div>Posição: <b>${jogadorLeilao.posicao}</b></div>
            <div>Idade: <b>${jogadorLeilao.idade}</b></div><div>Potencial: <b>${jogadorLeilao.potencial}</b></div>
            <div>Lance mínimo: <b>${formatMoney(leilao.lanceMinimo)}</b></div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="lance-input" placeholder="Seu lance (R$)" style="width:160px;">
            <button class="btn-primary" data-action="dar-lance">Dar Lance</button>
          </div>
        </div>
      </div>` : ''}

      <div class="squad-toolbar">
        <select id="mkt-filter-pos"><option value="">Todas as posições</option>${POSITIONS.map(p => `<option value="${p.id}">${p.nome}</option>`).join('')}</select>
        <select id="mkt-sort-by"><option value="overall">Ordenar: Overall</option><option value="valor">Ordenar: Valor</option><option value="idade">Ordenar: Idade</option><option value="potencial">Ordenar: Potencial</option></select>
        <label style="display:flex; align-items:center; gap:6px; font-size:.85rem; color:var(--text-mid);"><input type="checkbox" id="mkt-livres"> Somente agentes livres</label>
        <input type="text" id="mkt-search" placeholder="Buscar jogador...">
      </div>
      <div class="panel-box" style="overflow-x:auto;">
        <table class="player-table">
          <thead><tr><th>Nome</th><th>Pos.</th><th>Idade</th><th>OVR</th><th>Pot.</th><th>Clube</th><th>Valor</th><th>Ação</th></tr></thead>
          <tbody id="mercado-tbody"></tbody>
        </table>
      </div>`;
  },
  bindMercadoEvents(){
    const renderRows = () => {
      const posFilter = document.getElementById('mkt-filter-pos').value;
      const sortBy = document.getElementById('mkt-sort-by').value;
      const search = document.getElementById('mkt-search').value.toLowerCase();
      const somenteLivres = document.getElementById('mkt-livres').checked;

      let lista = listarMercado();
      if (posFilter) lista = lista.filter(x => x.player.posicao === posFilter);
      if (search) lista = lista.filter(x => x.player.nomeCompleto.toLowerCase().includes(search));
      if (somenteLivres) lista = lista.filter(x => x.livre);
      lista.sort((a,b) => sortBy==='overall'?b.player.overall-a.player.overall : sortBy==='valor'?b.player.valorMercado-a.player.valorMercado : sortBy==='potencial'?b.player.potencial-a.player.potencial : a.player.idade-b.player.idade);
      lista = lista.slice(0, 150);

      document.getElementById('mercado-tbody').innerHTML = lista.map(({player:j, origemId, origemNome, livre}) => {
        const ovrClass = j.overall >= 80 ? 'high' : j.overall >= 68 ? 'mid' : 'low';
        return `<tr>
          <td>${j.nomeCompleto}</td><td><span class="pos-badge">${j.posicao}</span></td><td>${j.idade}</td>
          <td><span class="ovr-badge ${ovrClass}">${j.overall}</span></td><td>${j.potencial}</td>
          <td>${livre ? '<em>Agente Livre</em>' : origemNome}</td><td>${formatMoney(j.valorMercado)}</td>
          <td><button class="mini-btn" data-action="comprar-jogador" data-id="${j.id}" data-origem="${origemId}">${livre?'Contratar':'Propor'}</button></td>
        </tr>`;
      }).join('') || '<tr><td colspan="8" style="text-align:center; color:var(--text-low);">Nenhum jogador encontrado.</td></tr>';
    };
    ['mkt-filter-pos','mkt-sort-by','mkt-search'].forEach(id => document.getElementById(id).addEventListener('input', renderRows));
    document.getElementById('mkt-livres').addEventListener('change', renderRows);
    renderRows();
  },

  /* ---------- Treinamento ---------- */
  buildTreinamento(){
    const c = Game.club;
    const jaTreinouHoje = c.treinoFeitoRodada === Game.world.rodadaAtual;
    const fadigaMedia = Math.round(c.jogadores.reduce((s,j)=>s+j.fadiga,0)/c.jogadores.length);
    return `
      <div class="page-head"><h2>Treinamento</h2><div class="sub">Fadiga média do elenco: ${fadigaMedia}% · Centro de Treinamento nível ${c.centroTreinamento.nivel}</div></div>
      ${jaTreinouHoje ? '<div class="coming-soon" style="padding:20px; margin-bottom:20px;">O elenco já treinou nesta rodada. Volte após a próxima partida.</div>' : ''}
      <div class="card-grid">
        ${TRAINING_TYPES.map(t => `
          <div class="stat-card">
            <div class="stat-card__label">${t.icon} ${t.nome}</div>
            <div class="stat-card__hint">Melhora o atributo relacionado do elenco todo</div>
            <button class="btn-secondary" style="margin-top:10px; width:100%;" data-action="treinar" data-tipo="${t.id}" ${jaTreinouHoje?'disabled':''}>Treinar</button>
          </div>`).join('')}
      </div>
      <div class="panel-box">
        <h3>Recuperação</h3>
        <p class="step-sub">Fadiga alta reduz o desempenho em partidas. Use a folga para recuperar o elenco.</p>
        <button class="btn-primary" data-action="descansar">🧘 Dar folga ao elenco</button>
      </div>
      <div class="panel-box">
        <h3>🏋️ Centro de Treinamento — Nível ${c.centroTreinamento.nivel}</h3>
        <p class="step-sub">Níveis mais altos aumentam o ganho de atributo em cada sessão de treino.</p>
        <button class="btn-secondary" data-action="melhorar-ct">⬆️ Melhorar Centro de Treinamento (${formatMoney(800_000 * c.centroTreinamento.nivel)})</button>
      </div>
      <div class="panel-box">
        <h3>👔 Comissão Técnica</h3>
        <div class="card-grid">
          ${Object.entries(STAFF_DEFS).map(([id, def]) => `
            <div class="stat-card ${c.comissao[id] ? 'gold' : ''}">
              <div class="stat-card__label">${def.icon} ${def.nome}</div>
              <div class="stat-card__hint">${def.desc}</div>
              <div class="stat-card__hint">${formatMoney(def.custoMensal)}/mês</div>
              ${c.comissao[id]
                ? `<button class="mini-btn" style="margin-top:10px; width:100%;" data-action="demitir-staff" data-tipo="${id}">Dispensar</button>`
                : `<button class="btn-secondary" style="margin-top:10px; width:100%;" data-action="contratar-staff" data-tipo="${id}">Contratar</button>`}
            </div>`).join('')}
        </div>
      </div>`;
  },

  /* ---------- Finanças ---------- */
  buildFinancas(){
    const c = Game.club;
    const receitas = c.financas.receitas.slice(-6);
    const despesas = c.financas.despesas.slice(-6);
    const maxVal = Math.max(1, ...receitas.map(r=>r.total), ...despesas.map(d=>d.total));
    const ultimaReceita = receitas[receitas.length-1]?.total ?? 0;
    const ultimaDespesa = despesas[despesas.length-1]?.total ?? 0;
    return `
      <div class="page-head"><h2>Finanças</h2><div class="sub">Saldo atual: ${formatMoney(c.orcamento)}</div></div>
      <div class="card-grid">
        <div class="stat-card"><div class="stat-card__label">Receita (último período)</div><div class="stat-card__value">${formatMoney(ultimaReceita)}</div></div>
        <div class="stat-card alert"><div class="stat-card__label">Despesa (último período)</div><div class="stat-card__value">${formatMoney(ultimaDespesa)}</div></div>
        <div class="stat-card gold"><div class="stat-card__label">Folha Salarial</div><div class="stat-card__value">${formatMoney(c.folhaSalarial)}</div></div>
        <div class="stat-card sky"><div class="stat-card__label">Patrocinador</div><div class="stat-card__value" style="font-size:1.1rem;">${c.sponsor ? c.sponsor.nome : 'Nenhum'}</div></div>
      </div>
      <div class="panel-box">
        <h3>Receitas x Despesas (últimos períodos)</h3>
        <div class="bar-chart">
          ${receitas.map((r,i) => `
            <div class="bar-chart__group">
              <div class="bar-chart__bars">
                <div class="bar-chart__bar receita" style="height:${Math.round(r.total/maxVal*100)}%" title="Receita: ${formatMoney(r.total)}"></div>
                <div class="bar-chart__bar despesa" style="height:${Math.round((despesas[i]?.total||0)/maxVal*100)}%" title="Despesa: ${formatMoney(despesas[i]?.total||0)}"></div>
              </div>
              <div class="bar-chart__label">${i+1}</div>
            </div>`).join('') || '<p style="color:var(--text-low);">Ainda não há histórico financeiro suficiente.</p>'}
        </div>
        <div style="display:flex; gap:16px; margin-top:10px; font-size:.78rem; color:var(--text-mid);">
          <span><span class="legend-dot receita"></span> Receita</span><span><span class="legend-dot despesa"></span> Despesa</span>
        </div>
      </div>
      <div class="panel-box">
        <h3>Patrocinadores</h3>
        ${c.sponsor ? `<p class="step-sub">Contrato ativo com <b style="color:var(--text-hi);">${c.sponsor.nome}</b>: ${formatMoney(c.sponsor.valorMensal)}/mês · ${c.sponsor.rodadasRestantes} rodadas restantes.</p>`
        : `<div class="card-grid">${Game.world.sponsorOfertasDisponiveis.map(o => `
            <div class="stat-card gold"><div class="stat-card__label">${o.nome}</div><div class="stat-card__value">${formatMoney(o.valorMensal)}/mês</div>
              <div class="stat-card__hint">Duração: ${o.duracaoTemporadas} temporada(s)</div>
              <button class="btn-secondary" style="margin-top:10px; width:100%;" data-action="aceitar-patrocinio" data-id="${o.id}">Aceitar</button>
            </div>`).join('')}</div>`}
      </div>
      <div class="panel-box">
        <h3>💼 Finanças Pessoais do Técnico</h3>
        <div class="card-grid">
          <div class="stat-card gold"><div class="stat-card__label">Patrimônio Pessoal</div><div class="stat-card__value">${formatMoney(c.patrimonioTreinador)}</div><div class="stat-card__hint">Acumulado na carreira</div></div>
          <div class="stat-card"><div class="stat-card__label">Último Salário Recebido</div><div class="stat-card__value">${formatMoney(c._ultimoSalarioTreinador || 0)}</div><div class="stat-card__hint">Base + bônus da loja e da receita do clube</div></div>
        </div>
        <p class="step-sub" style="margin-top:10px;">Seu salário pessoal cresce com sua reputação e com a receita do clube — principalmente a loja oficial. Vale a pena investir no estádio!</p>
      </div>`;
  },

  /* ---------- Estádio ---------- */
  buildEstadio(){
    const e = Game.club.estadio;
    return `
      <div class="page-head"><h2>Estádio</h2><div class="sub">${e.nome} · Capacidade ${e.capacidade.toLocaleString('pt-BR')}</div></div>
      <div class="card-grid">
        ${STADIUM_UPGRADES.map(u => {
          const nivelKey = 'nivel' + u.id[0].toUpperCase() + u.id.slice(1);
          const atual = u.tipo === 'nivel' ? (e[nivelKey]||1) : (e[u.id] ? 'Adquirido' : 'Não adquirido');
          const bloqueadoPorFama = u.requerHallDaFama && !Game.club.hallDaFama.length;
          const podeComprar = !bloqueadoPorFama && (u.tipo === 'flag' ? !e[u.id] : (e[nivelKey]||1) < u.max);
          return `<div class="stat-card">
            <div class="stat-card__label">${u.icon} ${u.nome}</div>
            <div class="stat-card__value" style="font-size:1.1rem;">${u.tipo==='nivel' ? 'Nível '+atual : atual}</div>
            <div class="stat-card__hint">${bloqueadoPorFama ? 'Requer um ídolo no Hall da Fama' : `Custo: ${formatMoney(u.custo)}`}</div>
            <button class="btn-secondary" style="margin-top:10px; width:100%;" data-action="melhorar-estadio" data-id="${u.id}" ${podeComprar?'':'disabled'}>${u.tipo==='flag' && e[u.id] ? 'Adquirido' : podeComprar ? 'Melhorar' : bloqueadoPorFama ? 'Bloqueado' : 'Nível máximo'}</button>
          </div>`;
        }).join('')}
      </div>
      <div class="panel-box">
        <h3>🏷️ Naming Rights</h3>
        <p class="step-sub">Venda o nome do estádio para um patrocinador em troca de um valor imediato e alto.</p>
        <button class="btn-primary" data-action="vender-naming" ${e.namingVendido ? 'disabled' : ''}>${e.namingVendido ? 'Já vendido nesta gestão' : 'Vender Naming Rights'}</button>
      </div>
      <div class="panel-box">
        <h3>🌟 Embaixador do Clube</h3>
        <p class="step-sub">${Game.club.embaixador ? `${Game.club.embaixador} é o embaixador oficial — as propostas de patrocínio ficam mais valiosas.` : 'Contrate uma personalidade para representar o clube e atrair patrocínios maiores.'}</p>
        <button class="btn-secondary" data-action="contratar-embaixador" ${Game.club.embaixador ? 'disabled' : ''}>${Game.club.embaixador ? 'Já contratado' : 'Contratar Embaixador (R$ 2M)'}</button>
      </div>`;
  },

  /* ---------- Academia ---------- */
  buildAcademia(){
    const c = Game.club;
    return `
      <div class="page-head"><h2>Academia de Base</h2><div class="sub">Nível ${c.academia.nivel}${c.academia.alojamento ? ' · 🏠 Com alojamento' : ''}</div></div>
      <div class="panel-box" style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="btn-primary" data-action="buscar-talentos">🔎 Buscar Talentos (${formatMoney(150_000*c.academia.nivel)})</button>
        <button class="btn-secondary" data-action="melhorar-academia">⬆️ Melhorar Academia (${formatMoney(1_000_000*c.academia.nivel)})</button>
        <button class="btn-secondary" data-action="construir-alojamento" ${c.academia.alojamento?'disabled':''}>🏠 ${c.academia.alojamento ? 'Alojamento construído' : 'Construir Alojamento (R$ 900K)'}</button>
      </div>
      <div class="panel-box">
        <h3>🔭 Foco de Observação</h3>
        <p class="step-sub">Direcione os olheiros para um país específico (afeta a nacionalidade dos talentos encontrados).</p>
        <select id="foco-olheiro-select">
          <option value="">Sem foco (usa o país do clube)</option>
          ${COUNTRIES.map(p => `<option value="${p}" ${c.olheiroFocoPais===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="card-grid">
        ${c.youthPlayers.map(j => `
          <div class="stat-card ${j.potencial>=85?'gold':''}">
            <div class="stat-card__label">${j.posicao} · ${j.idade} anos</div>
            <div class="stat-card__value" style="font-size:1.1rem;">${j.nomeCompleto}</div>
            <div class="stat-card__hint">Overall ${j.overall} · Potencial ${j.potencial}</div>
            <div style="display:flex; gap:8px; margin-top:10px;">
              <button class="mini-btn" data-action="promover-jovem" data-id="${j.id}">Promover</button>
              <button class="mini-btn" data-action="dispensar-jovem" data-id="${j.id}">Dispensar</button>
            </div>
          </div>`).join('') || '<p style="color:var(--text-low);">Nenhum jovem na academia. Busque novos talentos!</p>'}
      </div>`;
  },

  /* ---------- Calendário ---------- */
  buildCalendario(){
    const w = Game.world, c = Game.club;
    const jogosRodada = w.calendario.filter(j => j.rodada === w.rodadaAtual);
    const tabela = ordenarTabela();
    const temporadaEncerrada = w.rodadaAtual > w.totalRodadas;
    const formacaoSlots = FORMATIONS[c.formacaoAtual] || FORMATIONS['4-3-3'];
    const jogoDoJogador = jogosRodada.find(j => j.mandanteId === 'player' || j.visitanteId === 'player');
    const adversarioId = jogoDoJogador ? (jogoDoJogador.mandanteId === 'player' ? jogoDoJogador.visitanteId : jogoDoJogador.mandanteId) : null;

    return `
      <div class="page-head"><h2>Calendário</h2><div class="sub">Rodada ${Math.min(w.rodadaAtual,w.totalRodadas)}/${w.totalRodadas} · Temporada ${c.temporada}</div></div>

      ${!temporadaEncerrada && c.desafioSemanal ? `
      <div class="panel-box" style="border-color:var(--gold);">
        <h3>🎯 Desafio da Semana</h3>
        <p class="step-sub">${c.desafioSemanal.desc} — recompensa de ${formatMoney(c.desafioSemanal.recompensa)}${c.desafioSemanal.concluido ? ' <b style="color:var(--grass);">(concluído!)</b>' : ''}</p>
      </div>` : ''}

      ${!temporadaEncerrada && adversarioId ? (() => {
        const squadAdv = getSquad(adversarioId);
        const overallAdv = Math.round(overallOf(bestXI(squadAdv)));
        const overallMeu = Math.round(overallOf(bestXI(c.jogadores)));
        let pontoFraco = '';
        if (c.comissao.olheiroChefe){
          const xiAdv = bestXI(squadAdv);
          const medias = { defesa: overallOf(xiAdv.filter(p=>DEFENSOR_POS.includes(p.posicao))), ataque: overallOf(xiAdv.filter(p=>ATACANTE_POS.includes(p.posicao))) };
          pontoFraco = `<p class="step-sub">🔭 Seu olheiro-chefe indica: o ponto mais fraco do ${getClubeInfo(adversarioId).nome} é a ${medias.defesa < medias.ataque ? 'defesa' : 'linha de ataque'}.</p>`;
        }
        return `<div class="panel-box">
          <h3>🔍 Próximo Adversário: ${getClubeInfo(adversarioId).nome}</h3>
          <div class="stat-line"><span>${overallMeu}</span><b>Overall (melhor XI)</b><span>${overallAdv}</span></div>
          ${pontoFraco}
        </div>`;
      })() : ''}

      ${!temporadaEncerrada ? `
      <div class="panel-box">
        <h3>Escalação & Tática</h3>
        <div class="field"><label>Formação</label>
          <select id="form-select">${Object.keys(FORMATIONS).map(f => `<option value="${f}" ${f===c.formacaoAtual?'selected':''}>${f}</option>`).join('')}</select>
        </div>
        <button class="mini-btn" type="button" data-action="sugestao-escalacao" style="margin-top:8px;">🎯 Sugestão automática de escalação</button>
        <div class="lineup-grid" id="lineup-grid"></div>
        <div class="field-row" style="margin-top:14px;">
          <div class="field"><label>Capitão</label><select id="cap-select"></select></div>
          <div class="field"><label>Batedor de Pênalti</label><select id="pen-select"></select></div>
        </div>
        <div class="field"><label>Batedor de Falta</label><select id="falta-select"></select></div>
        <div class="field"><label>Estilo de Jogo (preset rápido)</label>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            ${Object.keys(ESTILOS_JOGO).map(nome => `<button class="mini-btn" type="button" data-action="aplicar-estilo" data-estilo="${nome}" style="${c.estiloAtual===nome?'border-color:var(--grass);color:var(--grass);':''}">${nome}</button>`).join('')}
          </div>
        </div>
        <div class="tatica-sliders">
          ${[['posse','Posse de Bola'],['pressao','Pressão'],['contraAtaque','Contra-Ataque'],['linhaDefensiva','Linha Defensiva'],['largura','Amplitude'],['ritmo','Ritmo'],['agressividade','Agressividade']].map(([k,label]) => `
            <div class="slider-field"><label>${label}: <span id="val-${k}">${c.tatica[k]}</span></label>
              <input type="range" min="0" max="100" value="${c.tatica[k]}" data-tatica="${k}"></div>`).join('')}
        </div>
        <button class="btn-primary" style="margin-top:16px;" data-action="simular-rodada">▶️ Simular Rodada</button>
        <button class="btn-secondary" style="margin-top:8px;" data-action="simular-temporada-inteira">⏩ Simular Temporada Inteira</button>
      </div>` : `<div class="coming-soon"><span class="icon">🏁</span><h3>Temporada encerrada</h3><p>Acesse o Dashboard para iniciar a próxima temporada automaticamente na próxima simulação.</p></div>`}

      <div class="panel-box">
        <h3>Jogos da rodada ${Math.min(w.rodadaAtual,w.totalRodadas)}</h3>
        <div class="fixtures-list">
          ${jogosRodada.map(j => `<div class="fixture-row ${j.mandanteId==='player'||j.visitanteId==='player'?'highlight':''}">
            <span>${getClubeInfo(j.mandanteId).nome}</span>
            <span class="fixture-score">${j.jogado ? `${j.golsMandante} - ${j.golsVisitante}` : 'vs'}</span>
            <span>${getClubeInfo(j.visitanteId).nome}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="panel-box" style="overflow-x:auto;">
        <h3>Tabela da ${nomeLigaAtual()}</h3>
        <table class="player-table">
          <thead><tr><th>#</th><th>Clube</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead>
          <tbody>${tabela.map((t,i) => `<tr class="${t.id==='player'?'row-player':''}"><td>${i+1}</td><td>${t.nome}</td><td><b>${t.pontos}</b></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp}</td><td>${t.gc}</td><td>${t.gp-t.gc}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;
  },
  bindCalendarioEvents(){
    const c = Game.club;
    const formSelect = document.getElementById('form-select');
    if (!formSelect) return;

    const renderLineup = () => {
      const slots = FORMATIONS[formSelect.value] || FORMATIONS['4-3-3'];
      const disponiveis = c.jogadores.filter(j => !j.lesionado && !j.suspenso && !j.emprestado);
      if (!c.escalacaoIds.length) c.escalacaoIds = bestXI(c.jogadores).map(p=>p.id);

      document.getElementById('lineup-grid').innerHTML = slots.map((posSugerida, i) => `
        <div class="field"><label>${posSugerida !== '?' ? posSugerida : 'Livre'} (${i+1})</label>
          <select data-slot="${i}">
            <option value="">—</option>
            ${disponiveis.map(j => `<option value="${j.id}" ${c.escalacaoIds[i]===j.id?'selected':''}>${j.nomeCompleto} (${j.posicao}, ${j.overall})</option>`).join('')}
          </select>
        </div>`).join('');

      document.querySelectorAll('[data-slot]').forEach(sel => sel.addEventListener('change', () => {
        const i = parseInt(sel.dataset.slot,10);
        c.escalacaoIds[i] = sel.value || null;
        renderCapPenFalta();
        Game.save();
      }));
      renderCapPenFalta();
    };

    const renderCapPenFalta = () => {
      const xiIds = c.escalacaoIds.filter(Boolean);
      const xi = xiIds.map(id => c.jogadores.find(j=>j.id===id)).filter(Boolean);
      const optHtml = (selectedId) => `<option value="">—</option>` + xi.map(j => `<option value="${j.id}" ${selectedId===j.id?'selected':''}>${j.nomeCompleto}</option>`).join('');
      document.getElementById('cap-select').innerHTML = optHtml(c.capitaoId);
      document.getElementById('pen-select').innerHTML = optHtml(c.batedorPenaltiId);
      document.getElementById('falta-select').innerHTML = optHtml(c.batedorFaltaId);
    };

    formSelect.addEventListener('change', () => { c.formacaoAtual = formSelect.value; c.escalacaoIds = []; renderLineup(); });
    document.getElementById('cap-select').addEventListener('change', e => { c.capitaoId = e.target.value || null; Game.save(); });
    document.getElementById('pen-select').addEventListener('change', e => { c.batedorPenaltiId = e.target.value || null; Game.save(); });
    document.getElementById('falta-select').addEventListener('change', e => { c.batedorFaltaId = e.target.value || null; Game.save(); });

    document.querySelectorAll('[data-tatica]').forEach(range => range.addEventListener('input', () => {
      const k = range.dataset.tatica;
      c.tatica[k] = parseInt(range.value,10);
      document.getElementById('val-'+k).textContent = range.value;
      Game.save();
    }));

    renderLineup();
  },

  simularRodadaComModal(){
    const simulados = simularJogosDaRodada();
    const jogoDoJogador = simulados.find(s => s.jogo.mandanteId === 'player' || s.jogo.visitanteId === 'player');

    if (Game.club.configModoJogavel && jogoDoJogador){
      this.abrirPartidaJogavel(simulados, jogoDoJogador);
      return;
    }

    const { fimDeTemporada, demitido } = commitRodada(simulados);
    this.exibirResultadoRodada(fimDeTemporada, demitido);
  },

  abrirPartidaJogavel(simulados, jogoDoJogador){
    const ehMandante = jogoDoJogador.jogo.mandanteId === 'player';
    const finalizacoesTime = ehMandante ? jogoDoJogador.res.estatisticas.finalizacoes[0] : jogoDoJogador.res.estatisticas.finalizacoes[1];
    const numMomentos = clamp(finalizacoesTime, 5, 9);
    const intervalo = Math.max(12, Math.floor(180 / numMomentos));

    this.openModal('', true);
    this.partidaJogavelState = {
      simulados, jogoDoJogador, ehMandante,
      tempoRestante: 180,
      momentosTotal: numMomentos,
      momentosUsados: 0,
      golsMarcados: 0,
      proximoMomentoEm: 5,
      emMomento: false,
      tempoMomento: 0,
      momentoAtual: null,
      feedback: null,
      feedbackTicks: 0,
      resolvido: false,
    };
    this.renderPartidaJogavel();
    clearInterval(this._partidaJogavelTimer);
    this._partidaJogavelTimer = setInterval(() => this.tickPartidaJogavel(), 1000);
  },

  tickPartidaJogavel(){
    const s = this.partidaJogavelState;
    if (!s || s.resolvido){ clearInterval(this._partidaJogavelTimer); return; }
    if (!document.querySelector('#active-modal')){ clearInterval(this._partidaJogavelTimer); this.finalizarPartidaJogavel(); return; }

    s.tempoRestante--;

    if (s.feedbackTicks > 0){
      s.feedbackTicks--;
    } else if (s.emMomento){
      s.tempoMomento--;
      if (s.tempoMomento <= 0) this.resolverMomentoJogavel(null);
    } else {
      s.proximoMomentoEm--;
      if (s.proximoMomentoEm <= 0 && s.momentosUsados < s.momentosTotal) this.iniciarMomentoJogavel();
    }

    const acabouMomentos = s.momentosUsados >= s.momentosTotal && !s.emMomento && s.feedbackTicks === 0;
    if (s.tempoRestante <= 0 || acabouMomentos){ this.finalizarPartidaJogavel(); return; }

    this.renderPartidaJogavel();
  },

  iniciarMomentoJogavel(){
    const s = this.partidaJogavelState;
    if (!s) return;
    s.momentoAtual = pick(MOMENTO_TIPOS);
    s.emMomento = true;
    s.tempoMomento = 6;
  },

  renderPartidaJogavel(){
    const box = document.querySelector('#active-modal .modal-box');
    const s = this.partidaJogavelState;
    if (!box || !s) return;

    if (s.feedbackTicks > 0 && s.feedback){
      box.innerHTML = `
        <div class="modal-head"><h3>${s.feedback.marcou ? '⚽ GOL!' : '❌ Não foi dessa vez'}</h3><span style="font-family:var(--font-mono); color:var(--gold);">${s.tempoRestante}s</span></div>
        <p class="step-sub">${s.feedback.texto}</p>
        <div style="text-align:center; font-size:1.1rem; margin-top:10px;">⚽ Seu time: <b style="color:var(--grass);">${s.golsMarcados}</b></div>`;
      return;
    }

    if (s.emMomento && s.momentoAtual){
      const m = s.momentoAtual;
      box.innerHTML = `
        <div class="modal-head"><h3>${m.icon} ${m.label}!</h3><span style="font-family:var(--font-mono); font-size:1.2rem; color:${s.tempoMomento<=2?'var(--alert)':'var(--gold)'};">${s.tempoMomento}s</span></div>
        <p class="step-sub">${m.instrucao}</p>
        <div style="display:flex; justify-content:center; gap:8px; margin:20px 0; flex-wrap:wrap;">
          ${m.opcoes.map((op,i) => `<button class="btn-primary" data-action="escolher-momento" data-idx="${i}" style="min-width:56px; padding:14px 10px; font-size:.95rem;">${op}</button>`).join('')}
        </div>
        <div style="text-align:center; font-size:1rem; color:var(--text-mid);">⚽ Seu time: <b style="color:var(--grass);">${s.golsMarcados}</b> · Lances: ${s.momentosUsados}/${s.momentosTotal}</div>`;
      return;
    }

    box.innerHTML = `
      <div class="modal-head"><h3>⚽ Partida em Andamento</h3><span style="font-family:var(--font-mono); color:var(--gold);">${s.tempoRestante}s</span></div>
      <p class="step-sub">Seu time troca passes no meio de campo, buscando o próximo lance perigoso...</p>
      <div style="text-align:center; font-size:1.1rem; margin:20px 0;">⚽ Seu time: <b style="color:var(--grass);">${s.golsMarcados}</b> · Lances: ${s.momentosUsados}/${s.momentosTotal}</div>
      <div class="mini-bar" style="width:100%; height:8px;"><span class="mini-bar__fill" style="width:${clamp(100 - (s.proximoMomentoEm/15*100), 0, 100)}%"></span></div>`;
  },

  resolverMomentoJogavel(escolhaIdx){
    const s = this.partidaJogavelState;
    if (!s || !s.emMomento || !s.momentoAtual) return;
    const m = s.momentoAtual;
    s.emMomento = false;
    s.momentosUsados++;
    const defesa = rnd(0, m.opcoes.length - 1);
    const marcou = escolhaIdx !== null && escolhaIdx !== defesa;
    if (marcou) s.golsMarcados++;

    if (escolhaIdx === null){
      s.feedback = { marcou:false, texto: `Você hesitou e perdeu o lance de ${m.label.toLowerCase()}.` };
    } else {
      s.feedback = { marcou, texto: marcou ? `${m.label} certeira! A bola morreu no fundo da rede.` : `O goleiro/defesa leu sua ${m.label.toLowerCase()} e evitou o gol.` };
    }
    s.feedbackTicks = 2;
    s.proximoMomentoEm = 10;
    s.momentoAtual = null;
    this.renderPartidaJogavel();
  },

  finalizarPartidaJogavel(){
    const s = this.partidaJogavelState;
    if (!s || s.resolvido) return;
    s.resolvido = true;
    clearInterval(this._partidaJogavelTimer);
    const { simulados, jogoDoJogador, ehMandante, golsMarcados } = s;
    if (ehMandante) jogoDoJogador.res.golsMandante = golsMarcados; else jogoDoJogador.res.golsVisitante = golsMarcados;
    this.partidaJogavelState = null;
    const { fimDeTemporada, demitido } = commitRodada(simulados);
    this.exibirResultadoRodada(fimDeTemporada, demitido);
  },

  exibirResultadoRodada(fimDeTemporada, demitido){
    if (demitido){
      const clubeAntigo = Game.club.nome;
      const ofertas = gerarNomesClubesPais(Game.club.pais, 3);
      this.toast(`Você foi demitido do ${clubeAntigo}.`, 'danger');
      UI.openModal(`
        <div class="modal-head"><h3>😔 Você foi demitido!</h3></div>
        <p class="step-sub">A diretoria do ${clubeAntigo} perdeu a confiança após os resultados recentes. Mas o mercado sabe do seu valor — escolha seu próximo desafio:</p>
        <div style="display:flex; flex-direction:column; gap:8px; margin-top:14px;">
          ${ofertas.map(nome => `<button class="btn-secondary" data-action="assumir-clube" data-nome="${nome}">${nome}</button>`).join('')}
        </div>`, true);
      return;
    }

    const resultadoJogador = Game.world.ultimoResultadoJogador;
    if (resultadoJogador){
      const golsM = resultadoJogador.golsMandante, golsV = resultadoJogador.golsVisitante;
      const nomeM = getClubeInfo(resultadoJogador.mandanteId).nome, nomeV = getClubeInfo(resultadoJogador.visitanteId).nome;
      const timeline = (resultadoJogador.eventos||[]).map(ev => {
        const icones = { gol:'⚽', escanteio:'🚩', impedimento:'🚫', cartao_amarelo:'🟨', cartao_vermelho:'🟥', lesao:'🚑', penalti_perdido:'❌' };
        let desc = '';
        if (ev.tipo === 'gol') desc = `GOL de ${ev.jogador}${ev.assistencia ? ' (assist. '+ev.assistencia+')' : ''}`;
        else if (ev.tipo === 'cartao_amarelo') desc = `Cartão amarelo para ${ev.jogador}`;
        else if (ev.tipo === 'cartao_vermelho') desc = `Cartão vermelho para ${ev.jogador}!`;
        else if (ev.tipo === 'lesao') desc = `${ev.jogador} sente uma lesão`;
        else if (ev.tipo === 'penalti_perdido') desc = `${ev.jogador} desperdiça grande chance`;
        else if (ev.tipo === 'escanteio') desc = 'Escanteio';
        else desc = 'Impedimento';
        return `<div class="timeline-row"><span class="timeline-min">${ev.minuto}'</span><span>${icones[ev.tipo]||'•'} ${desc}</span></div>`;
      }).join('') || '<p style="color:var(--text-low);">Partida sem grandes lances registrados.</p>';

      const st = resultadoJogador.estatisticas;
      const pergunta = perguntaEntrevista();
      const respostas = respostasParaPergunta(pergunta);
      UI.openModal(`
        <div class="modal-head"><h3>${nomeM} ${golsM} x ${golsV} ${nomeV}</h3><button class="btn-ghost" data-close-modal>✕</button></div>
        <div class="modal-stats">
          <div class="stat-line"><span>${st.posse[0]}%</span><b>Posse de bola</b><span>${st.posse[1]}%</span></div>
          <div class="stat-line"><span>${st.xg ? st.xg[0] : '-'}</span><b>xG (gols esperados)</b><span>${st.xg ? st.xg[1] : '-'}</span></div>
          <div class="stat-line"><span>${st.finalizacoes[0]}</span><b>Finalizações</b><span>${st.finalizacoes[1]}</span></div>
          <div class="stat-line"><span>${st.escanteios[0]}</span><b>Escanteios</b><span>${st.escanteios[1]}</span></div>
          <div class="stat-line"><span>${st.cartoes[0]}</span><b>Cartões</b><span>${st.cartoes[1]}</span></div>
          <div class="stat-line"><span>${st.defesas[0]}</span><b>Defesas</b><span>${st.defesas[1]}</span></div>
        </div>
        <div class="modal-timeline">${timeline}</div>
        <div style="margin-top:16px; border-top:1px solid var(--line-soft); padding-top:12px;">
          <p class="step-sub">🎙️ ${pergunta}</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${respostas.map(r => `<button class="mini-btn" data-action="entrevista" data-tipo="${r.tipo}">${r.label}</button>`).join('')}
          </div>
        </div>
        <button class="btn-secondary" style="margin-top:12px; width:100%;" data-action="abrir-minijogo">🎮 Desafio do Patrocinador (mini-jogo, 60s)</button>
        <button class="mini-btn" style="margin-top:10px; width:100%;" data-action="ouvir-resumo">🔊 Ouvir resumo da partida</button>
        <button class="btn-primary" style="margin-top:10px; width:100%;" data-close-modal>Continuar</button>`, true);

      if (golsM !== golsV && ((resultadoJogador.mandanteId==='player' && golsM>golsV) || (resultadoJogador.visitanteId==='player' && golsV>golsM))) this.confetti(40);
    } else {
      this.toast('Rodada simulada.', 'ok');
    }
    if (fimDeTemporada){ this.toast('Fim de temporada! Uma nova temporada já começou.', 'ok'); this.confetti(100); }
    this.renderAppScreen('calendario');
  },

  /* ---------- Competições ---------- */
  buildCompeticoes(){
    const w = Game.world;
    const copa = w.copa, superc = w.supercopa, inter = w.internacional, mundial = w.mundial;
    return `
      <div class="page-head"><h2>Competições</h2><div class="sub">${nomeCopa()} · Supercopa · Torneio Internacional · Mundial de Clubes</div></div>

      <div class="panel-box">
        <h3>⚔️ Rival / Clássico</h3>
        <p class="step-sub">Escolha um clube rival: vencê-lo dá bônus extra de moral e reputação.</p>
        <select id="rival-select">
          <option value="">Nenhum rival escolhido</option>
          ${w.clubes.filter(c => !c.isPlayer).map(c => `<option value="${c.id}" ${Game.club.rivalId===c.id?'selected':''}>${c.nome}</option>`).join('')}
        </select>
      </div>

      <div class="panel-box">
        <h3>🏆 ${nomeCopa()}</h3>
        ${!copa ? `<button class="btn-primary" data-action="iniciar-copa">Sortear e Iniciar Copa</button>` :
          copa.fase === 'concluida' ? `<p class="step-sub">Campeão: <b style="color:var(--text-hi);">${getClubeInfo(copa.campeaoId).nome}</b></p><button class="btn-secondary" data-action="iniciar-copa">Iniciar nova edição</button>` :
          `<p class="step-sub">Fase atual: <b style="color:var(--text-hi);">${copa.fase}</b> (${copa.chave.length} jogos)</p>
           <div class="fixtures-list">${copa.chave.map(j => `<div class="fixture-row ${j.mandanteId==='player'||j.visitanteId==='player'?'highlight':''}"><span>${getClubeInfo(j.mandanteId).nome}</span><span class="fixture-score">${j.vencedorId ? j.golsMandante+' - '+j.golsVisitante : 'vs'}</span><span>${getClubeInfo(j.visitanteId).nome}</span></div>`).join('')}</div>
           <button class="btn-primary" style="margin-top:10px;" data-action="simular-fase-copa">Simular Fase</button>`}
      </div>

      <div class="panel-box">
        <h3>🥈 Supercopa</h3>
        ${superc ? `<p class="step-sub">${getClubeInfo(superc.mandanteId).nome} ${superc.golsMandante} x ${superc.golsVisitante} ${getClubeInfo(superc.visitanteId).nome} — Campeão: <b style="color:var(--text-hi);">${getClubeInfo(superc.vencedorId).nome}</b></p>`
        : `<p class="step-sub">Disputada entre o campeão da ${nomeLiga()} e o campeão da ${nomeCopa()}.</p><button class="btn-secondary" data-action="jogar-supercopa">Disputar Supercopa</button>`}
      </div>

      <div class="panel-box">
        <h3>🌍 Torneio Internacional</h3>
        ${!inter ? `<p class="step-sub">${elegivelInternacional() ? 'Seu clube se classificou! Dispute o torneio contra clubes estrangeiros.' : `Termine entre os 4 primeiros da ${nomeLiga()} ou vença a ${nomeCopa()} para se classificar.`}</p>
          <button class="btn-primary" data-action="iniciar-internacional" ${elegivelInternacional() ? '' : 'disabled'}>Iniciar Torneio</button>`
        : inter.fase === 'concluida' ? `<p class="step-sub">Campeão: <b style="color:var(--text-hi);">${getClubeInfo(inter.campeaoId).nome}</b></p>`
        : `<p class="step-sub">Fase atual: <b style="color:var(--text-hi);">${inter.fase}</b></p>
           <div class="fixtures-list">${inter.chave.map(j => `<div class="fixture-row ${j.mandanteId==='player'||j.visitanteId==='player'?'highlight':''}"><span>${getClubeInfo(j.mandanteId).nome}</span><span class="fixture-score">${j.vencedorId ? j.golsMandante+' - '+j.golsVisitante : 'vs'}</span><span>${getClubeInfo(j.visitanteId).nome}</span></div>`).join('')}</div>
           <button class="btn-primary" style="margin-top:10px;" data-action="simular-fase-internacional">Simular Fase</button>`}
      </div>

      <div class="panel-box">
        <h3>🌐 Mundial de Clubes</h3>
        ${mundial ? `<p class="step-sub">Resultado: ${mundial.golsMandante} x ${mundial.golsVisitante} vs ${mundial.adversario} — ${mundial.venceu ? '<b style="color:var(--grass);">Título conquistado!</b>' : 'Vice-campeão.'}</p>`
        : `<p class="step-sub">Disponível após vencer o Torneio Internacional.</p><button class="btn-secondary" data-action="jogar-mundial">Disputar Mundial</button>`}
      </div>

      <div class="panel-box" style="border-color: var(--gold);">
        <h3>🌍 Seleção Nacional de ${Game.club.pais}</h3>
        ${!Game.club.selecao?.ativo ? `
          <p class="step-sub">Reputação atual: <b style="color:var(--text-hi);">${Game.club.reputacao}/100</b> (mínimo ${REPUTACAO_MINIMA_SELECAO} para o convite).</p>
          <div class="mini-bar" style="width:100%; height:8px; margin:10px 0;"><span class="mini-bar__fill" style="width:${Game.club.reputacao}%"></span></div>
          <button class="btn-primary" data-action="aceitar-convite-selecao" ${Game.club.reputacao >= REPUTACAO_MINIMA_SELECAO ? '' : 'disabled'}>Aceitar Convite da Seleção</button>`
        : !w.copaDoMundoSelecoes ? `
          <p class="step-sub">Você comanda a Seleção de ${Game.club.pais} em paralelo ao clube. Convoque os melhores jogadores dessa nacionalidade e dispute a Copa do Mundo.</p>
          <button class="btn-primary" data-action="iniciar-copa-selecoes">Convocar e Iniciar Copa do Mundo</button>`
        : w.copaDoMundoSelecoes.fase === 'concluida' ? `
          <p class="step-sub">Campeão: <b style="color:var(--text-hi);">${getClubeInfo(w.copaDoMundoSelecoes.campeaoId).nome}</b></p>
          <button class="btn-secondary" data-action="iniciar-copa-selecoes">Nova convocação</button>`
        : `<p class="step-sub">Fase atual: <b style="color:var(--text-hi);">${w.copaDoMundoSelecoes.fase}</b></p>
           <div class="fixtures-list">${w.copaDoMundoSelecoes.chave.map(j => `<div class="fixture-row ${j.mandanteId==='selecao-jogador'||j.visitanteId==='selecao-jogador'?'highlight':''}"><span>${getClubeInfo(j.mandanteId).nome}</span><span class="fixture-score">${j.vencedorId ? j.golsMandante+' - '+j.golsVisitante : 'vs'}</span><span>${getClubeInfo(j.visitanteId).nome}</span></div>`).join('')}</div>
           <button class="btn-primary" style="margin-top:10px;" data-action="simular-fase-selecoes">Simular Fase</button>`}
      </div>

      <div class="panel-box">
        <h3>🏅 Vitrine de Conquistas</h3>
        <div class="card-grid">
          ${Game.club.conquistas.length ? Game.club.conquistas.map(c => `<div class="stat-card gold"><div class="stat-card__label">Temporada ${c.temporada}</div><div class="stat-card__value" style="font-size:1rem;">${c.nome}</div></div>`).join('') : '<p style="color:var(--text-low);">Nenhum título ainda. Boa sorte, treinador!</p>'}
        </div>
      </div>`;
  },
  bindCompeticoesEvents(){
    const sel = document.getElementById('rival-select');
    if (sel) sel.addEventListener('change', () => escolherRival(sel.value || null));
  },
  bindAcademiaEvents(){
    const sel = document.getElementById('foco-olheiro-select');
    if (sel) sel.addEventListener('change', () => definirFocoOlheiro(sel.value || null));
  },

  /* ---------- Histórico ---------- */
  buildHistorico(){
    const c = Game.club;
    const artilheirosClube = [...c.jogadores].sort((a,b)=>b.golsClube-a.golsClube).slice(0,5).filter(j=>j.golsClube>0);
    return `
      <div class="page-head"><h2>Histórico</h2><div class="sub">${c.nome} desde ${c.fundadoEm}</div></div>
      <div class="card-grid">
        <div class="stat-card"><div class="stat-card__label">Temporadas</div><div class="stat-card__value">${c.temporada}</div></div>
        <div class="stat-card gold"><div class="stat-card__label">Títulos</div><div class="stat-card__value">${c.conquistas.length}</div></div>
        <div class="stat-card sky"><div class="stat-card__label">Jogos (V-E-D)</div><div class="stat-card__value" style="font-size:1.1rem;">${c.estatisticasCarreira.vitorias}-${c.estatisticasCarreira.empates}-${c.estatisticasCarreira.derrotas}</div></div>
        <div class="stat-card alert"><div class="stat-card__label">Gols Marcados/Sofridos</div><div class="stat-card__value" style="font-size:1.1rem;">${c.estatisticasCarreira.golsMarcados}/${c.estatisticasCarreira.golsSofridos}</div></div>
      </div>
      <div class="panel-box"><h3>Artilheiros históricos do clube</h3>
        <ul style="list-style:none; padding:0; color:var(--text-mid); font-size:.86rem; line-height:2;">
          ${artilheirosClube.map(j => `<li>⚽ ${j.nomeCompleto} — ${j.golsClube} gols</li>`).join('') || '<li>Nenhum gol registrado ainda.</li>'}
        </ul>
      </div>
      <div class="panel-box"><h3>🎉 Hall da Fama</h3>
        <div class="card-grid">
          ${c.hallDaFama.length ? c.hallDaFama.map(j => `<div class="stat-card gold"><div class="stat-card__label">${j.posicao}</div><div class="stat-card__value" style="font-size:1rem;">${j.nome}</div><div class="stat-card__hint">${j.golsClube} gols · ${j.assistenciasClube} assistências</div></div>`).join('') : '<p style="color:var(--text-low);">Nenhum ídolo se aposentou ainda.</p>'}
        </div>
      </div>
      <div class="panel-box"><h3>Linha do tempo</h3>
        <ul style="margin:0; padding-left:18px; color:var(--text-mid); font-size:.86rem; line-height:1.9;">
          ${c.historico.slice().reverse().map(h => `<li>${h.ano} — ${h.evento}</li>`).join('')}
        </ul>
      </div>
      <div class="panel-box"><h3>Conquistas desbloqueadas (${c.achievementsUnlocked.length}/${ACHIEVEMENTS.length})</h3>
        <div class="card-grid">
          ${ACHIEVEMENTS.map(a => `<div class="stat-card ${c.achievementsUnlocked.includes(a.id)?'gold':''}" style="opacity:${c.achievementsUnlocked.includes(a.id)?1:.4}">
            <div class="stat-card__label">${a.icon} ${a.nome}</div><div class="stat-card__hint">${a.desc}</div>
          </div>`).join('')}
        </div>
      </div>`;
  },

  /* ---------- Configurações (in-app) ---------- */
  buildConfiguracoes(){
    const c = Game.club;
    return `
      <div class="page-head"><h2>Configurações</h2></div>
      <div class="settings-list">
        <label class="settings-row"><span>🎮 Modo jogável: dispute o lance decisivo em jogos apertados (diferença de até 1 gol)</span><input type="checkbox" id="opt-modo-jogavel" ${c.configModoJogavel?'checked':''}></label>
        <label class="settings-row"><span>Usar sempre a última escalação automaticamente</span><input type="checkbox" id="opt-auto-lineup" checked></label>
        <label class="settings-row"><span>Animações reduzidas</span><input type="checkbox" id="opt-reduced-motion-app"></label>
      </div>
      <div class="panel-box">
        <h3>💾 Backup da Carreira</h3>
        <p class="step-sub">Exporte sua carreira como um arquivo para guardar ou transferir de computador. Importar substitui a carreira atual.</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn-secondary" data-action="exportar-save">⬇️ Exportar Save (.json)</button>
          <button class="btn-secondary" data-action="disparar-importar-save">⬆️ Importar Save (.json)</button>
          <input type="file" id="input-importar-save" accept="application/json" style="display:none;">
        </div>
      </div>
      <div class="settings-list">
        <button class="btn-danger" data-action="wipe-save">🗑️ Apagar carreira e voltar ao menu</button>
      </div>`;
  },
  bindConfiguracoesEvents(){
    const chk = document.getElementById('opt-modo-jogavel');
    if (chk) chk.addEventListener('change', () => {
      Game.club.configModoJogavel = chk.checked;
      Game.save();
      this.toast(chk.checked ? 'Modo jogável ativado! Jogos apertados terão um lance decisivo.' : 'Modo jogável desativado.', 'ok');
    });
    const inputImportar = document.getElementById('input-importar-save');
    if (inputImportar) inputImportar.addEventListener('change', (e) => this.importarSaveArquivo(e.target.files[0]));
  },
};

/* =====================================================================
   18. BOOT
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  window.addEventListener('beforeunload', () => { if (Game.club) Game.save(); });
});
