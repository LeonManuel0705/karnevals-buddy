const SURPRISES = [
  'Kostüm vorbereiten',
  'Tasche packen',
  'Playlist machen',
  'Tanzschuhe putzen',
  'Make-up einmal komplett ausprobieren',
  'Frisur für den nächsten Auftritt üben',
  'Den Tanz einmal ganz durchtanzen',
  'Musik für deine Gruppe zurechtschneiden',
  'Aufstellung für deine Gruppe aufmalen',
  'Powerbank aufladen',
  'Haarspray und Haarnadeln checken',
  'Wasserflasche auffüllen',
  'Kostüm auf lose Knöpfe und Nähte checken',
  'Fotos vom letzten Auftritt anschauen',
  'Zehn Minuten dehnen',
  'In die Gruppe schreiben, wer wann wo sein muss',
  'Glitzer suchen',
  'Strumpfhose ohne Laufmasche bereitlegen',
  'Hut ausbürsten',
  'Kleingeld für die Garderobe einstecken',
  'Neue Schrittfolge fürs nächste Training ausdenken',
  'Hinsetzen und einen Tee trinken',

  'Kostüm auf Flecken checken',
  'Petticoat aufschütteln',
  'Tanzschuhe auf lose Riemchen prüfen',
  'Ersatz-Strumpfhose in die Tasche legen',
  'Haarbürste und Kamm einpacken',
  'Wimpern einmal zur Probe kleben',
  'Abschminktücher einpacken',
  'Make-up-Pinsel waschen',
  'Glitzer-Look für die Party ausprobieren',
  'Nähset mit Sicherheitsnadeln packen',
  'Handschuhe auf Löcher prüfen',
  'Hut gerade biegen und die Feder richten',
  'Lippenstift-Farbe zum Kostüm testen',
  'Ein Foto vom fertigen Make-up machen',
  'Haargummis in deiner Haarfarbe besorgen',

  'Wechselklamotten für danach einpacken',
  'Einen Snack für die Pause einpacken',
  'Traubenzucker einstecken',
  'Blasenpflaster in die Tasche tun',
  'Ausweis ins Portemonnaie legen',
  'Deo einpacken',
  'Ladekabel in die Tasche legen',
  'Frisches Handtuch rauslegen',
  'Eine Tüte für nasse Sachen einpacken',
  'Tasche einmal ganz ausräumen und neu packen',
  'Taschentücher nachfüllen',
  'Adresse vom nächsten Auftritt raussuchen',
  'Bahnverbindung für den nächsten Termin checken',
  'Wetter für den nächsten Umzug checken',

  'Den schwierigsten Teil vom Tanz fünfmal üben',
  'Spagat dehnen',
  'Die Hebefigur im Kopf durchgehen',
  'Einmarsch vor dem Spiegel üben',
  'Zehn Sprünge am Stück schaffen',
  'Lächeln beim Tanzen vor dem Spiegel üben',
  'Den Tanz einmal ohne Musik durchzählen',
  'Beine hochlegen und ausruhen',
  'Rücken und Schultern lockern',
  'Ein Trainingsvideo anschauen und Fehler suchen',
  'Füße eincremen',
  'Pirouetten üben',
  'Nur die Arme vom Tanz durchgehen',
  'Zehn Minuten Bauchübungen',

  'Trainingsplan für nächste Woche schreiben',
  'Ein neues Aufwärmspiel für die Gruppe ausdenken',
  'Anwesenheit der letzten Trainings durchgehen',
  'Einer Tänzerin aus deiner Gruppe ein Lob schreiben',
  'Musik fürs Aufwärmen zusammenstellen',
  'Ein Spiel für die letzten fünf Trainingsminuten überlegen',
  'Nachricht an die Eltern deiner Gruppe vorbereiten',
  'Kostümgrößen deiner Gruppe notieren',
  'Zählzeiten für den schwierigen Teil aufschreiben',
  'Gummibärchen als Belohnung fürs Training besorgen',
  'Überlegen, wer beim Einmarsch vorne tanzt',
  'Fotos vom letzten Training für die Gruppe raussuchen',
  'Eine neue Dehnübung für deine Gruppe raussuchen',
  'Kurz mit der anderen Trainerin absprechen',
  'Hallenzeit fürs nächste Training checken',

  'Die Karnevals-Playlist um drei Lieder erweitern',
  'Den Text vom Sessionslied lernen',
  'Ein altes Karnevalslied raussuchen und mitsingen',
  'Lieblingslied laut aufdrehen und tanzen',
  'Playlist für die Fahrt zum Auftritt machen',
  'Das Lied vom Gardetanz einmal ganz anhören',
  'Einen Schlachtruf für die Gruppe ausdenken',
  'Konfetti basteln',
  'Ein lustiges Gruppenfoto planen',
  'Das Sessionsmotto herausfinden',

  'Eine Freundin fragen, welches Kostüm sie trägt',
  'Ein Gruppenkostüm für die Party vorschlagen',
  'Eine Sprachnachricht an die Garde schicken',
  'Ausmachen, wer wen abholt',
  'Fahrgemeinschaft für den nächsten Termin klären',
  'Einer Freundin eine Kamelle mitbringen',
  'Jemandem aus der Garde viel Glück wünschen',
  'Deine beste Karnevalserinnerung aufschreiben',
  'Alte Karnevalsfotos an die Familie schicken',
  'Ein Foto für die Vereinsseite machen',

  'Ein großes Glas Wasser trinken',
  'Heute früh ins Bett gehen',
  'Eine richtige Mahlzeit essen',
  'Zehn Minuten gar nichts tun',
  'Kurz raus an die frische Luft',
  'Handy weglegen und tief durchatmen',
  'Warm duschen und abschalten',
  'Den Wecker für den Auftrittstag stellen',
  'Einen Apfel essen',
  'Hände eincremen',
  'Eine Folge deiner Lieblingsserie gucken',
  'Einen kurzen Mittagsschlaf machen',

  'Die nächste Versammlung in den Kalender eintragen',
  'Beitrag oder Kostümgeld checken',
  'Den Orden vom letzten Jahr aufhängen',
  'Den Sessionskalender vom Verein anschauen',
  'Fragen, wann die neuen Kostüme kommen',
  'Die Notizen von der letzten Versammlung nochmal lesen',

  'Den nächsten Termin im Buddy eintragen',
  'Eine Sicherung vom Buddy speichern',
  'Die Packliste für den nächsten Termin abhaken',
  'Das Kostüm im Buddy auf „Alles fertig“ bringen',

  'Eine Kamelle essen',
  'Einen Karnevalsgruß an Oma schicken',
  'Dreimal laut Helau rufen',
  'Die Pappnase suchen',
  'Das verrückteste Kostüm der Welt ausdenken',
];

const SURPRISE_KEY = `${STORAGE_KEY}-tuete`;

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickSurprise() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(SURPRISE_KEY)) || {};
  } catch (err) {
    saved = {};
  }
  let deck = Array.isArray(saved.deck) ? saved.deck.filter(task => SURPRISES.includes(task)) : [];
  if (!deck.length) {
    deck = shuffled(SURPRISES);
    if (deck[0] === saved.last) deck.push(deck.shift());
  }
  const task = deck.shift();
  try {
    localStorage.setItem(SURPRISE_KEY, JSON.stringify({ deck, last: task }));
  } catch (err) {
    console.warn('Tüte konnte sich nichts merken', err);
  }
  return task;
}
