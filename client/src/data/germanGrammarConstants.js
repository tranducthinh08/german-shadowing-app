// German Syntactic & Grammatical Constants
// German Pronouns
export const GERMAN_SUBJECT_PRONOUNS = new Set([
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie', 'man'
]);

export const GERMAN_AKKUSATIV_PRONOUNS = new Set([
  'mich', 'dich', 'ihn', 'sie', 'es', 'uns', 'euch', 'Sie'
]);

export const GERMAN_DATIV_PRONOUNS = new Set([
  'mir', 'dir', 'ihm', 'ihr', 'uns', 'euch', 'ihnen', 'Ihnen'
]);

// Question words (W-Fragen)
export const GERMAN_W_WORDS = new Set([
  'wer', 'wen', 'wem', 'wessen', 'was', 'wie', 'wo', 'woher', 'wohin', 'wann', 'warum', 'weshalb', 'wieso', 'welcher', 'welche', 'welches'
]);

// Subordinating Conjunctions (push verb to the end)
export const GERMAN_SUBORDINATING_CONJUNCTIONS = new Set([
  'weil', 'dass', 'ob', 'wenn', 'als', 'obwohl', 'da', 'bevor', 'nachdem', 'während', 'damit'
]);

// Separable Verb Prefixes (trennbare Vorsilben)
export const SEPARABLE_PREFIXES = new Set([
  'ab', 'an', 'auf', 'aus', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück', 'fern', 'vorbei', 'weg', 'hin', 'her', 'los'
]);

// Modal verbs conjugations
export const MODAL_VERBS_STEMS = new Set([
  'kann', 'kannst', 'können', 'könnt',
  'muss', 'musst', 'müssen', 'müsst',
  'darf', 'darfst', 'dürfen', 'dürft',
  'soll', 'sollst', 'sollen', 'sollt',
  'will', 'willst', 'wollen', 'wollt',
  'möchte', 'möchtest', 'möchten', 'möchtet',
  'mag', 'magst', 'mögen', 'mög'
]);

