/* ΓΕΥΣΕΙΣ 360° — πυρήνας δεδομένων
   R(cat, sub, id, name, emoji, o)
   o: d=περιγραφή, t=χρόνος, s=μερίδες, l=δυσκολία(1-3),
      cut=[κοπή/προετοιμασία], mar=[μαρινάδα], i=[υλικά, '#Τίτλος' = ομάδα],
      p=[βήματα], ck=[ψήσιμο/βαθμοί], sv=σερβίρισμα, sd=[ids συνοδευτικών],
      pr=[ids ποτών/ταιριάσματα], tip=[μυστικά], info={κλειδί:τιμή}, m=[pr,de,me,ap,vr], tg=[ετικέτες] */
window.DB = [];
window.R = function (cat, sub, id, name, emoji, o) {
  DB.push(Object.assign({ cat, sub, id, name, emoji }, o || {}));
};

window.GROUPS = [
  { id: 'rofimata', name: 'Καφές & Ροφήματα', emoji: '☕', cats: ['kafes', 'rofimata'] },
  { id: 'fagito', name: 'Φαγητό', emoji: '🍽️', cats: ['proino', 'souvlatzidiko', 'fastfood', 'psita', 'kynigi', 'mageirefta', 'thalassina', 'mezedes', 'salates', 'synodeftika'] },
  { id: 'glyka', name: 'Γλυκά', emoji: '🍰', cats: ['glyka'] },
  { id: 'pota', name: 'Ποτά', emoji: '🍷', cats: ['krasia', 'mpyres', 'cocktails', 'apostagmata'] }
];

