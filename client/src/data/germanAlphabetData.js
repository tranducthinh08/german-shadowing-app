/**
 * PolyGlot Studio - German Alphabet & Phonetics Master Dataset
 * 
 * Provides:
 * 1. 26 standard letters (A-Z) with German letter names, IPA, Vietnamese phonetic approximation,
 *    sound in words, mouth position guidance, common mistakes, and sample words.
 * 2. 4 special German characters (Ä, Ö, Ü, ß) with detailed mouth posture guides.
 * 3. 11 crucial German diphthongs & consonant clusters (ei, ie, eu, ch, sch, sp, st, tsch, -ig...).
 * 4. Minimal contrast pairs (V vs W, EI vs IE, Ö vs Ü, ch-ich vs ch-ach) for effective listening drills.
 */

export const GERMAN_ALPHABET = [
  // --- 26 Chữ cái Tiêu chuẩn (A - Z) ---
  {
    id: 'a',
    letter: 'A a',
    name: 'A',
    ipa: '[aː] / [a]',
    viApprox: 'a (mở rộng miệng)',
    soundType: 'vowel',
    isDifficult: false,
    ttsLetter: 'A',
    mouthTip: 'Mở rộng miệng tự nhiên, hạ thấp cuống lưỡi. Phát âm rõ ràng, không chu môi.',
    commonMistake: 'Cần phân biệt âm a dài (Abend) và a ngắn (Apfel).',
    examples: [
      { de: 'Apfel', vi: 'Quả táo', phonetic: 'Áp-fồ', ipa: '[ˈapfl̩]' },
      { de: 'Abend', vi: 'Buổi tối', phonetic: 'A-bừn-t', ipa: '[ˈaːbn̩t]' },
      { de: 'Auto', vi: 'Xe hơi', phonetic: 'Ao-tô', ipa: '[ˈaʊ̯toː]' }
    ],
    category: 'standard'
  },
  {
    id: 'b',
    letter: 'B b',
    name: 'Be',
    ipa: '[beː]',
    viApprox: 'bê',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Be',
    mouthTip: 'Hai môi khép chặt rồi bật nhẹ luồng hơi, rung dây thanh âm.',
    commonMistake: 'Lưu ý: Khi chữ "b" đứng ở cuối từ hoặc trước phụ âm vô thanh, nó bị vô thanh hóa đọc cứng như "p" (VD: ab -> áp, gelb -> ghen-p).',
    examples: [
      { de: 'Brot', vi: 'Bánh mì', phonetic: 'B-rốt', ipa: '[bʁoːt]' },
      { de: 'Buch', vi: 'Quyển sách', phonetic: 'Bu-kh', ipa: '[buːx]' },
      { de: 'bitte', vi: 'Làm ơn / Xin mời', phonetic: 'Bít-tơ', ipa: '[ˈbɪtə]' }
    ],
    category: 'standard'
  },
  {
    id: 'c',
    letter: 'C c',
    name: 'Ce',
    ipa: '[tseː]',
    viApprox: 'tsê',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'Đọc là TS hoặc K',
    ttsLetter: 'Ce',
    mouthTip: 'Tên chữ cái đọc là "tsê" (bật t và xì s cùng lúc). Trong từ gốc Latin đứng trước e, i đọc là [ts], còn lại đọc là [k] hoặc đi kèm cụm ch, ck.',
    commonMistake: 'Đừng đọc thành âm "xê" mềm như tiếng Pháp hay "cờ" tiếng Việt.',
    examples: [
      { de: 'Café', vi: 'Quán cà phê', phonetic: 'Ca-phê', ipa: '[kaˈfeː]' },
      { de: 'Cent', vi: 'Đồng xu Cent', phonetic: 'Tsén-t', ipa: '[tsɛnt]' },
      { de: 'Computer', vi: 'Máy vi tính', phonetic: 'Côm-piu-tờ', ipa: '[kɔmˈpjuːtɐ]' }
    ],
    category: 'standard'
  },
  {
    id: 'd',
    letter: 'D d',
    name: 'De',
    ipa: '[deː]',
    viApprox: 'đê',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'De',
    mouthTip: 'Đầu lưỡi chạm nướu răng trên rồi bật ra. Khi ở cuối từ, phát âm cứng chuyển thành âm "t" (Auslautverhärtung).',
    commonMistake: 'Ở cuối từ như "Abend", "und", nhớ bật âm thành /t/ dứt khoát, không đọc thành /đ/.',
    examples: [
      { de: 'Danke', vi: 'Cảm ơn', phonetic: 'Đan-kơ', ipa: '[ˈdaŋkə]' },
      { de: 'Deutschland', vi: 'Nước Đức', phonetic: 'Đoi-t-sh-lan-đ(t)', ipa: '[ˈdɔɪ̯t͡ʃlant]' },
      { de: 'drei', vi: 'Số 3', phonetic: 'Đ-rai', ipa: '[dʁaɪ̯]' }
    ],
    category: 'standard'
  },
  {
    id: 'e',
    letter: 'E e',
    name: 'E',
    ipa: '[eː] / [ɛ] / [ə]',
    viApprox: 'ê (dài) / e (ngắn) / ơ (đuôi)',
    soundType: 'vowel',
    isDifficult: false,
    ttsLetter: 'E',
    mouthTip: 'Khóe miệng kéo sang hai bên. Ở đuôi từ không nhấn trọng âm (như danke, bitte), phát âm lướt nhẹ thành âm "ơ" ngắn [ə].',
    commonMistake: 'Đuôi -e trong tiếng Đức KHÔNG câm như tiếng Anh hay tiếng Pháp, luôn phải phát âm nhẹ /ơ/ (bitte = bít-tơ).',
    examples: [
      { de: 'Essen', vi: 'Thức ăn / Ăn', phonetic: 'Ét-sừn', ipa: '[ˈɛsn̩]' },
      { de: 'Elefant', vi: 'Con voi', phonetic: 'Ê-lê-phan-t', ipa: '[eleˈfant]' },
      { de: 'elf', vi: 'Số 11', phonetic: 'E-l-ph', ipa: '[ɛlf]' }
    ],
    category: 'standard'
  },
  {
    id: 'f',
    letter: 'F f',
    name: 'Ef',
    ipa: '[ɛf]',
    viApprox: 'ép',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Ef',
    mouthTip: 'Răng cửa trên chạm nhẹ môi dưới, thổi luồng hơi nhẹ ra khe răng, không rung thanh quản.',
    commonMistake: 'Âm f rất ổn định, giống hệt âm "ph/f" tiếng Việt.',
    examples: [
      { de: 'Frau', vi: 'Phụ nữ / Cô, Bà', phonetic: 'Ph-rao', ipa: '[fʁaʊ̯]' },
      { de: 'Freund', vi: 'Bạn bè', phonetic: 'Ph-roin-t', ipa: '[fʁɔɪ̯nt]' },
      { de: 'fertig', vi: 'Xong, hoàn thành', phonetic: 'Phe-r-tích', ipa: '[ˈfɛʁtɪç]' }
    ],
    category: 'standard'
  },
  {
    id: 'g',
    letter: 'G g',
    name: 'Ge',
    ipa: '[geː]',
    viApprox: 'gê',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Ge',
    mouthTip: 'Phần cuống lưỡi nâng lên chạm vòm họng mềm rồi bật luồng hơi ra, rung dây thanh âm. Giống âm "g" tiếng Việt.',
    commonMistake: 'Khi ở đuôi từ (như Tag, Zug), chữ g bị vô thanh hóa đọc cứng như /k/. Đuôi -ig lại đọc là /ɪç/ (ích).',
    examples: [
      { de: 'gut', vi: 'Tốt, ngon', phonetic: 'Gút', ipa: '[ɡuːt]' },
      { de: 'Garten', vi: 'Khu vườn', phonetic: 'Ga-r-từn', ipa: '[ˈɡaʁtn̩]' },
      { de: 'Geld', vi: 'Tiền', phonetic: 'Gen-t', ipa: '[ɡɛlt]' }
    ],
    category: 'standard'
  },
  {
    id: 'h',
    letter: 'H h',
    name: 'Ha',
    ipa: '[haː]',
    viApprox: 'ha',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'Phát âm ở đầu từ, Câm sau nguyên âm',
    ttsLetter: 'Ha',
    mouthTip: 'Ở đầu từ: Thở nhẹ một luồng hơi ấm từ cuống họng (như tiếng thở hắt). Sau nguyên âm: H hoàn toàn CÂM và có tác dụng kéo dài nguyên âm đứng trước (Dehnungs-h).',
    commonMistake: 'Đọc âm H trong từ "gehen" hay "wohnen". Hãy nhớ trong "wohnen", H câm, o kéo dài (đọc là vô-nừn).',
    examples: [
      { de: 'Hallo', vi: 'Xin chào', phonetic: 'Ha-lô (h bật)', ipa: '[ˈhaloː]' },
      { de: 'Haus', vi: 'Ngôi nhà', phonetic: 'Hao-s', ipa: '[haʊ̯s]' },
      { de: 'wohnen', vi: 'Sinh sống', phonetic: 'Vô-nừn (h câm)', ipa: '[ˈvoːnən]' }
    ],
    category: 'standard'
  },
  {
    id: 'i',
    letter: 'I i',
    name: 'I',
    ipa: '[iː] / [ɪ]',
    viApprox: 'i',
    soundType: 'vowel',
    isDifficult: false,
    ttsLetter: 'I',
    mouthTip: 'Khóe miệng mở rộng sang hai bên, mặt lưỡi nâng cao về phía vòm họng cứng.',
    commonMistake: 'Phân biệt i dài (trong "ihr", "wir") và i ngắn dứt khoát (trong "bitte", "immer").',
    examples: [
      { de: 'Igel', vi: 'Con nhím', phonetic: 'I-gừl', ipa: '[ˈiːɡl̩]' },
      { de: 'immer', vi: 'Luôn luôn', phonetic: 'Im-mờ', ipa: '[ˈɪmɐ]' },
      { de: 'in', vi: 'Ở trong', phonetic: 'In', ipa: '[ɪn]' }
    ],
    category: 'standard'
  },
  {
    id: 'j',
    letter: 'J j',
    name: 'Jot',
    ipa: '[jɔt]',
    viApprox: 'dót (phát âm như d/y)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'Đọc như D / Y, không đọc như J tiếng Anh',
    ttsLetter: 'Jot',
    mouthTip: 'Tên chữ cái là "Jot" (dót). Trong từ, chữ J phát âm giống như âm "d/gi" miền Bắc hoặc "y" miền Nam (như tiếng Anh "yes").',
    commonMistake: 'Tuyệt đối KHÔNG đọc thành âm "j/ch" nặng như trong "John" hay "jump" tiếng Anh!',
    examples: [
      { de: 'Ja', vi: 'Vâng, Có', phonetic: 'Da / Ya', ipa: '[jaː]' },
      { de: 'Jacke', vi: 'Áo khoác', phonetic: 'Da-kơ / Ya-kơ', ipa: '[ˈjakə]' },
      { de: 'Jahr', vi: 'Năm (tuổi)', phonetic: 'Da-r', ipa: '[jaːɐ̯]' }
    ],
    category: 'standard'
  },
  {
    id: 'k',
    letter: 'K k',
    name: 'Ka',
    ipa: '[kaː]',
    viApprox: 'ka',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Ka',
    mouthTip: 'Cuống lưỡi áp chặt lên vòm họng mềm, nén hơi rồi bật mạnh luồng khí ra ngoài (có bật hơi nhẹ).',
    commonMistake: 'Không nuốt âm k khi đứng ở đầu từ.',
    examples: [
      { de: 'Kaffee', vi: 'Cà phê', phonetic: 'Cáp-phê', ipa: '[ˈkafe]' },
      { de: 'Kind', vi: 'Đứa trẻ', phonetic: 'Kin-t', ipa: '[kɪnt]' },
      { de: 'Katze', vi: 'Con mèo', phonetic: 'Cát-tsơ', ipa: '[ˈkatsə]' }
    ],
    category: 'standard'
  },
  {
    id: 'l',
    letter: 'L l',
    name: 'El',
    ipa: '[ɛl]',
    viApprox: 'eo / el',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'El',
    mouthTip: 'Đầu lưỡi chạm nướu răng cửa trên, luồng hơi thoát ra hai bên mép lưỡi. Âm L tiếng Đức sáng và rõ ràng.',
    commonMistake: 'Tránh phát âm âm L quá tối (dark L) ở đuôi từ như tiếng Anh Mỹ.',
    examples: [
      { de: 'Lampe', vi: 'Cái đèn', phonetic: 'Lam-pơ', ipa: '[ˈlampə]' },
      { de: 'Liebe', vi: 'Tình yêu', phonetic: 'Li-bơ', ipa: '[ˈliːbə]' },
      { de: 'lernen', vi: 'Học tập', phonetic: 'Le-r-nừn', ipa: '[ˈlɛʁnən]' }
    ],
    category: 'standard'
  },
  {
    id: 'm',
    letter: 'M m',
    name: 'Em',
    ipa: '[ɛm]',
    viApprox: 'em',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Em',
    mouthTip: 'Hai môi khép lại, luồng hơi thoát qua đường mũi, rung dây thanh âm. Giống âm "m" tiếng Việt.',
    commonMistake: 'Rất dễ phát âm, không gây trở ngại.',
    examples: [
      { de: 'Mutter', vi: 'Người mẹ', phonetic: 'Mút-tờ', ipa: '[ˈmʊtɐ]' },
      { de: 'Milch', vi: 'Sữa', phonetic: 'Min-kh', ipa: '[mɪlç]' },
      { de: 'Mann', vi: 'Người đàn ông', phonetic: 'Man', ipa: '[man]' }
    ],
    category: 'standard'
  },
  {
    id: 'n',
    letter: 'N n',
    name: 'En',
    ipa: '[ɛn]',
    viApprox: 'en',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'En',
    mouthTip: 'Đầu lưỡi chạm nướu răng cửa trên, luồng hơi đi qua đường mũi. Giống âm "n" tiếng Việt.',
    commonMistake: 'Đuôi -en của động từ (gehen, kommen) thường phát âm lướt nhẹ thành âm "-ừn" hoặc nuốt âm e.',
    examples: [
      { de: 'Nein', vi: 'Không', phonetic: 'Nai-n', ipa: '[naɪ̯n]' },
      { de: 'Name', vi: 'Tên', phonetic: 'Na-mơ', ipa: '[ˈnaːmə]' },
      { de: 'Nacht', vi: 'Đêm', phonetic: 'Na-kh-t', ipa: '[naxt]' }
    ],
    category: 'standard'
  },
  {
    id: 'o',
    letter: 'O o',
    name: 'O',
    ipa: '[oː] / [ɔ]',
    viApprox: 'ô (dài) / o (ngắn)',
    soundType: 'vowel',
    isDifficult: false,
    ttsLetter: 'O',
    mouthTip: 'Chu tròn môi về phía trước. Âm o dài đọc như "ô" ngân vang (Opa), âm o ngắn đọc như "o" gọn ghẽ (oft).',
    commonMistake: 'Không nhầm lẫn với chữ Ö (Ö chu môi nhưng phát âm ê).',
    examples: [
      { de: 'Opa', vi: 'Ông nội/ngoại', phonetic: 'Ô-pa', ipa: '[ˈoːpa]' },
      { de: 'Ohr', vi: 'Cái tai', phonetic: 'Ô-r', ipa: '[oːɐ̯]' },
      { de: 'oft', vi: 'Thường xuyên', phonetic: 'Op-t', ipa: '[ɔft]' }
    ],
    category: 'standard'
  },
  {
    id: 'p',
    letter: 'P p',
    name: 'Pe',
    ipa: '[peː]',
    viApprox: 'pê',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Pe',
    mouthTip: 'Mím chặt hai môi lại rồi bật luồng hơi mạnh ra ngoài (âm bật hơi voiceless aspirated).',
    commonMistake: 'Nhớ bật hơi dứt khoát, không đọc thành âm b nhẹ.',
    examples: [
      { de: 'Papier', vi: 'Giấy', phonetic: 'Pa-pi-ờ', ipa: '[paˈpiːɐ̯]' },
      { de: 'Park', vi: 'Công viên', phonetic: 'Pác-k', ipa: '[paʁk]' },
      { de: 'Party', vi: 'Bữa tiệc', phonetic: 'Pác-ti', ipa: '[ˈpaːɐ̯ti]' }
    ],
    category: 'standard'
  },
  {
    id: 'q',
    letter: 'Q q',
    name: 'Ku',
    ipa: '[kuː]',
    viApprox: 'cu (trong từ luôn đi cùng U: QU = [kv])',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'Luôn đi kèm U: qu = [kv]',
    ttsLetter: 'Ku',
    mouthTip: 'Tên chữ cái là "Ku". Trong tiếng Đức, chữ Q hầu như luôn đi kèm chữ U ("qu") và phát âm thành cụm "k-v" (bật k rồi chuyển nhanh sang v).',
    commonMistake: 'Không đọc là "qu/quơ" tiếng Việt, mà đọc là "k-v" (VD: bequem = bê-kvem).',
    examples: [
      { de: 'bequem', vi: 'Thoải mái', phonetic: 'Bê-kvem', ipa: '[bəˈkveːm]' },
      { de: 'Quelle', vi: 'Nguồn (nước/tin)', phonetic: 'Kve-lơ', ipa: '[ˈkvɛlə]' },
      { de: 'Quiz', vi: 'Câu đố trắc nghiệm', phonetic: 'Kvít-s', ipa: '[kvɪs]' }
    ],
    category: 'standard'
  },
  {
    id: 'r',
    letter: 'R r',
    name: 'Er',
    ipa: '[ɛʁ] / [ʁ] / [ɐ]',
    viApprox: 'e-rơ (rung họng) / ờ (cuối từ)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'Âm rung lưỡi gà / Họng đặc thù',
    ttsLetter: 'Er',
    mouthTip: 'Ở đầu/giữa từ: Rung nhẹ lưỡi gà/cuống họng (như khi súc miệng bằng nước, âm [ʁ]). Ở đuôi từ (như -er): thả lỏng đọc nhẹ lướt thành âm "ờ/à" ngắn [ɐ].',
    commonMistake: 'Không uốn cong đầu lưỡi rung mạnh kiểu tiếng Nga hay tiếng Tây Ban Nha. Trong Hochdeutsch hiện đại, âm R nằm ở sâu trong cuống họng.',
    examples: [
      { de: 'rot', vi: 'Màu đỏ', phonetic: 'Rốt (rung họng)', ipa: '[ʁoːt]' },
      { de: 'richtig', vi: 'Đúng đắn', phonetic: 'Rích-tích', ipa: '[ˈʁɪçtɪç]' },
      { de: 'Mutter', vi: 'Người mẹ', phonetic: 'Mút-tờ (-er đọc ờ)', ipa: '[ˈmʊtɐ]' }
    ],
    category: 'standard'
  },
  {
    id: 's',
    letter: 'S s',
    name: 'Es',
    ipa: '[ɛs] / [z] / [ʃ]',
    viApprox: 'ét (đầu từ đọc rung d/z, trước p/t đọc sh)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'Đầu từ đọc [z], trước p/t đọc [ʃ], cuối từ đọc [s]',
    ttsLetter: 'Es',
    mouthTip: '1. Đứng trước nguyên âm ở đầu từ: đọc rung nhẹ như âm "d/gi" tiếng Việt [z] (Sonne = Don-nơ). 2. Ở đuôi từ: đọc xì sắc nét [s] (Haus = Hao-s). 3. Đứng đầu cụm sp, st: đọc là sh [ʃ] (Sport, Stadt).',
    commonMistake: 'Đọc âm S ở đầu từ "Sonne" thành âm "s" xì không rung.',
    examples: [
      { de: 'Sonne', vi: 'Mặt trời', phonetic: 'Đon-nơ / Zon-nơ', ipa: '[ˈzɔnə]' },
      { de: 'Salat', vi: 'Món salad', phonetic: 'Đa-lát', ipa: '[zaˈlaːt]' },
      { de: 'Haus', vi: 'Ngôi nhà', phonetic: 'Hao-s (xì dứt khoát)', ipa: '[haʊ̯s]' }
    ],
    category: 'standard'
  },
  {
    id: 't',
    letter: 'T t',
    name: 'Te',
    ipa: '[teː]',
    viApprox: 'tê',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Te',
    mouthTip: 'Đầu lưỡi chạm nướu răng cửa trên rồi bật mạnh ra (có bật hơi nhẹ). Giống âm "t" tiếng Việt nhưng dứt khoát hơn.',
    commonMistake: 'Không đọc thành âm "th" tiếng Anh hay "th" tiếng Việt.',
    examples: [
      { de: 'Tee', vi: 'Trà', phonetic: 'Tê', ipa: '[teː]' },
      { de: 'Tag', vi: 'Ngày', phonetic: 'Tác', ipa: '[taːk]' },
      { de: 'Tisch', vi: 'Cái bàn', phonetic: 'Tí-sh', ipa: '[tɪʃ]' }
    ],
    category: 'standard'
  },
  {
    id: 'u',
    letter: 'U u',
    name: 'U',
    ipa: '[uː] / [ʊ]',
    viApprox: 'u',
    soundType: 'vowel',
    isDifficult: false,
    ttsLetter: 'U',
    mouthTip: 'Chu môi tròn về phía trước, cuống lưỡi nâng cao về phía vòm họng mềm. Âm u dài như "u" ngân vang (gut), âm u ngắn dứt khoát (und).',
    commonMistake: 'Không nhầm lẫn với Ü (Ü chu môi nhưng vị trí lưỡi và âm phát ra là I).',
    examples: [
      { de: 'und', vi: 'Và', phonetic: 'Un-t', ipa: '[ʊnt]' },
      { de: 'Uhr', vi: 'Đồng hồ / Giờ', phonetic: 'U-ờ', ipa: '[uːɐ̯]' },
      { de: 'unten', vi: 'Ở phía dưới', phonetic: 'Un-từn', ipa: '[ˈʊntn̩]' }
    ],
    category: 'standard'
  },
  {
    id: 'v',
    letter: 'V v',
    name: 'Vau',
    ipa: '[faʊ] / [v]',
    viApprox: 'phau (đọc như F trong từ gốc Đức)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: '🔥 Cực dễ nhầm: V đọc là F!',
    ttsLetter: 'Vau',
    mouthTip: 'Tên chữ cái đọc là "Vau" [faʊ]. Trong đa số các từ gốc Đức, chữ V phát âm là âm "ph/f" (răng trên chạm môi dưới thổi hơi). Chỉ trong từ mượn gốc Latin/ngoại lai mới đọc là "v" (Vase, Visum).',
    commonMistake: 'LỖI SỐ 1 CỦA NGƯỜI MỚI HỌC: Thấy chữ V liền đọc thành âm V tiếng Việt! Phải đọc "Vater" là "Pha-tờ", "vier" là "Phi-ờ"!',
    examples: [
      { de: 'Vater', vi: 'Người bố', phonetic: 'Pha-tờ', ipa: '[ˈfaːtɐ]' },
      { de: 'vier', vi: 'Số 4', phonetic: 'Phi-ờ', ipa: '[fiːɐ̯]' },
      { de: 'Vogel', vi: 'Con chim', phonetic: 'Phô-gừl', ipa: '[ˈfoːɡl̩]' },
      { de: 'von', vi: 'Của / Từ', phonetic: 'Phon', ipa: '[fɔn]' }
    ],
    category: 'standard'
  },
  {
    id: 'w',
    letter: 'W w',
    name: 'We',
    ipa: '[veː]',
    viApprox: 'vê (phát âm như V tiếng Việt)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: '🔥 Cực dễ nhầm: W đọc là V!',
    ttsLetter: 'We',
    mouthTip: 'Tên chữ cái đọc là "We" [veː]. Trong từ, chữ W LUÔN PHÁT ÂM LÀ ÂM "V" (răng trên chạm nhẹ môi dưới và rung dây thanh âm).',
    commonMistake: 'LỖI KINH ĐIỂN: Đọc W thành âm "quờ/wo" như tiếng Anh. "Wasser" phải đọc là "Va-sờ", "wie" phải đọc là "Vi"!',
    examples: [
      { de: 'Wasser', vi: 'Nước', phonetic: 'Va-sờ', ipa: '[ˈvasɐ]' },
      { de: 'wo', vi: 'Ở đâu', phonetic: 'Vô', ipa: '[voː]' },
      { de: 'wie', vi: 'Như thế nào', phonetic: 'Vi', ipa: '[viː]' },
      { de: 'wer', vi: 'Ai', phonetic: 'Ve-r', ipa: '[veːɐ̯]' }
    ],
    category: 'standard'
  },
  {
    id: 'x',
    letter: 'X x',
    name: 'Ix',
    ipa: '[ɪks]',
    viApprox: 'ích-s',
    soundType: 'consonant',
    isDifficult: false,
    ttsLetter: 'Ix',
    mouthTip: 'Phát âm tổ hợp hai âm "k" và "s" nối liền nhau thật nhanh [ks].',
    commonMistake: 'Ít xuất hiện trong từ gốc Đức, thường gặp trong từ mượn.',
    examples: [
      { de: 'Taxi', vi: 'Xe taxi', phonetic: 'Tác-xi', ipa: '[ˈtaksi]' },
      { de: 'Text', vi: 'Văn bản', phonetic: 'Tếch-s-t', ipa: '[tɛkst]' },
      { de: 'Xylofon', vi: 'Đàn mộc cầm', phonetic: 'Ksy-lô-phôn', ipa: '[ksyloˈfoːn]' }
    ],
    category: 'standard'
  },
  {
    id: 'y',
    letter: 'Y y',
    name: 'Ypsilon',
    ipa: '[ˈʏpsilɔn] / [yː] / [j]',
    viApprox: 'úp-xi-lon (trong từ đọc như ü hoặc y)',
    soundType: 'vowel',
    isDifficult: true,
    difficultyTag: 'Tên là Ypsilon, đọc như Ü',
    ttsLetter: 'Ypsilon',
    mouthTip: 'Tên chữ cái là "Ypsilon" [ˈʏpsilɔn]. Trong từ, chữ Y hoạt động như một nguyên âm và phát âm giống hệt chữ "Ü" (chu môi nói i) như trong "Typ", "Physik".',
    commonMistake: 'Đọc chữ Y thành "wai" theo thói quen tiếng Anh.',
    examples: [
      { de: 'Typ', vi: 'Kiểu / Chàng trai', phonetic: 'Tuy-p (chu môi)', ipa: '[tyːp]' },
      { de: 'Physik', vi: 'Vật lý học', phonetic: 'Phuy-dích', ipa: '[fyˈziːk]' },
      { de: 'Yoga', vi: 'Môn Yoga', phonetic: 'Dô-ga', ipa: '[ˈjoːɡa]' }
    ],
    category: 'standard'
  },
  {
    id: 'z',
    letter: 'Z z',
    name: 'Zett',
    ipa: '[tsɛt] / [ts]',
    viApprox: 'tsét (LUÔN BẬT ÂM TS)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: '🔥 Bật âm TS, tuyệt đối không đọc là Z/D!',
    ttsLetter: 'Zett',
    mouthTip: 'Tên chữ cái đọc là "Zett" [tsɛt]. Chữ Z trong tiếng Đức LUÔN LUÔN PHÁT ÂM LÀ CỤM [ts]: Chặn đầu lưỡi sau răng cửa trên tạo âm "t" rồi lập tức bật ra luồng hơi xì sắc nét "s".',
    commonMistake: 'LỖI RẤT PHỔ BIẾN: Đọc Z thành âm "d/gi" tiếng Việt hay "z" tiếng Anh! "Zeit" phải đọc là "Tsait" (không phải deit/zeit), "Zug" phải đọc là "Tsúc"!',
    examples: [
      { de: 'Zeit', vi: 'Thời gian', phonetic: 'Tsai-t', ipa: '[tsaɪ̯t]' },
      { de: 'Zug', vi: 'Tàu hỏa', phonetic: 'Tsúc', ipa: '[tsuːk]' },
      { de: 'Zimmer', vi: 'Căn phòng', phonetic: 'Tsím-mờ', ipa: '[ˈtsɪmɐ]' },
      { de: 'zwei', vi: 'Số 2', phonetic: 'Ts-vai', ipa: '[tsvaɪ̯]' }
    ],
    category: 'standard'
  },

  // --- 4 Ký tự Đặc biệt (Umlaute & Eszett) ---
  {
    id: 'ae',
    letter: 'Ä ä',
    name: 'A-Umlaut',
    ipa: '[ɛː] / [ɛ]',
    viApprox: 'e (e bẹt mở rộng miệng)',
    soundType: 'vowel',
    isDifficult: true,
    difficultyTag: '✨ Nguyên âm biến đổi (Umlaut)',
    ttsLetter: 'Ä',
    mouthTip: 'Khẩu hình: Mở miệng rộng ở khoảng giữa âm "e" và "a", hạ cuống lưỡi xuống. Nghe tương tự như âm "e bẹt" (/æ/) hoặc "e" thoáng rộng.',
    commonMistake: 'Đọc thành âm "a" bình thường do quên dấu hai chấm trên đầu.',
    examples: [
      { de: 'Äpfel', vi: 'Những quả táo (số nhiều)', phonetic: 'Ép-phồ', ipa: '[ˈɛpfl̩]' },
      { de: 'Mädchen', vi: 'Cô bé / Bé gái', phonetic: 'Mét-khừn', ipa: '[ˈmɛːtçn̩]' },
      { de: 'Käse', vi: 'Phô mai', phonetic: 'Kê-dơ', ipa: '[ˈkɛːzə]' }
    ],
    category: 'umlaut'
  },
  {
    id: 'oe',
    letter: 'Ö ö',
    name: 'O-Umlaut',
    ipa: '[øː] / [œ]',
    viApprox: 'chu môi nói "ê" (tựa như ơ/ê)',
    soundType: 'vowel',
    isDifficult: true,
    difficultyTag: '🔥 RẤT KHÓ: Chu tròn môi nói âm Ê!',
    ttsLetter: 'Ö',
    mouthTip: 'BÍ QUYẾT VÀNG: Định hình môi tròn xoe căng về phía trước như chuẩn bị nói "Ô", nhưng giữ nguyên môi đó và cố gắng phát ra âm "Ê". Âm phát ra sẽ trầm ấm giữa "ơ" và "ê".',
    commonMistake: 'Người Việt hay đọc lướt thành âm "ô" hoặc "ơ" thông thường mà không chu tròn môi, làm người bản xứ nghe thành chữ O hoặc E.',
    examples: [
      { de: 'schön', vi: 'Đẹp, hay', phonetic: 'Sh-ơn (tròn môi)', ipa: '[ʃøːn]' },
      { de: 'Öl', vi: 'Dầu ăn / Dầu mỏ', phonetic: 'Ơ-l (tròn môi)', ipa: '[øːl]' },
      { de: 'Können', vi: 'Có thể', phonetic: 'Kơn-nừn (tròn môi)', ipa: '[ˈkœnən]' },
      { de: 'Köln', vi: 'Thành phố Cologne', phonetic: 'Kơn-n (tròn môi)', ipa: '[kœln]' }
    ],
    category: 'umlaut'
  },
  {
    id: 'ue',
    letter: 'Ü ü',
    name: 'U-Umlaut',
    ipa: '[yː] / [ʏ]',
    viApprox: 'chu môi huýt sáo nói "i" (tựa như uy)',
    soundType: 'vowel',
    isDifficult: true,
    difficultyTag: '🔥 RẤT KHÓ: Chu môi huýt sáo nói âm I!',
    ttsLetter: 'Ü',
    mouthTip: 'BÍ QUYẾT VÀNG: Chu môi thật nhỏ và nhọn về phía trước như khi huýt sáo hoặc chuẩn bị nói "U", nhưng vị trí đầu lưỡi áp sát chân răng cửa dưới và phát ra âm "I". Nghe tựa như "uy" nhưng tròn môi khép chặt.',
    commonMistake: 'Đọc thành âm "u" thuần túy (VD: "über" đọc thành "u-bờ" là SAI, phải đọc là "uy-bờ" tròn môi).',
    examples: [
      { de: 'über', vi: 'Về / Ở trên', phonetic: 'Uy-bờ (tròn môi)', ipa: '[ˈyːbɐ]' },
      { de: 'Tschüss', vi: 'Tạm biệt', phonetic: 'T-shuy-s', ipa: '[t͡ʃʏs]' },
      { de: 'Mütze', vi: 'Mũ len', phonetic: 'Muy-tsơ', ipa: '[ˈmʏtsə]' },
      { de: 'fünf', vi: 'Số 5', phonetic: 'Phuyn-ph', ipa: '[fʏnf]' }
    ],
    category: 'umlaut'
  },
  {
    id: 'sz',
    letter: 'ß',
    name: 'Eszett / Scharfes S',
    ipa: '[s]',
    viApprox: 's (xì mạnh sắc nét)',
    soundType: 'consonant',
    isDifficult: true,
    difficultyTag: 'S sắc nét (đứng sau nguyên âm dài)',
    ttsLetter: 'Eszett',
    mouthTip: 'Chữ cái này không có âm in hoa trong bảng chữ cái truyền thống (hoặc viết là SS / ẞ). Phát âm là một âm "s" xì hơi rất sắc nét, kéo dài, không rung thanh quản.',
    commonMistake: 'Nhầm lẫn hình dạng chữ "ß" với chữ "B". Nó là một chữ cái phụ âm phát âm là "S"!',
    examples: [
      { de: 'Straße', vi: 'Đường phố', phonetic: 'Sh-tra-sơ', ipa: '[ˈʃtʁaːsə]' },
      { de: 'heiß', vi: 'Nóng', phonetic: 'Hai-s', ipa: '[haɪ̯s]' },
      { de: 'groß', vi: 'To lớn', phonetic: 'G-rô-s', ipa: '[ɡʁoːs]' },
      { de: 'weiß', vi: 'Màu trắng / Biết', phonetic: 'Vai-s', ipa: '[vaɪ̯s]' }
    ],
    category: 'umlaut'
  },

  // --- 11 Cụm âm ghép quan trọng & Cặp âm dễ nhầm (Letter Clusters) ---
  {
    id: 'cluster_ei',
    letter: 'EI / ei',
    name: 'Ei-Laut',
    ipa: '[aɪ̯]',
    viApprox: 'ai',
    soundType: 'diphthong',
    isDifficult: true,
    difficultyTag: '🔥 Cực dễ nhầm: EI đọc là AI!',
    ttsLetter: 'Ei',
    mouthTip: 'Mở rộng miệng phát âm "a" rồi chuyển nhanh thu hẹp khóe miệng sang "i". Đọc giống hệt từ "ai" trong tiếng Việt.',
    commonMistake: 'LỖI PHỔ BIẾN: Nhầm với "ie". Cứ thấy chữ nào đứng trước thì phát âm chữ đó! E đứng trước I -> đọc thành âm A (ai).',
    examples: [
      { de: 'mein', vi: 'Của tôi', phonetic: 'Mai-n', ipa: '[maɪ̯n]' },
      { de: 'nein', vi: 'Không', phonetic: 'Nai-n', ipa: '[naɪ̯n]' },
      { de: 'Wein', vi: 'Rượu vang', phonetic: 'Vai-n', ipa: '[vaɪ̯n]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_ie',
    letter: 'IE / ie',
    name: 'Ie-Laut',
    ipa: '[iː]',
    viApprox: 'i (i dài ngân vang)',
    soundType: 'diphthong',
    isDifficult: true,
    difficultyTag: '🔥 Cực dễ nhầm: IE đọc là I dài!',
    ttsLetter: 'Ie',
    mouthTip: 'Phát âm là một âm "i" kéo dài ngân vang. Chữ "e" ở đây đóng vai trò làm dài âm i chứ không phát âm thành âm riêng biệt.',
    commonMistake: 'Đọc nhầm thành "ai" hoặc đọc tách rời i-e.',
    examples: [
      { de: 'sie', vi: 'Cô ấy / Họ / Ngài', phonetic: 'Di / Zi (i dài)', ipa: '[ziː]' },
      { de: 'Wien', vi: 'Thủ đô Viên (Áo)', phonetic: 'Vin (i dài)', ipa: '[viːn]' },
      { de: 'hier', vi: 'Ở đây', phonetic: 'Hi-ờ', ipa: '[hiːɐ̯]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_eu',
    letter: 'EU / ÄU',
    name: 'Eu/Äu-Laut',
    ipa: '[ɔɪ̯]',
    viApprox: 'oi',
    soundType: 'diphthong',
    isDifficult: true,
    difficultyTag: 'EU & ÄU luôn đọc là OI',
    ttsLetter: 'Eu',
    mouthTip: 'Khẩu hình chuyển từ "o" tròn môi sang "i". Giống hệt âm "oi" trong tiếng Việt.',
    commonMistake: 'Nhìn chữ "eu" rồi đọc thành "êu" kiểu tiếng Việt (như Deutschland đọc thành Đêu-t-sh-lan là SAI, phải là Đoi-t-sh-lan).',
    examples: [
      { de: 'Deutsch', vi: 'Tiếng Đức', phonetic: 'Đoi-t-sh', ipa: '[dɔɪ̯t͡ʃ]' },
      { de: 'Euro', vi: 'Đồng tiền Euro', phonetic: 'Oi-rô', ipa: '[ˈɔɪ̯ʁoː]' },
      { de: 'Häuser', vi: 'Những ngôi nhà', phonetic: 'Hoi-dờ', ipa: '[ˈhɔɪ̯zɐ]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_au',
    letter: 'AU / au',
    name: 'Au-Laut',
    ipa: '[aʊ̯]',
    viApprox: 'ao / au',
    soundType: 'diphthong',
    isDifficult: false,
    ttsLetter: 'Au',
    mouthTip: 'Mở rộng miệng phát âm "a" rồi thu tròn môi lại thành "u". Tương tự như âm "ao/au" tiếng Việt.',
    commonMistake: 'Rất dễ phát âm, không gây nhầm lẫn.',
    examples: [
      { de: 'Haus', vi: 'Ngôi nhà', phonetic: 'Hao-s', ipa: '[haʊ̯s]' },
      { de: 'Frau', vi: 'Phụ nữ', phonetic: 'Ph-rao', ipa: '[fʁaʊ̯]' },
      { de: 'Auto', vi: 'Xe hơi', phonetic: 'Ao-tô', ipa: '[ˈaʊ̯toː]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_ch_ich',
    letter: 'CH (Ich-Laut)',
    name: 'Ich-Laut',
    ipa: '[ç]',
    viApprox: 'xì nhẹ lưng lưỡi vòm họng trước',
    soundType: 'consonant_cluster',
    isDifficult: true,
    difficultyTag: 'Đứng sau E, I, Ä, Ö, Ü: Xì nhẹ vòm họng',
    ttsLetter: 'ich',
    mouthTip: 'Quy tắc: Khi CH đứng sau e, i, ä, ö, ü, eu hoặc sau phụ âm (l, r, n). Khẩu hình: Áp nhẹ lưng lưỡi lên vòm họng cứng và đẩy luồng hơi êm ra (giống như tiếng mèo khè nhẹ).',
    commonMistake: 'TUYỆT ĐỐI KHÔNG đọc thành âm "k" (ich không phải là "ích-k" hay "ít")!',
    examples: [
      { de: 'ich', vi: 'Tôi', phonetic: 'I-kh (xì nhẹ vòm họng)', ipa: '[ʔɪç]' },
      { de: 'nicht', vi: 'Không', phonetic: 'Ní-kh-t', ipa: '[nɪçt]' },
      { de: 'Milch', vi: 'Sữa', phonetic: 'Min-kh', ipa: '[mɪlç]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_ch_ach',
    letter: 'CH (Ach-Laut)',
    name: 'Ach-Laut',
    ipa: '[x]',
    viApprox: 'kh khạc nhẹ sâu cuống họng',
    soundType: 'consonant_cluster',
    isDifficult: true,
    difficultyTag: 'Đứng sau A, O, U, AU: Khạc sâu cuống họng',
    ttsLetter: 'ach',
    mouthTip: 'Quy tắc: Khi CH đứng sau a, o, u, au. Khẩu hình: Nâng cuống lưỡi lên gần vòm họng mềm, đẩy luồng hơi mạnh từ sâu cổ họng tạo âm khạc nhẹ (giống âm "kh" sâu trong tiếng Nga hoặc tiếng Ả Rập).',
    commonMistake: 'Đọc âm kh quá nhẹ ở đầu môi thay vì cuống họng.',
    examples: [
      { de: 'Buch', vi: 'Quyển sách', phonetic: 'Bu-kh (cuống họng)', ipa: '[buːx]' },
      { de: 'Nacht', vi: 'Đêm', phonetic: 'Na-kh-t', ipa: '[naxt]' },
      { de: 'Kuchen', vi: 'Bánh ngọt', phonetic: 'Cu-khừn', ipa: '[ˈkuːxn̩]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_sch',
    letter: 'SCH / sch',
    name: 'Sch-Laut',
    ipa: '[ʃ]',
    viApprox: 'sh (chu tròn môi xì mạnh)',
    soundType: 'consonant_cluster',
    isDifficult: false,
    ttsLetter: 'sch',
    mouthTip: 'Chu tròn môi căng về phía trước và đẩy luồng hơi mạnh qua khe răng (giống âm "sh" trong tiếng Anh hoặc tiếng suỵt im lặng).',
    commonMistake: 'Không phát âm hời hợt như âm "s/x" nhẹ tiếng Việt.',
    examples: [
      { de: 'Schule', vi: 'Trường học', phonetic: 'Shu-lơ', ipa: '[ˈʃuːlə]' },
      { de: 'schön', vi: 'Đẹp', phonetic: 'Sh-ơn', ipa: '[ʃøːn]' },
      { de: 'schnell', vi: 'Nhanh chóng', phonetic: 'Sh-nen', ipa: '[ʃnɛl]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_sp_st',
    letter: 'SP / ST (ở đầu từ)',
    name: 'Sp/St-Laut',
    ipa: '[ʃp] / [ʃt]',
    viApprox: 'shp / sht (ở đầu từ/âm tiết)',
    soundType: 'consonant_cluster',
    isDifficult: true,
    difficultyTag: 'Ở đầu từ luôn đọc là SHP và SHT',
    ttsLetter: 'Sport',
    mouthTip: 'Khi SP và ST đứng ở ĐẦU TỪ hoặc ĐẦU ÂM TIẾT: Chữ "s" tự động chuyển thành âm "sh" [ʃ] chu môi! Đọc là "shp" và "sht". Nếu ở giữa hoặc cuối từ (như Fenster, Post) thì vẫn đọc s bình thường.',
    commonMistake: 'Đọc là "sp" và "st" thông thường (như Sport đọc thành x-po là SAI, phải đọc là Sh-port).',
    examples: [
      { de: 'Sport', vi: 'Thể thao', phonetic: 'Sh-port', ipa: '[ʃpɔʁt]' },
      { de: 'sprechen', vi: 'Nói chuyện', phonetic: 'Sh-pre-khừn', ipa: '[ˈʃpʁɛçn̩]' },
      { de: 'Stadt', vi: 'Thành phố', phonetic: 'Sh-tát', ipa: '[ʃtat]' },
      { de: 'Straße', vi: 'Đường phố', phonetic: 'Sh-tra-sơ', ipa: '[ˈʃtʁaːsə]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_tsch',
    letter: 'TSCH / tsch',
    name: 'Tsch-Laut',
    ipa: '[t͡ʃ]',
    viApprox: 'ch / tr (bật mạnh)',
    soundType: 'consonant_cluster',
    isDifficult: false,
    ttsLetter: 'tsch',
    mouthTip: 'Chặn hơi bằng đầu lưỡi chạm vòm miệng rồi bật mạnh ra ngoài tạo thành âm "ch/tr" nặng chu môi.',
    commonMistake: 'Rất quen thuộc trong từ chào tạm biệt "Tschüss"!',
    examples: [
      { de: 'Tschüss', vi: 'Tạm biệt', phonetic: 'T-shuy-s', ipa: '[t͡ʃʏs]' },
      { de: 'Deutschland', vi: 'Nước Đức', phonetic: 'Đoi-t-sh-lan-đ', ipa: '[ˈdɔɪ̯t͡ʃlant]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_ig',
    letter: '-IG (ở cuối từ)',
    name: 'Ig-Endung',
    ipa: '[ɪç]',
    viApprox: 'ích (xì nhẹ đuôi từ)',
    soundType: 'suffix',
    isDifficult: true,
    difficultyTag: 'Đuôi -ig đọc chuẩn là "ích" [ɪç]',
    ttsLetter: 'richtig',
    mouthTip: 'Trong tiếng Đức chuẩn (Hochdeutsch), đuôi "-ig" ở cuối từ phát âm giống hệt chữ "ich" [ɪç] xì nhẹ vòm họng trước.',
    commonMistake: 'Đọc cứng đuôi -ig thành âm "ích-k" hoặc "ích-g".',
    examples: [
      { de: 'richtig', vi: 'Đúng, chuẩn xác', phonetic: 'Rích-tích', ipa: '[ˈʁɪçtɪç]' },
      { de: 'fertig', vi: 'Xong, xong xuôi', phonetic: 'Phe-r-tích', ipa: '[ˈfɛʁtɪç]' },
      { de: 'zwanzig', vi: 'Số 20', phonetic: 'Ts-van-tsích', ipa: '[ˈtsvantsɪç]' }
    ],
    category: 'cluster'
  },
  {
    id: 'cluster_pf',
    letter: 'PF / pf',
    name: 'Pf-Laut',
    ipa: '[p͡f]',
    viApprox: 'p-f (bật p rồi xì f)',
    soundType: 'consonant_cluster',
    isDifficult: true,
    difficultyTag: 'Đặc thù tiếng Đức: Bật P rồi thổi F',
    ttsLetter: 'Apfel',
    mouthTip: 'Mím chặt môi bật nhẹ âm "p" rồi lập tức đưa răng trên chạm môi dưới thổi ra âm "f". Cụm âm rất đặc trưng của tiếng Đức.',
    commonMistake: 'Người học hay nuốt mất âm p mà chỉ đọc âm f (Apfel đọc thành A-phen là SAI, phải là Áp-phồ).',
    examples: [
      { de: 'Apfel', vi: 'Quả táo', phonetic: 'Áp-phồ', ipa: '[ˈapfl̩]' },
      { de: 'Pferd', vi: 'Con ngựa', phonetic: 'P-phe-r-t', ipa: '[pfeːɐ̯t]' },
      { de: 'Pfeffer', vi: 'Hạt tiêu', phonetic: 'P-phe-phờ', ipa: '[ˈpfɛfɐ]' }
    ],
    category: 'cluster'
  }
];

/**
 * Curated Minimal Pairs for Ear Training Drills
 */
export const MINIMAL_PAIRS = [
  {
    id: 'v_vs_w',
    title: 'Phân biệt V (phát âm F) vs W (phát âm V)',
    tag: 'Cặp nhầm lẫn số 1',
    itemA: { letter: 'V v', sound: '[f]', word: 'vier', meaning: 'Số 4', audio: 'vier' },
    itemB: { letter: 'W w', sound: '[v]', word: 'wir', meaning: 'Chúng tôi', audio: 'wir' },
    hint: 'V trong "vier" thổi hơi răng môi (như F); W trong "wir" rung môi răng (như V tiếng Việt).'
  },
  {
    id: 'ei_vs_ie',
    title: 'Phân biệt EI (đọc là AI) vs IE (đọc là I dài)',
    tag: 'Cặp nguyên âm đôi kinh điển',
    itemA: { letter: 'EI', sound: '[aɪ̯]', word: 'Wein', meaning: 'Rượu vang', audio: 'Wein' },
    itemB: { letter: 'IE', sound: '[iː]', word: 'Wien', meaning: 'Thủ đô Viên', audio: 'Wien' },
    hint: 'Wein đọc là "Vai-n" (ai); Wien đọc là "Vi-n" (i dài).'
  },
  {
    id: 'oe_vs_ue',
    title: 'Phân biệt Umlaute Ö (chu môi nói Ê) vs Ü (chu môi nói I)',
    tag: 'Khẩu hình Umlaute',
    itemA: { letter: 'Ö ö', sound: '[øː]', word: 'schon', meaning: 'Đã (O thường)', audio: 'schon' },
    itemB: { letter: 'Ö ö (Umlaut)', sound: '[øː]', word: 'schön', meaning: 'Xinh đẹp (Ö tròn môi)', audio: 'schön' },
    hint: 'schon đọc ô bình thường; schön tròn môi phát ra âm ê.'
  },
  {
    id: 'ch_ich_vs_ach',
    title: 'Phân biệt CH: Ich-Laut [ç] vs Ach-Laut [x]',
    tag: 'Vị trí âm CH',
    itemA: { letter: 'CH sau I/E', sound: '[ç]', word: 'ich', meaning: 'Tôi', audio: 'ich' },
    itemB: { letter: 'CH sau A/U', sound: '[x]', word: 'Buch', meaning: 'Quyển sách', audio: 'Buch' },
    hint: 'ich xì nhẹ ở vòm miệng trước; Buch khạc nhẹ ở cuống họng sâu.'
  }
];

/**
 * Get all letters flagged as difficult
 */
export function getDifficultLetters() {
  return GERMAN_ALPHABET.filter(item => item.isDifficult);
}

/**
 * Find alphabet item by ID
 */
export function getAlphabetItemById(id) {
  return GERMAN_ALPHABET.find(item => item.id === id) || null;
}