// Common German Verb Infinitives & Conjugations (A1-B1)
export const GERMAN_VERB_CONJUGATIONS = {
  // sein
  'bin': { inf: 'sein', tense: 'Präsens', en: 'am', vi: 'thì / là / ở' },
  'bist': { inf: 'sein', tense: 'Präsens', en: 'are', vi: 'thì / là / ở' },
  'ist': { inf: 'sein', tense: 'Präsens', en: 'is', vi: 'thì / là / ở' },
  'sind': { inf: 'sein', tense: 'Präsens', en: 'are', vi: 'thì / là / ở' },
  'seid': { inf: 'sein', tense: 'Präsens', en: 'are', vi: 'thì / là / ở' },
  'war': { inf: 'sein', tense: 'Präteritum', en: 'was', vi: 'đã là / đã ở' },
  'warst': { inf: 'sein', tense: 'Präteritum', en: 'were', vi: 'đã là / đã ở' },
  'waren': { inf: 'sein', tense: 'Präteritum', en: 'were', vi: 'đã là / đã ở' },
  'wart': { inf: 'sein', tense: 'Präteritum', en: 'were', vi: 'đã là / đã ở' },
  'gewesen': { inf: 'sein', tense: 'Partizip II', en: 'been', vi: 'từng ở / từng là' },

  // haben
  'habe': { inf: 'haben', tense: 'Präsens', en: 'have', vi: 'có' },
  'hast': { inf: 'haben', tense: 'Präsens', en: 'have', vi: 'có' },
  'hat': { inf: 'haben', tense: 'Präsens', en: 'has', vi: 'có' },
  'haben': { inf: 'haben', tense: 'Präsens', en: 'have', vi: 'có' },
  'habt': { inf: 'haben', tense: 'Präsens', en: 'have', vi: 'có' },
  'hatte': { inf: 'haben', tense: 'Präteritum', en: 'had', vi: 'đã có' },
  'hattest': { inf: 'haben', tense: 'Präteritum', en: 'had', vi: 'đã có' },
  'hatten': { inf: 'haben', tense: 'Präteritum', en: 'had', vi: 'đã có' },
  'gehabt': { inf: 'haben', tense: 'Partizip II', en: 'had', vi: 'đã có' },

  // kommen
  'komme': { inf: 'kommen', tense: 'Präsens', en: 'come', vi: 'đến' },
  'kommst': { inf: 'kommen', tense: 'Präsens', en: 'come', vi: 'đến' },
  'kommt': { inf: 'kommen', tense: 'Präsens', en: 'comes', vi: 'đến' },
  'gekommen': { inf: 'kommen', tense: 'Partizip II', en: 'come', vi: 'đã đến' },

  // gehen
  'gehe': { inf: 'gehen', tense: 'Präsens', en: 'go', vi: 'đi' },
  'gehst': { inf: 'gehen', tense: 'Präsens', en: 'go', vi: 'đi' },
  'geht': { inf: 'gehen', tense: 'Präsens', en: 'goes', vi: 'đi' },
  'ging': { inf: 'gehen', tense: 'Präteritum', en: 'went', vi: 'đã đi' },
  'gegangen': { inf: 'gehen', tense: 'Partizip II', en: 'gone', vi: 'đã đi' },

  // machen
  'mache': { inf: 'machen', tense: 'Präsens', en: 'do / make', vi: 'làm' },
  'machst': { inf: 'machen', tense: 'Präsens', en: 'do / make', vi: 'làm' },
  'macht': { inf: 'machen', tense: 'Präsens', en: 'does / makes', vi: 'làm' },
  'gemacht': { inf: 'machen', tense: 'Partizip II', en: 'done / made', vi: 'đã làm' },

  // heißen
  'heiße': { inf: 'heißen', tense: 'Präsens', en: 'am called', vi: 'tên là' },
  'heißt': { inf: 'heißen', tense: 'Präsens', en: 'is called', vi: 'tên là' },

  // wohnen
  'wohne': { inf: 'wohnen', tense: 'Präsens', en: 'live', vi: 'sống / cư trú' },
  'wohnst': { inf: 'wohnen', tense: 'Präsens', en: 'live', vi: 'sống / cư trú' },
  'wohnt': { inf: 'wohnen', tense: 'Präsens', en: 'lives', vi: 'sống / cư trú' },

  // sprechen
  'spreche': { inf: 'sprechen', tense: 'Präsens', en: 'speak', vi: 'nói' },
  'sprichst': { inf: 'sprechen', tense: 'Präsens', en: 'speak', vi: 'nói' },
  'spricht': { inf: 'sprechen', tense: 'Präsens', en: 'speaks', vi: 'nói' },
  'gesprochen': { inf: 'sprechen', tense: 'Partizip II', en: 'spoken', vi: 'đã nói' },

  // lernen
  'lerne': { inf: 'lernen', tense: 'Präsens', en: 'learn / study', vi: 'học' },
  'lernst': { inf: 'lernen', tense: 'Präsens', en: 'learn / study', vi: 'học' },
  'lernt': { inf: 'lernen', tense: 'Präsens', en: 'learns / studies', vi: 'học' },
  'gelernt': { inf: 'lernen', tense: 'Partizip II', en: 'learned', vi: 'đã học' },

  // trinken
  'trinke': { inf: 'trinken', tense: 'Präsens', en: 'drink', vi: 'uống' },
  'trinkst': { inf: 'trinken', tense: 'Präsens', en: 'drink', vi: 'uống' },
  'trinkt': { inf: 'trinken', tense: 'Präsens', en: 'drinks', vi: 'uống' },
  'getrunken': { inf: 'trinken', tense: 'Partizip II', en: 'drunk', vi: 'đã uống' },

  // essen
  'esse': { inf: 'essen', tense: 'Präsens', en: 'eat', vi: 'ăn' },
  'isst': { inf: 'essen', tense: 'Präsens', en: 'eat / eats', vi: 'ăn' },
  'gegessen': { inf: 'essen', tense: 'Partizip II', en: 'eaten', vi: 'đã ăn' },

  // sehen
  'sehe': { inf: 'sehen', tense: 'Präsens', en: 'see', vi: 'thấy / nhìn' },
  'siehst': { inf: 'sehen', tense: 'Präsens', en: 'see', vi: 'thấy / nhìn' },
  'sieht': { inf: 'sehen', tense: 'Präsens', en: 'sees', vi: 'thấy / nhìn' },
  'gesehen': { inf: 'sehen', tense: 'Partizip II', en: 'seen', vi: 'đã thấy' },

  // fahren
  'fahre': { inf: 'fahren', tense: 'Präsens', en: 'drive / travel', vi: 'chạy xe / đi xe' },
  'fährst': { inf: 'fahren', tense: 'Präsens', en: 'drive / travel', vi: 'chạy xe / đi xe' },
  'fährt': { inf: 'fahren', tense: 'Präsens', en: 'drives / travels', vi: 'chạy xe / đi xe' },
  'gefahren': { inf: 'fahren', tense: 'Partizip II', en: 'driven', vi: 'đã lái / đã đi' },

  // rufen (anrufen)
  'rufe': { inf: 'rufen', tense: 'Präsens', en: 'call', vi: 'gọi' },
  'rufst': { inf: 'rufen', tense: 'Präsens', en: 'call', vi: 'gọi' },
  'ruft': { inf: 'rufen', tense: 'Präsens', en: 'calls', vi: 'gọi' },
  'angerufen': { inf: 'anrufen', tense: 'Partizip II', en: 'called', vi: 'đã gọi điện' },

  // stehen (aufstehen)
  'stehe': { inf: 'stehen', tense: 'Präsens', en: 'stand', vi: 'đứng' },
  'stehst': { inf: 'stehen', tense: 'Präsens', en: 'stand', vi: 'đứng' },
  'steht': { inf: 'stehen', tense: 'Präsens', en: 'stands', vi: 'đứng' },
  'aufgestanden': { inf: 'aufstehen', tense: 'Partizip II', en: 'stood up', vi: 'đã thức dậy' },

  // steigen (einsteigen, umsteigen)
  'steige': { inf: 'steigen', tense: 'Präsens', en: 'climb / board', vi: 'lên xe / trèo' },
  'steigt': { inf: 'steigen', tense: 'Präsens', en: 'climbs / boards', vi: 'lên xe / trèo' }
};

