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
];

const SPONSOR_NAMES = [
  'TechCorp','Aviação Azul','Banco Sul','Cervejaria Real','Refrigerantes Nova',
  'Seguradora Prime','Telecom Norte','Energia Solar+','AutoMundo','Moda Elite',
  'Laticínios Vale','Combustíveis União'
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
];

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
      _bonusTemporario: 0,
    };

    this.academia = { nivel: 1 };
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
    this.tatica = { posse: 50, pressao: 50, contraAtaque: 50, linhaDefensiva: 50 };
    this.treinoFeitoRodada = 0;

    this.estatisticasCarreira = {
      vitorias: 0, empates: 0, derrotas: 0,
      golsMarcados: 0, golsSofridos: 0,
      sequenciaInvicta: 0, maiorSequenciaInvicta: 0,
      gastoTransferencias: 0, receitaTransferencias: 0,
      promovidosAcademia: 0,
    };
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

function gerarClubeIA(nome, paisPreferencial){
  const squad = SQUAD_TEMPLATE_AI.map(pos => new Player(pos, { paisPreferencial }));
  assignNumeros(squad);
  return {
    id: uid(),
    nome,
    pais: paisPreferencial,
    escudoId: rnd(0, CREST_DEFS.length - 1),
    isPlayer: false,
    squadRef: squad,
    orcamento: rnd(5_000_000, 30_000_000),
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
  return shuffle(SPONSOR_NAMES).slice(0, 4).map(nome => ({
    id: uid(), nome,
    valorMensal: rnd(80_000, 900_000),
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
  return c;
}
function getClubeInfo(clubId){
  if (clubId === 'player') return { nome: Game.club.nome, escudoId: Game.club.escudoId };
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
  return 1 + ((tatica.pressao - 50) / 500) + ((tatica.posse - 50) / 700);
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
  const forcaM = overallOf(mandanteInfo.xi) * taticaFator(mandanteInfo.tatica) * 1.06;
  const forcaV = overallOf(visitanteInfo.xi) * taticaFator(visitanteInfo.tatica);
  const total = forcaM + forcaV || 1;
  const probM = forcaM / total;

  const chances = rnd(9, 16);
  const eventos = [];
  let golsM = 0, golsV = 0, finM = 0, finV = 0, escM = 0, escV = 0, cartM = 0, cartV = 0, defM = 0, defV = 0;
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

    if (Math.random() < 0.10){
      const m2 = minuto();
      const ladoFalta = timeM ? visitanteInfo.xi : mandanteInfo.xi;
      const faltoso = pick(ladoFalta);
      if (faltoso){
        const vermelho = Math.random() < 0.08;
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
    },
  };
}

/* =====================================================================
   7. CALENDÁRIO / TABELA / RODADAS
   ===================================================================== */

function taticaNeutra(){ return { posse:50, pressao:50, contraAtaque:50, linhaDefensiva:50 }; }

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
    stats.golsMarcados += golsPro; stats.golsSofridos += golsContra;
    if (golsPro > golsContra){ stats.vitorias++; stats.sequenciaInvicta++; Game.club.addNoticia(`Vitória por ${golsPro}x${golsContra}!`, '✅'); }
    else if (golsPro < golsContra){ stats.derrotas++; stats.sequenciaInvicta = 0; Game.club.addNoticia(`Derrota por ${golsContra}x${golsPro}.`, '❌'); }
    else { stats.empates++; stats.sequenciaInvicta++; Game.club.addNoticia(`Empate em ${golsPro}x${golsContra}.`, '➖'); }
    stats.maiorSequenciaInvicta = Math.max(stats.maiorSequenciaInvicta, stats.sequenciaInvicta);
  }
}

function ordenarTabela(){
  const t = Game.world.tabela;
  return Object.keys(t)
    .map(id => ({ id, ...t[id], nome: getClubeInfo(id).nome, escudoId: getClubeInfo(id).escudoId }))
    .sort((a,b) => b.pontos - a.pontos || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp);
}

function simularRodada(){
  const w = Game.world;
  const jogosRodada = w.calendario.filter(j => j.rodada === w.rodadaAtual && !j.jogado);
  let resultadoJogador = null;

  jogosRodada.forEach(jogo => {
    const squadM = getSquad(jogo.mandanteId), squadV = getSquad(jogo.visitanteId);
    const xiM = jogo.mandanteId === 'player' ? getXIDoJogador() : bestXI(squadM);
    const xiV = jogo.visitanteId === 'player' ? getXIDoJogador() : bestXI(squadV);
    const tatM = jogo.mandanteId === 'player' ? Game.club.tatica : taticaNeutra();
    const tatV = jogo.visitanteId === 'player' ? Game.club.tatica : taticaNeutra();

    const res = simulateMatch({ xi: xiM, tatica: tatM }, { xi: xiV, tatica: tatV });
    Object.assign(jogo, { golsMandante: res.golsMandante, golsVisitante: res.golsVisitante, eventos: res.eventos, estatisticas: res.estatisticas, jogado: true });
    atualizarTabela(jogo);
    if (jogo.mandanteId === 'player' || jogo.visitanteId === 'player') resultadoJogador = jogo;
  });

  w.ultimoResultadoJogador = resultadoJogador;
  w.rodadaAtual++;
  Game.club.treinoFeitoRodada = 0;

  processarLesoes();
  processarFinancasMensal();
  rolarEventoAleatorio();
  verificarConquistas();

  let fimDeTemporada = false;
  if (w.rodadaAtual > w.totalRodadas){ finalizarTemporada(); fimDeTemporada = true; }

  Game.save();
  return { resultadoJogador, fimDeTemporada };
}

function processarLesoes(){
  Game.club.jogadores.forEach(j => {
    j.lesoes.forEach(l => l.rodadasRestantes = Math.max(0, l.rodadasRestantes - 1));
    j.lesoes = j.lesoes.filter(l => l.rodadasRestantes > 0);
    j.fadiga = clamp(j.fadiga - 6, 0, 100);
    if (j.emprestado){
      j.rodadasEmprestimoRestantes--;
      if (j.rodadasEmprestimoRestantes <= 0){ j.emprestado = false; j.clubeEmprestimoNome = null; Game.club.addNoticia(`${j.nomeCompleto} retornou de empréstimo.`, '↩️'); }
    }
  });
}

/* =====================================================================
   8. FINANÇAS / PATROCINADORES
   ===================================================================== */

function processarFinancasMensal(){
  const c = Game.club;
  const capacidade = c.estadio.capacidade;
  const bonusEstadio = (c.estadio.loja?0.08:0) + (c.estadio.restaurante?0.06:0) + (c.estadio.estacionamento?0.05:0) + (c.estadio.museu?0.04:0);
  const publico = Math.round(capacidade * clamp(0.45 + (c.moralElenco-50)/150, 0.2, 0.95) * (1 + (c.estadio._bonusTemporario||0)));
  const ingressos = Math.round(publico * 45 * (1+bonusEstadio));
  const loja = c.estadio.loja ? rnd(20_000, 90_000) : rnd(4_000, 15_000);
  const tv = rnd(120_000, 320_000);
  const premiacao = 0;
  const patrocinio = c.sponsor ? c.sponsor.valorMensal : 0;

  const salarios = c.folhaSalarial;
  const impostos = Math.round((ingressos + loja + tv + patrocinio) * 0.12);
  const manutencao = Math.round(20_000 + capacidade * 2.2);

  const receitaTotal = ingressos + loja + tv + patrocinio + premiacao;
  const despesaTotal = salarios + impostos + manutencao;

  c.financas.receitas.push({ periodo: c.temporada + '-' + Game.world.rodadaAtual, ingressos, loja, tv, patrocinio, premiacao, total: receitaTotal });
  c.financas.despesas.push({ periodo: c.temporada + '-' + Game.world.rodadaAtual, salarios, impostos, manutencao, total: despesaTotal });
  if (c.financas.receitas.length > 24) c.financas.receitas.shift();
  if (c.financas.despesas.length > 24) c.financas.despesas.shift();

  c.orcamento += (receitaTotal - despesaTotal);
  c.estadio._bonusTemporario = 0;

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
  if (!confirm(`Vender ${jogador.nomeCompleto} por ${formatMoney(oferta)}?`)) return;
  Game.club.jogadores.splice(idx, 1);
  Game.club.orcamento += oferta;
  Game.club.estatisticasCarreira.receitaTransferencias += oferta;
  const destino = pick(Game.world.clubes.filter(c => !c.isPlayer));
  if (destino) destino.squadRef.push(jogador);
  Game.club.addNoticia(`${jogador.nomeCompleto} foi vendido por ${formatMoney(oferta)}.`, '💸');
  UI.toast(`${jogador.nomeCompleto} vendido por ${formatMoney(oferta)}.`, 'ok');
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
  Game.club.jogadores.forEach(j => {
    if (j.emprestado) return;
    j.atributos[tipo.attr] = clamp(j.atributos[tipo.attr] + rnd(1,3), 1, Math.min(99, j.potencial + 3));
    j.fadiga = clamp(j.fadiga + rnd(8,15), 0, 100);
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

/* =====================================================================
   12. ACADEMIA DE BASE
   ===================================================================== */

function buscarTalentos(){
  const custo = 150_000 * Game.club.academia.nivel;
  if (Game.club.orcamento < custo) return UI.toast('Orçamento insuficiente para a busca por talentos.', 'danger');
  Game.club.orcamento -= custo;
  const qtd = rnd(1,3);
  for (let i=0;i<qtd;i++){
    const potMin = 55 + Game.club.academia.nivel * 5;
    const jovem = new Player(pick(POSITIONS).id, { idade: rnd(15,18), potencial: clamp(rnd(potMin, 99), 55, 99), paisPreferencial: Game.club.pais });
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
  w.ultimoCampeaoLiga = campeaoId;

  if (campeaoId === 'player'){
    Game.club.conquistas.push({ tipo:'liga', nome:`Campeão ${nomeLiga()}`, temporada: Game.club.temporada });
    Game.club.addNoticia('CAMPEÃO DA SÉRIE A! Uma temporada histórica.', '🏆');
    UI.confetti(140);
  } else {
    const pos = tabelaFinal.findIndex(t => t.id === 'player') + 1;
    Game.club.addNoticia(`Temporada encerrada em ${pos}º lugar na ${nomeLiga()}.`, '🏁');
  }

  // Prêmios da temporada
  const artilheiro = [...Game.club.jogadores].sort((a,b)=>b.golsTemporada-a.golsTemporada)[0];
  const melhorAtaqueId = tabelaFinal.reduce((best,c)=> c.gp > (best?.gp ?? -1) ? c : best, null)?.id;
  const melhorDefesaId = tabelaFinal.reduce((best,c)=> c.gc < (best?.gc ?? Infinity) ? c : best, null)?.id;
  if (melhorAtaqueId === 'player') Game.club.premiosTemporada.push({ tipo:'melhor_ataque', temporada: Game.club.temporada });
  if (melhorDefesaId === 'player') Game.club.premiosTemporada.push({ tipo:'melhor_defesa', temporada: Game.club.temporada });
  if (artilheiro && artilheiro.golsTemporada > 0) Game.club.addNoticia(`Artilheiro do clube na temporada: ${artilheiro.nomeCompleto} (${artilheiro.golsTemporada} gols).`, '🎯');

  // Envelhecimento e reset de stats de temporada
  Game.club.jogadores.forEach(j => { j.envelhecer(); j.resetarTemporada(); });
  w.freeAgents.forEach(j => j.envelhecer());
  w.clubes.filter(c=>!c.isPlayer).forEach(c => c.squadRef.forEach(j => { j.envelhecer(); j.resetarTemporada(); }));

  // Renovação de 3 clubes mais fracos (fluxo Série B)
  const fracos = tabelaFinal.filter(t => t.id !== 'player').sort((a,b)=>a.pontos-b.pontos).slice(0,3);
  fracos.forEach(f => {
    const clube = w.clubes.find(c => c.id === f.id);
    if (clube){ clube.squadRef = SQUAD_TEMPLATE_AI.map(pos => new Player(pos, { paisPreferencial: clube.pais })); assignNumeros(clube.squadRef); clube.recemPromovido = true; }
  });

  // Reset de temporada
  Game.club.temporada++;
  w.clubes.forEach(c => w.tabela[c.id] = { pontos:0, v:0, e:0, d:0, gp:0, gc:0, j:0 });
  w.calendario = gerarCalendario(w.clubes.map(c => c.id));
  w.rodadaAtual = 1;
  w.totalRodadas = Math.max(...w.calendario.map(j => j.rodada));
  w.copa = null; w.supercopa = null; w.internacional = null;

  Game.club.historico.push({ ano: Game.club.fundadoEm + Game.club.temporada - 1, evento: campeaoId === 'player' ? `Campeão ${nomeLiga()}` : `${tabelaFinal.findIndex(t=>t.id==='player')+1}º lugar na ${nomeLiga()}` });

  verificarConquistas();
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
    Game.club.addNoticia('CAMPEÃO MUNDIAL DE CLUBES! 🌐🏆', '🌐');
    UI.confetti(200);
  } else {
    Game.club.addNoticia(`Perdemos a final do Mundial para o ${rival.nome}.`, '🌐');
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
    };
  },
  _deserializeWorld(data){
    if (!data) return null;
    return {
      ...data,
      clubes: data.clubes.map(c => c.isPlayer ? c : { ...c, squadRef: c.squadRef.map(Player.fromJSON) }),
      freeAgents: data.freeAgents.map(Player.fromJSON),
      internacional: data.internacional ? { ...data.internacional, rivais: (data.internacional.rivais||[]).map(c => ({ ...c, squadRef: c.squadRef.map(Player.fromJSON) })) } : null,
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
    };

    c.pais ??= (COUNTRIES.includes(c.pais) ? c.pais : 'Brasil');
    c.moralElenco ??= 78;
    c.academia = c.academia || { nivel: 1 };
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
    c.tatica = c.tatica || { posse:50, pressao:50, contraAtaque:50, linhaDefensiva:50 };
    c.treinoFeitoRodada ??= 0;
    c.estatisticasCarreira = c.estatisticasCarreira || {
      vitorias:0, empates:0, derrotas:0, golsMarcados:0, golsSofridos:0,
      sequenciaInvicta:0, maiorSequenciaInvicta:0, gastoTransferencias:0, receitaTransferencias:0, promovidosAcademia:0,
    };
    c.estadio = c.estadio || { nome:`Estádio Municipal de ${c.cidade}`, capacidade: 8000 };
    c.estadio.nivelGramado ??= 1; c.estadio.nivelIluminacao ??= 1; c.estadio.nivelArquibancada ??= 1;
    c.estadio.museu ??= false; c.estadio.loja ??= false; c.estadio.restaurante ??= false;
    c.estadio.estacionamento ??= false; c.estadio.academiaMedica ??= false; c.estadio._bonusTemporario ??= 0;

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
      w.copa ??= null; w.supercopa ??= null; w.internacional ??= null; w.mundial ??= null;
      w.ultimoResultadoJogador ??= null; w.ultimoCampeaoLiga ??= null; w.ultimoCampeaoCopa ??= null;
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
  closeModal(){ const m = document.getElementById('active-modal'); if (m) m.remove(); },

  /* =========================================================
     EVENTOS ESTÁTICOS
     ========================================================= */
  bindStaticEvents(){
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

        /* ---- Treinamento ---- */
        case 'treinar': treinarElenco(actionEl.dataset.tipo); break;
        case 'descansar': descansarElenco(); break;

        /* ---- Finanças ---- */
        case 'aceitar-patrocinio': aceitarPatrocinio(actionEl.dataset.id); break;

        /* ---- Estádio ---- */
        case 'melhorar-estadio': melhorarEstadio(actionEl.dataset.id); break;

        /* ---- Academia ---- */
        case 'buscar-talentos': buscarTalentos(); break;
        case 'promover-jovem': promoverJovem(actionEl.dataset.id); break;
        case 'dispensar-jovem': dispensarJovem(actionEl.dataset.id); break;
        case 'melhorar-academia': melhorarAcademia(); break;

        /* ---- Calendário / Partida ---- */
        case 'simular-rodada': this.simularRodadaComModal(); break;

        /* ---- Competições ---- */
        case 'iniciar-copa': iniciarCopaNacional(); break;
        case 'simular-fase-copa': simularFaseCopa(); break;
        case 'jogar-supercopa': jogarSupercopa(); break;
        case 'iniciar-internacional': iniciarInternacional(); break;
        case 'simular-fase-internacional': simularFaseInternacional(); break;
        case 'jogar-mundial': jogarMundial(); break;
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
      configuracoes: () => this.bindConfiguracoesEvents(),
    };
    try { if (after[screenId]) after[screenId](); } catch(e){ console.error(`Erro ao vincular eventos da tela "${screenId}":`, e); }
  },

  /* ---------- Dashboard ---------- */
  buildDashboard(){
    const c = Game.club, w = Game.world;
    const tabela = ordenarTabela();
    const posicao = tabela.findIndex(t => t.id === 'player') + 1;
    return `
      <div class="page-head"><h2>Dashboard</h2><div class="sub">${c.nome} · Temporada ${c.temporada} · Rodada ${w.rodadaAtual}/${w.totalRodadas} · Técnico ${c.treinador}</div></div>
      <div class="card-grid">
        <div class="stat-card"><div class="stat-card__label">Orçamento</div><div class="stat-card__value">${formatMoney(c.orcamento)}</div><div class="stat-card__hint">Disponível para o mercado</div></div>
        <div class="stat-card gold"><div class="stat-card__label">Overall do Elenco</div><div class="stat-card__value">${c.overallMedio}</div><div class="stat-card__hint">${c.jogadores.length} jogadores</div></div>
        <div class="stat-card sky"><div class="stat-card__label">Posição na ${nomeLiga()}</div><div class="stat-card__value">${posicao}º</div><div class="stat-card__hint">${tabela[posicao-1]?.pontos ?? 0} pontos</div></div>
        <div class="stat-card alert"><div class="stat-card__label">Moral do Elenco</div><div class="stat-card__value">${c.moralElenco}%</div><div class="stat-card__hint">Folha: ${formatMoney(c.folhaSalarial)}/mês</div></div>
      </div>
      <div class="panel-box"><h3>Resumo do clube</h3>
        <div class="summary-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
          <div>Fundado em: <b>${c.fundadoEm}</b></div><div>Dificuldade: <b>${DIFFICULTIES.find(x=>x.id===c.dificuldade)?.nome ?? c.dificuldade}</b></div>
          <div>Capacidade: <b>${c.estadio.capacidade.toLocaleString('pt-BR')}</b></div><div>Centro de Treinamento: <b>Nível ${c.centroTreinamento.nivel}</b></div>
          <div>Academia: <b>Nível ${c.academia.nivel}</b></div><div>Conquistas: <b>${c.conquistas.length}</b></div>
          <div>Vitórias/Empates/Derrotas: <b>${c.estatisticasCarreira.vitorias}/${c.estatisticasCarreira.empates}/${c.estatisticasCarreira.derrotas}</b></div>
          <div>Conquistas desbloqueadas: <b>${c.achievementsUnlocked.length}/${ACHIEVEMENTS.length}</b></div>
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
    return `
      <div class="page-head"><h2>Elenco</h2><div class="sub">${c.jogadores.length} jogadores · Overall médio ${c.overallMedio}</div></div>
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
          const podeComprar = u.tipo === 'flag' ? !e[u.id] : (e[nivelKey]||1) < u.max;
          return `<div class="stat-card">
            <div class="stat-card__label">${u.icon} ${u.nome}</div>
            <div class="stat-card__value" style="font-size:1.1rem;">${u.tipo==='nivel' ? 'Nível '+atual : atual}</div>
            <div class="stat-card__hint">Custo: ${formatMoney(u.custo)}</div>
            <button class="btn-secondary" style="margin-top:10px; width:100%;" data-action="melhorar-estadio" data-id="${u.id}" ${podeComprar?'':'disabled'}>${podeComprar? 'Melhorar' : 'Nível máximo'}</button>
          </div>`;
        }).join('')}
      </div>`;
  },

  /* ---------- Academia ---------- */
  buildAcademia(){
    const c = Game.club;
    return `
      <div class="page-head"><h2>Academia de Base</h2><div class="sub">Nível ${c.academia.nivel}</div></div>
      <div class="panel-box" style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="btn-primary" data-action="buscar-talentos">🔎 Buscar Talentos (${formatMoney(150_000*c.academia.nivel)})</button>
        <button class="btn-secondary" data-action="melhorar-academia">⬆️ Melhorar Academia (${formatMoney(1_000_000*c.academia.nivel)})</button>
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

    return `
      <div class="page-head"><h2>Calendário</h2><div class="sub">Rodada ${Math.min(w.rodadaAtual,w.totalRodadas)}/${w.totalRodadas} · Temporada ${c.temporada}</div></div>

      ${!temporadaEncerrada ? `
      <div class="panel-box">
        <h3>Escalação & Tática</h3>
        <div class="field"><label>Formação</label>
          <select id="form-select">${Object.keys(FORMATIONS).map(f => `<option value="${f}" ${f===c.formacaoAtual?'selected':''}>${f}</option>`).join('')}</select>
        </div>
        <div class="lineup-grid" id="lineup-grid"></div>
        <div class="field-row" style="margin-top:14px;">
          <div class="field"><label>Capitão</label><select id="cap-select"></select></div>
          <div class="field"><label>Batedor de Pênalti</label><select id="pen-select"></select></div>
        </div>
        <div class="field"><label>Batedor de Falta</label><select id="falta-select"></select></div>
        <div class="tatica-sliders">
          ${['posse','pressao','contraAtaque','linhaDefensiva'].map(k => `
            <div class="slider-field"><label>${k==='posse'?'Posse de Bola':k==='pressao'?'Pressão':k==='contraAtaque'?'Contra-Ataque':'Linha Defensiva'}: <span id="val-${k}">${c.tatica[k]}</span></label>
              <input type="range" min="0" max="100" value="${c.tatica[k]}" data-tatica="${k}"></div>`).join('')}
        </div>
        <button class="btn-primary" style="margin-top:16px;" data-action="simular-rodada">▶️ Simular Rodada</button>
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
        <h3>Tabela da ${nomeLiga()}</h3>
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
    const { resultadoJogador, fimDeTemporada } = simularRodada();
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
      UI.openModal(`
        <div class="modal-head"><h3>${nomeM} ${golsM} x ${golsV} ${nomeV}</h3><button class="btn-ghost" data-close-modal>✕</button></div>
        <div class="modal-stats">
          <div class="stat-line"><span>${st.posse[0]}%</span><b>Posse de bola</b><span>${st.posse[1]}%</span></div>
          <div class="stat-line"><span>${st.finalizacoes[0]}</span><b>Finalizações</b><span>${st.finalizacoes[1]}</span></div>
          <div class="stat-line"><span>${st.escanteios[0]}</span><b>Escanteios</b><span>${st.escanteios[1]}</span></div>
          <div class="stat-line"><span>${st.cartoes[0]}</span><b>Cartões</b><span>${st.cartoes[1]}</span></div>
          <div class="stat-line"><span>${st.defesas[0]}</span><b>Defesas</b><span>${st.defesas[1]}</span></div>
        </div>
        <div class="modal-timeline">${timeline}</div>
        <button class="btn-primary" style="margin-top:16px; width:100%;" data-close-modal>Continuar</button>`, true);

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

      <div class="panel-box">
        <h3>🏅 Vitrine de Conquistas</h3>
        <div class="card-grid">
          ${Game.club.conquistas.length ? Game.club.conquistas.map(c => `<div class="stat-card gold"><div class="stat-card__label">Temporada ${c.temporada}</div><div class="stat-card__value" style="font-size:1rem;">${c.nome}</div></div>`).join('') : '<p style="color:var(--text-low);">Nenhum título ainda. Boa sorte, treinador!</p>'}
        </div>
      </div>`;
  },
  bindCompeticoesEvents(){},

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
    return `
      <div class="page-head"><h2>Configurações</h2></div>
      <div class="settings-list">
        <label class="settings-row"><span>Usar sempre a última escalação automaticamente</span><input type="checkbox" id="opt-auto-lineup" checked></label>
        <label class="settings-row"><span>Animações reduzidas</span><input type="checkbox" id="opt-reduced-motion-app"></label>
        <button class="btn-danger" data-action="wipe-save">🗑️ Apagar carreira e voltar ao menu</button>
      </div>`;
  },
  bindConfiguracoesEvents(){},
};

/* =====================================================================
   18. BOOT
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  window.addEventListener('beforeunload', () => { if (Game.club) Game.save(); });
});
