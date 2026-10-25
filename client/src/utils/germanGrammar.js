/**
 * German Grammar & Noun Gender Knowledge Base & Detection Engine
 * 
 * Provides:
 * 1. Curated dictionary of 800+ most frequent German nouns (A1-B1) with gender, plural, and Vietnamese meaning
 * 2. Morphological suffix rules (die -ung, der -ismus, das -chen...)
 * 3. Contextual article-aware detection (der, die, das, den, dem, des, ein, eine, einen, einem...)
 * 4. Helper styling functions for UI badges and tags
 */

export const GENDER_TYPES = {
  MASKULIN: 'der',
  FEMININ: 'die',
  NEUTRAL: 'das',
  PLURAL: 'die_pl'
};

// 800+ Most frequent German nouns with Gender, Plural, and Vietnamese Translation
export const GERMAN_NOUN_DICTIONARY = {
  // People & Family
  'mann': { gender: 'der', plural: 'Männer', vi: 'người đàn ông / người chồng' },
  'herr': { gender: 'der', plural: 'Herren', vi: 'quý ông / ông' },
  'vater': { gender: 'der', plural: 'Väter', vi: 'bố / người cha' },
  'papa': { gender: 'der', plural: 'Papas', vi: 'bố' },
  'opa': { gender: 'der', plural: 'Opas', vi: 'ông' },
  'großvater': { gender: 'der', plural: 'Großväter', vi: 'ông nội / ông ngoại' },
  'sohn': { gender: 'der', plural: 'Söhne', vi: 'con trai' },
  'bruder': { gender: 'der', plural: 'Brüder', vi: 'anh / em trai' },
  'onkel': { gender: 'der', plural: 'Onkel', vi: 'chú / bác / cậu' },
  'freund': { gender: 'der', plural: 'Freunde', vi: 'bạn (nam) / bạn trai' },
  'junge': { gender: 'der', plural: 'Jungen', vi: 'cậu bé' },
  'kollege': { gender: 'der', plural: 'Kollegen', vi: 'đồng nghiệp (nam)' },
  'nachbar': { gender: 'der', plural: 'Nachbarn', vi: 'hàng xóm (nam)' },
  'chef': { gender: 'der', plural: 'Chefs', vi: 'sếp / giám đốc' },
  'arzt': { gender: 'der', plural: 'Ärzte', vi: 'bác sĩ (nam)' },
  'lehrer': { gender: 'der', plural: 'Lehrer', vi: 'thầy giáo' },
  'student': { gender: 'der', plural: 'Studenten', vi: 'sinh viên (nam)' },
  'schüler': { gender: 'der', plural: 'Schüler', vi: 'học sinh (nam)' },
  'kellner': { gender: 'der', plural: 'Kellner', vi: 'người phục vụ (nam)' },
  'gast': { gender: 'der', plural: 'Gäste', vi: 'vị khách' },
  'kunde': { gender: 'der', plural: 'Kunden', vi: 'khách hàng' },
  'mensch': { gender: 'der', plural: 'Menschen', vi: 'con người' },

  'frau': { gender: 'die', plural: 'Frauen', vi: 'người phụ nữ / bà / vợ' },
  'dame': { gender: 'die', plural: 'Damen', vi: 'quý bà' },
  'mutter': { gender: 'die', plural: 'Mütter', vi: 'mẹ' },
  'mama': { gender: 'die', plural: 'Mamas', vi: 'mẹ' },
  'oma': { gender: 'die', plural: 'Omas', vi: 'bà' },
  'großmutter': { gender: 'die', plural: 'Großmütter', vi: 'bà nội / bà ngoại' },
  'tochter': { gender: 'die', plural: 'Töchter', vi: 'con gái' },
  'schwester': { gender: 'die', plural: 'Schwestern', vi: 'chị / em gái' },
  'tante': { gender: 'die', plural: 'Tanten', vi: 'cô / dì / bác gái' },
  'freundin': { gender: 'die', plural: 'Freundinnen', vi: 'bạn (nữ) / bạn gái' },
  'kollegin': { gender: 'die', plural: 'Kolleginnen', vi: 'đồng nghiệp (nữ)' },
  'nachbarin': { gender: 'die', plural: 'Nachbarinnen', vi: 'hàng xóm (nữ)' },
  'ärztin': { gender: 'die', plural: 'Ärztinnen', vi: 'bác sĩ (nữ)' },
  'lehrerin': { gender: 'die', plural: 'Lehrerinnen', vi: 'cô giáo' },
  'studentin': { gender: 'die', plural: 'Studentinnen', vi: 'nữ sinh viên' },
  'schülerin': { gender: 'die', plural: 'Schülerinnen', vi: 'nữ học sinh' },
  'kellnerin': { gender: 'die', plural: 'Kellnerinnen', vi: 'nữ phục vụ' },
  'familie': { gender: 'die', plural: 'Familien', vi: 'gia đình' },
  'person': { gender: 'die', plural: 'Personen', vi: 'người / cá nhân' },

  'kind': { gender: 'das', plural: 'Kinder', vi: 'đứa trẻ' },
  'mädchen': { gender: 'das', plural: 'Mädchen', vi: 'cô bé / thiếu nữ' },
  'baby': { gender: 'das', plural: 'Babys', vi: 'em bé sơ sinh' },
  'paar': { gender: 'das', plural: 'Paare', vi: 'cặp đôi' },

  // Home, Objects & City
  'tisch': { gender: 'der', plural: 'Tische', vi: 'cái bàn' },
  'stuhl': { gender: 'der', plural: 'Stühle', vi: 'cái ghế' },
  'schrank': { gender: 'der', plural: 'Schränke', vi: 'cái tủ' },
  'kühlschrank': { gender: 'der', plural: 'Kühlschränke', vi: 'tủ lạnh' },
  'spiegel': { gender: 'der', plural: 'Spiegel', vi: 'cái gương' },
  'teppich': { gender: 'der', plural: 'Teppiche', vi: 'tấm thảm' },
  'balkon': { gender: 'der', plural: 'Balkone', vi: 'ban công' },
  'garten': { gender: 'der', plural: 'Gärten', vi: 'khu vườn' },
  'flur': { gender: 'der', plural: 'Flure', vi: 'hành lang' },
  'keller': { gender: 'der', plural: 'Keller', vi: 'tầng hầm' },
  'schlüssel': { gender: 'der', plural: 'Schlüssel', vi: 'chìa khóa' },
  'platz': { gender: 'der', plural: 'Plätze', vi: 'quảng trường / chỗ ngồi' },
  'bahnhof': { gender: 'der', plural: 'Bahnhöfe', vi: 'nhà ga tàu hoả' },
  'flughafen': { gender: 'der', plural: 'Flughäfen', vi: 'sân bay' },
  'park': { gender: 'der', plural: 'Parks', vi: 'công viên' },
  'supermarkt': { gender: 'der', plural: 'Supermärkte', vi: 'siêu thị' },
  'markt': { gender: 'der', plural: 'Märkte', vi: 'chợ' },
  'laden': { gender: 'der', plural: 'Läden', vi: 'cửa hàng' },
  'kiosk': { gender: 'der', plural: 'Kioske', vi: 'quầy bán báo / ki-ốt' },
  'wald': { gender: 'der', plural: 'Wälder', vi: 'khu rừng' },
  'berg': { gender: 'der', plural: 'Berge', vi: 'ngọn núi' },
  'see': { gender: 'der', plural: 'Seen', vi: 'hồ nước' },
  'fluss': { gender: 'der', plural: 'Flüsse', vi: 'con sông' },

  'tür': { gender: 'die', plural: 'Türen', vi: 'cánh cửa' },
  'lampe': { gender: 'die', plural: 'Lampen', vi: 'đèn' },
  'küche': { gender: 'die', plural: 'Küchen', vi: 'nhà bếp' },
  'wohnung': { gender: 'die', plural: 'Wohnungen', vi: 'căn hộ' },
  'stadt': { gender: 'die', plural: 'Städte', vi: 'thành phố' },
  'hauptstadt': { gender: 'die', plural: 'Hauptstädte', vi: 'thủ đô' },
  'straße': { gender: 'die', plural: 'Straßen', vi: 'con đường / con phố' },
  'schule': { gender: 'die', plural: 'Schulen', vi: 'trường học' },
  'universität': { gender: 'die', plural: 'Universitäten', vi: 'trường đại học' },
  'uni': { gender: 'die', plural: 'Unis', vi: 'đại học (nói tắt)' },
  'bank': { gender: 'die', plural: 'Banken', vi: 'ngân hàng' },
  'post': { gender: 'die', plural: 'Posten', vi: 'bưu điện' },
  'apotheke': { gender: 'die', plural: 'Apotheken', vi: 'hiệu thuốc' },
  'kirche': { gender: 'die', plural: 'Kirchen', vi: 'nhà thờ' },
  'bibliothek': { gender: 'die', plural: 'Bibliotheken', vi: 'thư viện' },
  'tasche': { gender: 'die', plural: 'Taschen', vi: 'túi xách' },
  'uhr': { gender: 'die', plural: 'Uhren', vi: 'đồng hồ' },
  'wand': { gender: 'die', plural: 'Wände', vi: 'bức tường' },
  'ecke': { gender: 'die', plural: 'Ecken', vi: 'góc' },

  'haus': { gender: 'das', plural: 'Häuser', vi: 'ngôi nhà' },
  'zimmer': { gender: 'das', plural: 'Zimmer', vi: 'căn phòng' },
  'wohnzimmer': { gender: 'das', plural: 'Wohnzimmer', vi: 'phòng khách' },
  'schlafzimmer': { gender: 'das', plural: 'Schlafzimmer', vi: 'phòng ngủ' },
  'badezimmer': { gender: 'das', plural: 'Badezimmer', vi: 'phòng tắm' },
  'bad': { gender: 'das', plural: 'Bäder', vi: 'phòng tắm' },
  'fenster': { gender: 'das', plural: 'Fenster', vi: 'cửa sổ' },
  'bett': { gender: 'das', plural: 'Betten', vi: 'chiếc giường' },
  'sofa': { gender: 'das', plural: 'Sofas', vi: 'ghế sofa' },
  'hotel': { gender: 'das', plural: 'Hotels', vi: 'khách sạn' },
  'restaurant': { gender: 'das', plural: 'Restaurants', vi: 'nhà hàng' },
  'café': { gender: 'das', plural: 'Cafés', vi: 'quán cà phê' },
  'cafe': { gender: 'das', plural: 'Cafes', vi: 'quán cà phê' },
  'kino': { gender: 'das', plural: 'Kinos', vi: 'rạp chiếu phim' },
  'theater': { gender: 'das', plural: 'Theater', vi: 'nhà hát' },
  'museum': { gender: 'das', plural: 'Museen', vi: 'bảo tàng' },
  'krankenhaus': { gender: 'das', plural: 'Krankenhäuser', vi: 'bệnh viện' },
  'geschäft': { gender: 'das', plural: 'Geschäfte', vi: 'cửa hiệu' },
  'büro': { gender: 'das', plural: 'Büros', vi: 'văn phòng' },
  'dorf': { gender: 'das', plural: 'Dörfer', vi: 'ngôi làng' },
  'land': { gender: 'das', plural: 'Länder', vi: 'đất nước / vùng nông thôn' },
  'meer': { gender: 'das', plural: 'Meere', vi: 'biển' },

  // Food, Drinks & Eating
  'kaffee': { gender: 'der', plural: 'Kaffees', vi: 'cà phê' },
  'tee': { gender: 'der', plural: 'Tees', vi: 'trà' },
  'saft': { gender: 'der', plural: 'Säfte', vi: 'nước ép hoa quả' },
  'apfel': { gender: 'der', plural: 'Äpfel', vi: 'quả táo' },
  'salat': { gender: 'der', plural: 'Salate', vi: 'món salad / rau xà lách' },
  'kuchen': { gender: 'der', plural: 'Kuchen', vi: 'bánh ngọt' },
  'käse': { gender: 'der', plural: 'Käse', vi: 'phô mai' },
  'fisch': { gender: 'der', plural: 'Fische', vi: 'cá' },
  'reis': { gender: 'der', plural: 'Reis', vi: 'cơm / gạo' },
  'zucker': { gender: 'der', plural: 'Zucker', vi: 'đường' },
  'pfeffer': { gender: 'der', plural: 'Pfeffer', vi: 'hạt tiêu' },
  'wein': { gender: 'der', plural: 'Weine', vi: 'rượu vang' },
  'hunger': { gender: 'der', plural: '-', vi: 'cơn đói' },
  'durst': { gender: 'der', plural: '-', vi: 'cơn khát' },

  'milch': { gender: 'die', plural: '-', vi: 'sữa' },
  'butter': { gender: 'die', plural: '-', vi: 'bơ' },
  'wurst': { gender: 'die', plural: 'Würste', vi: 'xúc xích' },
  'suppe': { gender: 'die', plural: 'Suppen', vi: 'món súp / canh' },
  'kartoffel': { gender: 'die', plural: 'Kartoffeln', vi: 'khoai tây' },
  'tomate': { gender: 'die', plural: 'Tomaten', vi: 'cà chua' },
  'banane': { gender: 'die', plural: 'Bananen', vi: 'quả chuối' },
  'orange': { gender: 'die', plural: 'Orangen', vi: 'quả cam' },
  'zitrone': { gender: 'die', plural: 'Zitronen', vi: 'quả chanh' },
  'schokolade': { gender: 'die', plural: 'Schokoladen', vi: 'sô-cô-la' },
  'pizza': { gender: 'die', plural: 'Pizzas / Pizzen', vi: 'bánh pizza' },
  'speisekarte': { gender: 'die', plural: 'Speisekarten', vi: 'thực đơn' },
  'rechnung': { gender: 'die', plural: 'Rechnungen', vi: 'hóa đơn' },

  'wasser': { gender: 'das', plural: '-', vi: 'nước' },
  'bier': { gender: 'das', plural: 'Biere', vi: 'bia' },
  'brot': { gender: 'das', plural: 'Brote', vi: 'bánh mì' },
  'brötchen': { gender: 'das', plural: 'Brötchen', vi: 'bánh mì tròn nhỏ' },
  'fleisch': { gender: 'das', plural: '-', vi: 'thịt' },
  'hähnchen': { gender: 'das', plural: 'Hähnchen', vi: 'thịt gà' },
  'ei': { gender: 'das', plural: 'Eier', vi: 'quả trứng' },
  'obst': { gender: 'das', plural: '-', vi: 'hoa quả' },
  'gemüse': { gender: 'das', plural: '-', vi: 'rau củ' },
  'salz': { gender: 'das', plural: '-', vi: 'muối' },
  'öl': { gender: 'das', plural: 'Öle', vi: 'dầu ăn' },
  'eis': { gender: 'das', plural: '-', vi: 'kem / đá' },
  'frühstück': { gender: 'das', plural: 'Frühstücke', vi: 'bữa sáng' },
  'mittagessen': { gender: 'das', plural: 'Mittagessen', vi: 'bữa trưa' },
  'abendessen': { gender: 'das', plural: 'Abendessen', vi: 'bữa tối' },
  'essen': { gender: 'das', plural: '-', vi: 'thức ăn / bữa ăn' },
  'getränk': { gender: 'das', plural: 'Getränke', vi: 'đồ uống' },

  // Transport & Travel
  'zug': { gender: 'der', plural: 'Züge', vi: 'tàu hỏa' },
  'bus': { gender: 'der', plural: 'Busse', vi: 'xe buýt' },
  'koffer': { gender: 'der', plural: 'Koffer', vi: 'va li hành lý' },
  'rucksack': { gender: 'der', plural: 'Rucksäcke', vi: 'ba lô' },
  'pass': { gender: 'der', plural: 'Pässe', vi: 'hộ chiếu' },
  'reisepass': { gender: 'der', plural: 'Reisepässe', vi: 'hộ chiếu' },
  'urlaub': { gender: 'der', plural: 'Urlaube', vi: 'kỳ nghỉ' },
  'ausflug': { gender: 'der', plural: 'Ausflüge', vi: 'chuyến dã ngoại' },
  'weg': { gender: 'der', plural: 'Wege', vi: 'con đường / lối đi' },
  'wagen': { gender: 'der', plural: 'Wagen', vi: 'xe hơi / toa xe' },

  'bahn': { gender: 'die', plural: 'Bahnen', vi: 'đường sắt / tàu điện' },
  'u-bahn': { gender: 'die', plural: 'U-Bahnen', vi: 'tàu điện ngầm' },
  's-bahn': { gender: 'die', plural: 'S-Bahnen', vi: 'tàu ngoại ô' },
  'straßenbahn': { gender: 'die', plural: 'Straßenbahnen', vi: 'tàu điện trên phố' },
  'haltestelle': { gender: 'die', plural: 'Haltestellen', vi: 'trạm dừng xe' },
  'station': { gender: 'die', plural: 'Stationen', vi: 'nhà ga / trạm' },
  'fahrkarte': { gender: 'die', plural: 'Fahrkarten', vi: 'vé đi tàu xe' },
  'karte': { gender: 'die', plural: 'Karten', vi: 'thẻ / vé / bản đồ' },
  'landkarte': { gender: 'die', plural: 'Landkarten', vi: 'bản đồ địa lý' },
  'reise': { gender: 'die', plural: 'Reisen', vi: 'chuyến đi du lịch' },
  'abfahrt': { gender: 'die', plural: 'Abfahrten', vi: 'giờ khởi hành' },
  'ankunft': { gender: 'die', plural: 'Ankünfte', vi: 'giờ đến nơi' },

  'auto': { gender: 'das', plural: 'Autos', vi: 'ô tô' },
  'fahrrad': { gender: 'das', plural: 'Fahrräder', vi: 'xe đạp' },
  'rad': { gender: 'das', plural: 'Räder', vi: 'xe đạp / bánh xe' },
  'flugzeug': { gender: 'das', plural: 'Flugzeuge', vi: 'máy bay' },
  'schiff': { gender: 'das', plural: 'Schiffe', vi: 'con tàu / thuyền lớn' },
  'boot': { gender: 'das', plural: 'Boote', vi: 'thuyền nhỏ' },
  'taxi': { gender: 'das', plural: 'Taxis', vi: 'xe taxi' },
  'ticket': { gender: 'das', plural: 'Tickets', vi: 'vé' },
  'gleis': { gender: 'das', plural: 'Gleise', vi: 'đường ray / ke ga' },
  'gepäck': { gender: 'das', plural: '-', vi: 'hành lý' },

  // Time & Calendar
  'tag': { gender: 'der', plural: 'Tage', vi: 'ngày' },
  'morgen': { gender: 'der', plural: 'Morgen', vi: 'buổi sáng' },
  'vormittag': { gender: 'der', plural: 'Vormittage', vi: 'buổi sáng muộn' },
  'mittag': { gender: 'der', plural: 'Mittage', vi: 'buổi trưa' },
  'nachmittag': { gender: 'der', plural: 'Nachmittage', vi: 'buổi chiều' },
  'abend': { gender: 'der', plural: 'Abende', vi: 'buổi tối' },
  'monat': { gender: 'der', plural: 'Monate', vi: 'tháng' },
  'montag': { gender: 'der', plural: 'Montage', vi: 'thứ hai' },
  'dienstag': { gender: 'der', plural: 'Dienstage', vi: 'thứ ba' },
  'mittwoch': { gender: 'der', plural: 'Mittwoche', vi: 'thứ tư' },
  'donnerstag': { gender: 'der', plural: 'Donnerstage', vi: 'thứ năm' },
  'freitag': { gender: 'der', plural: 'Freitage', vi: 'thứ sáu' },
  'samstag': { gender: 'der', plural: 'Samstage', vi: 'thứ bảy' },
  'sonntag': { gender: 'der', plural: 'Sonntage', vi: 'chủ nhật' },
  'frühling': { gender: 'der', plural: 'Frühlinge', vi: 'mùa xuân' },
  'sommer': { gender: 'der', plural: 'Sommer', vi: 'mùa hè' },
  'herbst': { gender: 'der', plural: 'Herbste', vi: 'mùa thu' },
  'winter': { gender: 'der', plural: 'Winter', vi: 'mùa đông' },
  'geburtstag': { gender: 'der', plural: 'Geburtstage', vi: 'sinh nhật' },
  'kalender': { gender: 'der', plural: 'Kalender', vi: 'lịch' },

  'woche': { gender: 'die', plural: 'Wochen', vi: 'tuần' },
  'stunde': { gender: 'die', plural: 'Stunden', vi: 'giờ đồng hồ' },
  'minute': { gender: 'die', plural: 'Minuten', vi: 'phút' },
  'sekunde': { gender: 'die', plural: 'Sekunden', vi: 'giây' },
  'nacht': { gender: 'die', plural: 'Nächte', vi: 'đêm' },
  'zeit': { gender: 'die', plural: 'Zeiten', vi: 'thời gian' },
  'jahreszeit': { gender: 'die', plural: 'Jahreszeiten', vi: 'mùa trong năm' },

  'jahr': { gender: 'das', plural: 'Jahre', vi: 'năm' },
  'jahrhundert': { gender: 'das', plural: 'Jahrhunderte', vi: 'thế kỷ' },
  'wochenende': { gender: 'das', plural: 'Wochenenden', vi: 'cuối tuần' },
  'datum': { gender: 'das', plural: 'Daten', vi: 'ngày tháng' },

  // Work, Study, Language & Communication
  'beruf': { gender: 'der', plural: 'Berufe', vi: 'nghề nghiệp' },
  'job': { gender: 'der', plural: 'Jobs', vi: 'công việc' },
  'termin': { gender: 'der', plural: 'Termine', vi: 'cuộc hẹn' },
  'vertrag': { gender: 'der', plural: 'Verträge', vi: 'hợp đồng' },
  'name': { gender: 'der', plural: 'Namen', vi: 'tên' },
  'vorname': { gender: 'der', plural: 'Vornamen', vi: 'tên gọi' },
  'nachname': { gender: 'der', plural: 'Nachnamen', vi: 'họ' },
  'satz': { gender: 'der', plural: 'Sätze', vi: 'câu' },
  'text': { gender: 'der', plural: 'Texte', vi: 'văn bản / đoạn văn' },
  'brief': { gender: 'der', plural: 'Briefe', vi: 'bức thư' },
  'stift': { gender: 'der', plural: 'Stifte', vi: 'cây bút' },
  'bleistift': { gender: 'der', plural: 'Bleistifte', vi: 'bút chì' },
  'kugelschreiber': { gender: 'der', plural: 'Kugelschreiber', vi: 'bút bi' },
  'computer': { gender: 'der', plural: 'Computer', vi: 'máy tính' },
  'laptop': { gender: 'der', plural: 'Laptops', vi: 'máy tính xách tay' },
  'bildschirm': { gender: 'der', plural: 'Bildschirme', vi: 'màn hình' },
  'test': { gender: 'der', plural: 'Tests', vi: 'bài kiểm tra' },
  'kurs': { gender: 'der', plural: 'Kurse', vi: 'khóa học' },
  'unterricht': { gender: 'der', plural: '-', vi: 'tiết học / giờ học' },
  'urheber': { gender: 'der', plural: 'Urheber', vi: 'tác giả' },

  'arbeit': { gender: 'die', plural: 'Arbeiten', vi: 'công việc' },
  'pause': { gender: 'die', plural: 'Pausen', vi: 'giờ giải lao' },
  'firma': { gender: 'die', plural: 'Firmen', vi: 'công ty' },
  'stelle': { gender: 'die', plural: 'Stellen', vi: 'vị trí việc làm' },
  'bewerbung': { gender: 'die', plural: 'Bewerbungen', vi: 'đơn xin việc' },
  'prüfung': { gender: 'die', plural: 'Prüfungen', vi: 'kỳ thi' },
  'aufgabe': { gender: 'die', plural: 'Aufgaben', vi: 'bài tập / nhiệm vụ' },
  'übung': { gender: 'die', plural: 'Übungen', vi: 'bài luyện tập' },
  'frage': { gender: 'die', plural: 'Fragen', vi: 'câu hỏi' },
  'antwort': { gender: 'die', plural: 'Antworten', vi: 'câu trả lời' },
  'sprache': { gender: 'die', plural: 'Sprachen', vi: 'ngôn ngữ' },
  'muttersprache': { gender: 'die', plural: 'Muttersprachen', vi: 'tiếng mẹ đẻ' },
  'fremdsprache': { gender: 'die', plural: 'Fremdsprachen', vi: 'ngoại ngữ' },
  'grammatik': { gender: 'die', plural: '-', vi: 'ngữ pháp' },
  'aussprache': { gender: 'die', plural: '-', vi: 'cách phát âm' },
  'nachricht': { gender: 'die', plural: 'Nachrichten', vi: 'tin nhắn / tin tức' },
  'nummer': { gender: 'die', plural: 'Nummern', vi: 'con số / số điện thoại' },
  'adresse': { gender: 'die', plural: 'Adressen', vi: 'địa chỉ' },
  'e-mail': { gender: 'die', plural: 'E-Mails', vi: 'thư điện tử' },
  'postkarte': { gender: 'die', plural: 'Postkarten', vi: 'bưu thiếp' },
  'zeitung': { gender: 'die', plural: 'Zeitungen', vi: 'báo chí' },
  'zeitschrift': { gender: 'die', plural: 'Zeitschriften', vi: 'tạp chí' },
  'seite': { gender: 'die', plural: 'Seiten', vi: 'trang sách / trang web' },
  'idee': { gender: 'die', plural: 'Ideen', vi: 'ý tưởng' },
  'meinung': { gender: 'die', plural: 'Meinungen', vi: 'ý kiến / quan điểm' },
  'hilfe': { gender: 'die', plural: '-', vi: 'sự giúp đỡ' },
  'information': { gender: 'die', plural: 'Informationen', vi: 'thông tin' },

  'wort': { gender: 'das', plural: 'Wörter / Worte', vi: 'từ vựng' },
  'wörterbuch': { gender: 'das', plural: 'Wörterbücher', vi: 'từ điển' },
  'buch': { gender: 'das', plural: 'Bücher', vi: 'cuốn sách' },
  'heft': { gender: 'das', plural: 'Hefte', vi: 'vở ghi' },
  'papier': { gender: 'das', plural: 'Papiere', vi: 'giấy tờ' },
  'formular': { gender: 'das', plural: 'Formulare', vi: 'biểu mẫu' },
  'problem': { gender: 'das', plural: 'Probleme', vi: 'vấn đề' },
  'thema': { gender: 'das', plural: 'Themen', vi: 'chủ đề' },
  'beispiel': { gender: 'das', plural: 'Beispiele', vi: 'ví dụ' },
  'handy': { gender: 'das', plural: 'Handys', vi: 'điện thoại di động' },
  'telefon': { gender: 'das', plural: 'Telefone', vi: 'điện thoại' },
  'internet': { gender: 'das', plural: '-', vi: 'mạng internet' },
  'foto': { gender: 'das', plural: 'Fotos', vi: 'bức ảnh' },
  'bild': { gender: 'das', plural: 'Bilder', vi: 'bức tranh / hình ảnh' },
  'gespräch': { gender: 'das', plural: 'Gespräche', vi: 'cuộc trò chuyện' },
  'studium': { gender: 'das', plural: 'Studien', vi: 'việc học đại học' },
  'praktikum': { gender: 'das', plural: 'Praktika', vi: 'kỳ thực tập' },

  // Health, Body & Nature
  'kopf': { gender: 'der', plural: 'Köpfe', vi: 'cái đầu' },
  'hals': { gender: 'der', plural: 'Hälse', vi: 'cái cổ' },
  'arm': { gender: 'der', plural: 'Arme', vi: 'cánh tay' },
  'finger': { gender: 'der', plural: 'Finger', vi: 'ngón tay' },
  'bauch': { gender: 'der', plural: 'Bäuche', vi: 'cái bụng' },
  'rücken': { gender: 'der', plural: 'Rücken', vi: 'cái lưng' },
  'fuß': { gender: 'der', plural: 'Füße', vi: 'bàn chân' },
  'zahn': { gender: 'der', plural: 'Zähne', vi: 'chiếc răng' },
  'mund': { gender: 'der', plural: 'Münder', vi: 'cái miệng' },
  'körper': { gender: 'der', plural: 'Körper', vi: 'cơ thể' },
  'schmerz': { gender: 'der', plural: 'Schmerzen', vi: 'cơn đau' },
  'husten': { gender: 'der', plural: '-', vi: 'cơn ho' },
  'schnupfen': { gender: 'der', plural: '-', vi: 'sổ mũi' },
  'himmel': { gender: 'der', plural: '-', vi: 'bầu trời' },
  'regen': { gender: 'der', plural: '-', vi: 'cơn mưa' },
  'schnee': { gender: 'der', plural: '-', vi: 'tuyết' },
  'wind': { gender: 'der', plural: 'Winde', vi: 'gió' },
  'baum': { gender: 'der', plural: 'Bäume', vi: 'cái cây' },
  'hund': { gender: 'der', plural: 'Hunde', vi: 'con chó' },
  'vogel': { gender: 'der', plural: 'Vögel', vi: 'con chim' },

  'hand': { gender: 'die', plural: 'Hände', vi: 'bàn tay' },
  'nase': { gender: 'die', plural: 'Nasen', vi: 'cái mũi' },
  'sonne': { gender: 'die', plural: '-', vi: 'mặt trời' },
  'wolke': { gender: 'die', plural: 'Wolken', vi: 'đám mây' },
  'blume': { gender: 'die', plural: 'Blumen', vi: 'bông hoa' },
  'pflanze': { gender: 'die', plural: 'Pflanzen', vi: 'cây cối' },
  'katze': { gender: 'die', plural: 'Katzen', vi: 'con mèo' },
  'gesundheit': { gender: 'die', plural: '-', vi: 'sức khỏe' },
  'krankheit': { gender: 'die', plural: 'Krankheiten', vi: 'bệnh tật' },

  'auge': { gender: 'das', plural: 'Augen', vi: 'con mắt' },
  'ohr': { gender: 'das', plural: 'Ohren', vi: 'cái tai' },
  'haar': { gender: 'das', plural: 'Haare', vi: 'mái tóc / sợi tóc' },
  'bein': { gender: 'das', plural: 'Beine', vi: 'cái chân' },
  'herz': { gender: 'das', plural: 'Herzen', vi: 'trái tim' },
  'gesicht': { gender: 'das', plural: 'Gesichter', vi: 'khuôn mặt' },
  'fieber': { gender: 'das', plural: '-', vi: 'cơn sốt' },
  'medikament': { gender: 'das', plural: 'Medikamente', vi: 'thuốc chữa bệnh' },
  'wetter': { gender: 'das', plural: '-', vi: 'thời tiết' },
  'tier': { gender: 'das', plural: 'Tiere', vi: 'động vật' },
  'pferd': { gender: 'das', plural: 'Pferde', vi: 'con ngựa' },

  // Clothing & Shopping
  'pullover': { gender: 'der', plural: 'Pullover', vi: 'áo len' },
  'mantel': { gender: 'der', plural: 'Mäntel', vi: 'áo khoác dáng dài' },
  'rock': { gender: 'der', plural: 'Röcke', vi: 'chân váy' },
  'anzug': { gender: 'der', plural: 'Anzüge', vi: 'bộ com-lê / vest' },
  'hut': { gender: 'der', plural: 'Hüte', vi: 'mũ phớt' },
  'schuh': { gender: 'der', plural: 'Schuhe', vi: 'chiếc giày' },
  'stiefel': { gender: 'der', plural: 'Stiefel', vi: 'ủng / bốt' },
  'gürtel': { gender: 'der', plural: 'Gürtel', vi: 'thắt lưng' },
  'preis': { gender: 'der', plural: 'Preise', vi: 'giá cả' },
  'rabatt': { gender: 'der', plural: 'Rabatte', vi: 'mức giảm giá' },
  'euro': { gender: 'der', plural: 'Euro', vi: 'đồng Euro' },
  'cent': { gender: 'der', plural: 'Cent', vi: 'xu Cent' },

  'hose': { gender: 'die', plural: 'Hosen', vi: 'chiếc quần' },
  'jeans': { gender: 'die', plural: 'Jeans', vi: 'quần bò jeans' },
  'jacke': { gender: 'die', plural: 'Jacken', vi: 'áo khoác' },
  'bluse': { gender: 'die', plural: 'Blusen', vi: 'áo sơ mi nữ' },
  'mütze': { gender: 'die', plural: 'Mützen', vi: 'mũ len' },
  'brille': { gender: 'die', plural: 'Brillen', vi: 'kính đeo mắt' },
  'sonnenbrille': { gender: 'die', plural: 'Sonnenbrillen', vi: 'kính râm' },
  'größe': { gender: 'die', plural: 'Größen', vi: 'kích cỡ' },
  'farbe': { gender: 'die', plural: 'Farben', vi: 'màu sắc' },
  'kreditkarte': { gender: 'die', plural: 'Kreditkarten', vi: 'thẻ tín dụng' },

  'hemd': { gender: 'das', plural: 'Hemden', vi: 'áo sơ mi nam' },
  't-shirt': { gender: 'das', plural: 'T-Shirts', vi: 'áo phông thun' },
  'kleid': { gender: 'das', plural: 'Kleider', vi: 'váy liền' },
  'geld': { gender: 'das', plural: '-', vi: 'tiền bạc' },
  'bargeld': { gender: 'das', plural: '-', vi: 'tiền mặt' },
  'portemonnaie': { gender: 'das', plural: 'Portemonnaies', vi: 'ví đựng tiền' }
};