window.CATS = {
  kafes: { name: 'Καφές', emoji: '☕', desc: 'Όλα τα είδη καφέ: espresso, ελληνικός, φραπέ, freddo, φίλτρου, από όλο τον κόσμο.',
    subs: { espresso: 'Με βάση Espresso', elliniko: 'Ελληνικός & Παραδοσιακοί', kryos: 'Κρύοι καφέδες', filtro: 'Φίλτρου & μέθοδοι', kosmos: 'Από όλο τον κόσμο', spirit: 'Καφές με ποτό' } },
  rofimata: { name: 'Τσάι, Σοκολάτα & Ροφήματα', emoji: '🍵', desc: 'Τσάγια, βότανα, σοκολάτες, σαλέπι, χυμοί, λεμονάδες και smoothies.',
    subs: { tsai: 'Τσάγια', votana: 'Βότανα & αφεψήματα', sokolata: 'Σοκολάτες', alla: 'Ζεστά ροφήματα', xymoi: 'Χυμοί, λεμονάδες & smoothies' } },
  proino: { name: 'Πρωινό & Σνακ', emoji: '🍳', desc: 'Αυγά, πίτες, κουλούρι, γιαούρτι, τηγανίτες, τοστ και ελαφριά σνακ.',
    subs: { avga: 'Αυγά', pites: 'Πίτες & αρτοσκευάσματα', elafria: 'Ελαφριά & σνακ' } },
  souvlatzidiko: { name: 'Σουβλατζίδικο & Τυλιχτά', emoji: '🥙', desc: 'Πιτόγυρα, τυλιχτά καλαμάκια, κεμπάπ, μερίδες, κυπριακή σεφταλιά, ντονέρ, σάλτσες και γαρνιτούρες του σουβλατζίδικου.',
    subs: { tylixta: 'Τυλιχτά σε πίτα', gyros: 'Γύρος', merides: 'Μερίδες & πιατέλες', kosmos: 'Street food του κόσμου', saltses: 'Σάλτσες & γαρνιτούρες' } },
  fastfood: { name: 'Fast Food', emoji: '🍔', desc: 'Burgers, πίτσες, τηγανητό κοτόπουλο, σάντουιτς, ασιατικά, nachos και σνακ – σπιτικές εκδοχές.',
    subs: { burgers: 'Burgers', pizza: 'Πίτσες', kotopoulo: 'Τραγανό κοτόπουλο', sandwich: 'Σάντουιτς & τοστ', asiatika: 'Ασιατικά', snacks: 'Σνακ & finger food' } },
  psita: { name: 'Ψητά της ώρας', emoji: '🥩', desc: 'Μπριζόλες, παϊδάκια, σουβλάκια, μπιφτέκια — κοπή, μαρινάδα, ψήσιμο, σερβίρισμα.',
    subs: { moschari: 'Μοσχάρι', xoirino: 'Χοιρινό', arni: 'Αρνί & κατσίκι', kotopoulo: 'Κοτόπουλο', kima: 'Κιμάς' } },
  kynigi: { name: 'Κυνήγι', emoji: '🦌', desc: 'Λαγός, αγριογούρουνο, ζαρκάδι, ελάφι, πέρδικα, ορτύκια, φασιανός, αγριόπαπια, μπεκάτσα, τρυγόνια, κοτσύφια & τσίχλες, κουνέλι.',
    subs: { trixoto: 'Τριχωτό θήραμα', ptero: 'Φτερωτό θήραμα', kouneli: 'Κουνέλι (εκτροφής)' } },
  mageirefta: { name: 'Μαγειρευτά', emoji: '🍲', desc: 'Φούρνου και κατσαρόλας, λαδερά, όσπρια και σούπες της ταβέρνας.',
    subs: { fournou: 'Φούρνου', zymarika: 'Ζυμαρικά', soufle: 'Σουφλέ & γκρατέν', katsarolas: 'Κατσαρόλας', ladera: 'Λαδερά', ospria: 'Όσπρια', soupes: 'Σούπες' } },
  thalassina: { name: 'Ψάρια & Θαλασσινά', emoji: '🐟', desc: 'Ψάρια σχάρας & τηγανητά, χταπόδι, καλαμάρια, γαρίδες, μακαρονάδες.',
    subs: { psaria: 'Ψάρια', thalassina: 'Θαλασσινά', makaronades: 'Μακαρονάδες & ρύζια θάλασσας' } },
  mezedes: { name: 'Μεζέδες Ουζερί', emoji: '🫒', desc: 'Κρύοι και ζεστοί μεζέδες για ούζο και τσίπουρο.',
    subs: { kryoi: 'Κρύοι μεζέδες', zestoi: 'Ζεστοί μεζέδες', tyria: 'Τυριά', kreatikoi: 'Κρεατικοί μεζέδες', thalassinoi: 'Θαλασσινοί μεζέδες' } },
  salates: { name: 'Σαλάτες & Αλοιφές', emoji: '🥗', desc: 'Χωριάτικη, ντάκος, τζατζίκι, ταραμάς, μελιτζανοσαλάτα, φάβα…',
    subs: { salates: 'Σαλάτες', aloifes: 'Αλοιφές / dips' } },
  synodeftika: { name: 'Συνοδευτικά & Σάλτσες', emoji: '🍟', desc: 'Πατάτες, ρύζια, ζυμαρικά, χόρτα, ψωμιά και βασικές σάλτσες.',
    subs: { patates: 'Πατάτες', ryzi: 'Ρύζι & ζυμαρικά', lachanika: 'Λαχανικά & χόρτα', psomi: 'Ψωμί & πίτες', saltses: 'Σάλτσες & βάσεις' } },
  glyka: { name: 'Γλυκά', emoji: '🍰', desc: 'Σιροπιαστά, του ταψιού, κρέμες, γλυκά κουταλιού, τούρτες, παγωτά, γιορτινά.',
    subs: { siropiasta: 'Σιροπιαστά', tapsiou: 'Του ταψιού & κέικ', kremes: 'Κρέμες & γλυκά ψυγείου', koutaliou: 'Γλυκά κουταλιού', giortina: 'Γιορτινά & κουλουράκια', diethni: 'Διεθνή', pagota: 'Παγωτά' } },
  krasia: { name: 'Κρασιά', emoji: '🍷', desc: 'Ελληνικές και διεθνείς ποικιλίες: λευκά, ερυθρά, ροζέ, αφρώδη, γλυκά.',
    subs: { leuka: 'Λευκά', erythra: 'Ερυθρά', roze: 'Ροζέ & ρετσίνα', afrodi: 'Αφρώδη', glyka: 'Γλυκά / επιδορπίου' } },
  mpyres: { name: 'Μπύρες', emoji: '🍺', desc: 'Όλα τα στιλ: lager, pilsner, weiss, IPA, stout, belgian, sour.',
    subs: { lager: 'Lager (κατωζύμωσης)', ale: 'Ale (ανωζύμωσης)', special: 'Ειδικές' } },
  cocktails: { name: 'Κοκτέιλ', emoji: '🍹', desc: 'Κλασικά και μοντέρνα κοκτέιλ, με ελληνικά αποστάγματα και mocktails.',
    subs: { klasika: 'Κλασικά', tropika: 'Τροπικά & φρουτώδη', spritz: 'Spritz & αφρώδη', ellinika: 'Με ελληνικά αποστάγματα', mocktail: 'Χωρίς αλκοόλ (mocktails)' } },
  apostagmata: { name: 'Αποστάγματα & Λικέρ', emoji: '🥃', desc: 'Ούζο, τσίπουρο, ρακή, μαστίχα, ουίσκι, βότκα, τζιν, ρούμι, λικέρ.',
    subs: { ellinika: 'Ελληνικά', diethni: 'Διεθνή αποστάγματα', liker: 'Λικέρ & απεριτίφ' } }
};

window.SLOTS = [
  { id: 'pr', name: 'Πρωινό', emoji: '🌅', from: 6, to: 10, hint: 'Ενέργεια για να ξεκινήσει η μέρα: πρωτεΐνη + υδατάνθρακες + φρούτο + ρόφημα.' },
  { id: 'de', name: 'Δεκατιανό', emoji: '🥐', from: 10, to: 12, hint: 'Μικρό σνακ για να κρατηθείς μέχρι το μεσημέρι.' },
  { id: 'me', name: 'Μεσημεριανό', emoji: '🍽️', from: 12, to: 16, hint: 'Το κύριο γεύμα: κυρίως πιάτο + σαλάτα + ψωμί.' },
  { id: 'ap', name: 'Απογευματινό', emoji: '🍰', from: 16, to: 19, hint: 'Καφές/τσάι με κάτι γλυκό ή φρούτο.' },
  { id: 'vr', name: 'Βραδινό', emoji: '🌙', from: 19, to: 24, hint: 'Ελαφρύτερο ή κοινωνικό: μεζέδες, ψητά, ψάρι με ένα ποτήρι κρασί.' }
];

window.LEVELS = ['', 'Εύκολο', 'Μέτριο', 'Απαιτητικό'];