// Common Adverbials
export const GERMAN_ADVERBIALS = {
  // Temporal
  'heute': { type: 'Temporal', vi: 'hôm nay' },
  'morgen': { type: 'Temporal', vi: 'ngày mai' },
  'gestern': { type: 'Temporal', vi: 'hôm qua' },
  'jetzt': { type: 'Temporal', vi: 'bây giờ' },
  'immer': { type: 'Temporal', vi: 'luôn luôn' },
  'oft': { type: 'Temporal', vi: 'thường xuyên' },
  'manchmal': { type: 'Temporal', vi: 'đôi khi' },
  'nie': { type: 'Temporal', vi: 'không bao giờ' },
  'bald': { type: 'Temporal', vi: 'sớm / sắp' },
  'später': { type: 'Temporal', vi: 'sau này / lát nữa' },
  'schon': { type: 'Temporal', vi: 'đã / rồi' },

  // Lokal
  'hier': { type: 'Lokal', vi: 'ở đây' },
  'dort': { type: 'Lokal', vi: 'ở đó' },
  'da': { type: 'Lokal', vi: 'ở kia' },

  // Modal
  'sehr': { type: 'Modal', vi: 'rất' },
  'gern': { type: 'Modal', vi: 'thích / sẵn lòng' },
  'gerne': { type: 'Modal', vi: 'thích / sẵn lòng' },
  'gut': { type: 'Modal', vi: 'tốt / giỏi' },
  'schnell': { type: 'Modal', vi: 'nhanh' },
  'langsam': { type: 'Modal', vi: 'chậm' },
  'leider': { type: 'Modal', vi: 'tiếc là' },
  'vielleicht': { type: 'Modal', vi: 'có lẽ' },
  'auch': { type: 'Modal', vi: 'cũng' },
  'nur': { type: 'Modal', vi: 'chỉ' }
};