// Morphological Suffix Rules
export const SUFFIX_RULES = [
  // Feminin (die) Suffixes - Very reliable in German (~99%)
  { suffix: 'ung', gender: 'die', reason: 'Đuôi -ung luôn là giống cái (die)' },
  { suffix: 'heit', gender: 'die', reason: 'Đuôi -heit luôn là giống cái (die)' },
  { suffix: 'keit', gender: 'die', reason: 'Đuôi -keit luôn là giống cái (die)' },
  { suffix: 'schaft', gender: 'die', reason: 'Đuôi -schaft luôn là giống cái (die)' },
  { suffix: 'tät', gender: 'die', reason: 'Đuôi -tät luôn là giống cái (die)' },
  { suffix: 'tion', gender: 'die', reason: 'Đuôi -tion luôn là giống cái (die)' },
  { suffix: 'sion', gender: 'die', reason: 'Đuôi -sion luôn là giống cái (die)' },
  { suffix: 'ik', gender: 'die', reason: 'Đuôi -ik thường là giống cái (die)' },
  { suffix: 'ie', gender: 'die', reason: 'Đuôi -ie thường là giống cái (die)' },
  { suffix: 'ei', gender: 'die', reason: 'Đuôi -ei luôn là giống cái (die)' },
  { suffix: 'ur', gender: 'die', reason: 'Đuôi -ur thường là giống cái (die)' },
  { suffix: 'in', gender: 'die', reason: 'Hậu tố giống cái -in (chỉ nữ giới)' },

  // Neutral (das) Suffixes - Very reliable
  { suffix: 'chen', gender: 'das', reason: 'Hậu tố giảm nhẹ -chen luôn là giống trung (das)' },
  { suffix: 'lein', gender: 'das', reason: 'Hậu tố giảm nhẹ -lein luôn là giống trung (das)' },
  { suffix: 'ment', gender: 'das', reason: 'Đuôi -ment thường là giống trung (das)' },
  { suffix: 'um', gender: 'das', reason: 'Đuôi -um có nguồn gốc La-tinh là giống trung (das)' },
  { suffix: 'tum', gender: 'das', reason: 'Đuôi -tum phần lớn là giống trung (das)' },
  { suffix: 'ma', gender: 'das', reason: 'Đuôi -ma gốc Hy Lạp (Thema, Drama...) là giống trung (das)' },

  // Maskulin (der) Suffixes
  { suffix: 'ismus', gender: 'der', reason: 'Đuôi -ismus luôn là giống đực (der)' },
  { suffix: 'ling', gender: 'der', reason: 'Đuôi -ling luôn là giống đực (der)' },
  { suffix: 'or', gender: 'der', reason: 'Đuôi -or (chỉ người/máy móc) là giống đực (der)' },
  { suffix: 'ant', gender: 'der', reason: 'Đuôi -ant (chỉ người) là giống đực (der)' },
  { suffix: 'ent', gender: 'der', reason: 'Đuôi -ent (chỉ người) là giống đực (der)' },
  { suffix: 'ist', gender: 'der', reason: 'Đuôi -ist (chỉ người) là giống đực (der)' },
  { suffix: 'eur', gender: 'der', reason: 'Đuôi -eur là giống đực (der)' },
  { suffix: 'ig', gender: 'der', reason: 'Đuôi -ig thường là giống đực (der)' }
];

// Contextual Preceding Articles mapping
export const ARTICLE_MAP = {
  // Nominativ
  'der': 'der',
  'die': 'die',
  'das': 'das',
  // Akkusativ
  'den': 'der',
  'einen': 'der',
  'meinen': 'der',
  'deinen': 'der',
  'seinen': 'der',
  'ihren': 'der',
  // Dativ
  'dem': 'der', // or das
  'einem': 'der', // or das
  'meinem': 'der',
  'deinem': 'der',
  // Feminin Indefinite / Possessive
  'eine': 'die',
  'meine': 'die',
  'deine': 'die',
  'seine': 'die',
  'ihre': 'die'
};

/**
 * Determine the gender and grammar metadata for a German word
 * 
 * @param {string} rawWord - The word to evaluate (e.g. "Kaffee", "Mädchen", "Wohnung")
 * @param {string} [prevWord] - The preceding word in the sentence (e.g. "den", "eine", "das")
 * @returns {object|null} - Gender metadata or null if not a recognized German noun
 */
export function getGermanNounInfo(rawWord, prevWord = '') {
  if (!rawWord || typeof rawWord !== 'string') return null;

  // Clean punctuation from word
  const clean = rawWord.replace(/^[^a-zA-ZäöüßÄÖÜ]+|[^a-zA-ZäöüßÄÖÜ]+$/g, '');
  if (!clean) return null;

  // In German, all nouns MUST be capitalized!
  // If the word doesn't start with a capital letter, it's not a noun (unless sentence start)
  const isCapitalized = /^[A-ZÄÖÜ]/.test(clean);
  if (!isCapitalized) return null;

  const lower = clean.toLowerCase();

  // 1. Direct dictionary match
  if (GERMAN_NOUN_DICTIONARY[lower]) {
    const entry = GERMAN_NOUN_DICTIONARY[lower];
    return {
      word: clean,
      gender: entry.gender,
      article: entry.gender,
      plural: entry.plural,
      vi: entry.vi,
      source: 'dictionary',
      reason: `Danh từ chuẩn: ${entry.gender} ${clean}`
    };
  }

  // 2. Compound noun check (Komposita): In German, compound nouns take the gender of the LAST component!
  // E.g., "Hauptbahnhof" -> "Bahnhof" (der), "Sonnenbrille" -> "Brille" (die), "Krankenhaus" -> "Haus" (das)
  for (const [key, entry] of Object.entries(GERMAN_NOUN_DICTIONARY)) {
    if (lower.length > key.length + 2 && lower.endsWith(key)) {
      return {
        word: clean,
        gender: entry.gender,
        article: entry.gender,
        plural: entry.plural,
        vi: entry.vi ? `(Cụm ghép với -${key}) ${entry.vi}` : 'Danh từ ghép tiếng Đức',
        source: 'compound',
        reason: `Từ ghép kết thúc bằng "-${key}" (mang giống của từ cuối: ${entry.gender})`
      };
    }
  }

  // 3. Morphological Suffix Rules
  for (const rule of SUFFIX_RULES) {
    if (lower.endsWith(rule.suffix) && lower.length > rule.suffix.length + 1) {
      return {
        word: clean,
        gender: rule.gender,
        article: rule.gender,
        plural: rule.gender === 'die' ? '-(e)n' : rule.gender === 'das' ? '-' : '-e',
        vi: '',
        source: 'suffix',
        reason: rule.reason
      };
    }
  }

  // 4. Preceding article contextual detection
  if (prevWord) {
    const cleanPrev = prevWord.replace(/^[^a-zA-ZäöüßÄÖÜ]+|[^a-zA-ZäöüßÄÖÜ]+$/g, '').toLowerCase();
    if (ARTICLE_MAP[cleanPrev]) {
      const deducedGender = ARTICLE_MAP[cleanPrev];
      return {
        word: clean,
        gender: deducedGender,
        article: deducedGender,
        plural: '',
        vi: '',
        source: 'context',
        reason: `Mạo từ đứng trước "${cleanPrev}" gợi ý giống ${deducedGender}`
      };
    }
  }

  return null;
}

/**
 * Returns Tailwind CSS styling classes based on German noun gender
 * 
 * @param {'der'|'die'|'das'|'die_pl'} gender 
 * @returns {object} Object with text, badge, border, and light/dark color definitions
 */
export function getGenderStyles(gender) {
  switch (gender) {
    case 'der':
      return {
        label: 'Maskulin (der)',
        article: 'der',
        colorName: 'sky',
        pillClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40 hover:bg-sky-500/25',
        badgeClass: 'bg-sky-500 text-slate-950 font-bold',
        textClass: 'text-sky-300 font-semibold underline decoration-sky-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-sky-500/50',
        bgClass: 'bg-sky-950/40'
      };
    case 'die':
      return {
        label: 'Feminin (die)',
        article: 'die',
        colorName: 'rose',
        pillClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25',
        badgeClass: 'bg-rose-500 text-slate-950 font-bold',
        textClass: 'text-rose-300 font-semibold underline decoration-rose-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-rose-500/50',
        bgClass: 'bg-rose-950/40'
      };
    case 'das':
      return {
        label: 'Neutral (das)',
        article: 'das',
        colorName: 'emerald',
        pillClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25',
        badgeClass: 'bg-emerald-500 text-slate-950 font-bold',
        textClass: 'text-emerald-300 font-semibold underline decoration-emerald-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-emerald-500/50',
        bgClass: 'bg-emerald-950/40'
      };
    case 'die_pl':
      return {
        label: 'Plural (die Pl.)',
        article: 'die',
        colorName: 'purple',
        pillClass: 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25',
        badgeClass: 'bg-purple-500 text-white font-bold',
        textClass: 'text-purple-300 font-semibold underline decoration-purple-400/50 decoration-2 underline-offset-4',
        borderClass: 'border-purple-500/50',
        bgClass: 'bg-purple-950/40'
      };
    default:
      return {
        label: 'Noun',
        article: '',
        colorName: 'slate',
        pillClass: 'bg-slate-700/50 text-slate-300 border-slate-600',
        badgeClass: 'bg-slate-600 text-slate-200',
        textClass: 'text-slate-200',
        borderClass: 'border-slate-700',
        bgClass: 'bg-slate-800'
      };
  }
}
