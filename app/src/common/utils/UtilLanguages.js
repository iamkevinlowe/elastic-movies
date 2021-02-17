const LANGUAGE_CODE_MAP = {
	en: {
		name: 'English',
		nativeName: 'English'
	},
	fr: {
		name: 'French',
		nativeName: 'Français'
	},
	es: {
		name: 'Spanish',
		nativeName: 'Español'
	},
	de: {
		name: 'German',
		nativeName: 'Deutsch'
	},
	ja: {
		name: 'Japanese',
		nativeName: '日本語'
	},
	it: {
		name: 'Italian',
		nativeName: 'Italiano'
	},
	pt: {
		name: 'Portuguese',
		nativeName: 'Português'
	},
	ru: {
		name: 'Russian',
		nativeName: 'Pусский'
	},
	ko: {
		name: 'Korean',
		nativeName: '한국어'
	},
	zh: {
		name: 'Chinese',
		nativeName: '中文'
	},
	nl: {
		name: 'Dutch',
		nativeName: 'Nederlands'
	},
	sv: {
		name: 'Swedish',
		nativeName: 'Svenska'
	},
	cs: {
		name: 'Czech',
		nativeName: 'čeština'
	},
	hi: {
		name: 'Hindi',
		nativeName: 'हिन्दी, हिंदी'
	},
	// cn: '',
	tl: {
		name: 'Tagalog',
		nativeName: 'Wikang Tagalog'
	},
	da: {
		name: 'Danish',
		nativeName: 'dansk'
	},
	sr: {
		name: 'Serbian',
		nativeName: 'српски језик'
	},
	pl: {
		name: 'Polish',
		nativeName: 'język polski'
	},
	ml: {
		name: 'Malayalam',
		nativeName: 'മലയാളം'
	},
	fi: {
		name: 'Finnish',
		nativeName: 'suomi'
	},
	ta: {
		name: 'Tamil',
		nativeName: 'தமிழ்'
	},
	ar: {
		name: 'Arabic',
		nativeName: 'العربية'
	},
	el: {
		name: 'Greek',
		nativeName: 'ελληνικά'
	},
	th: {
		name: 'Thai',
		nativeName: 'ไทย'
	},
	no: {
		name: 'Norwegian',
		nativeName: 'Norsk'
	},
	tr: {
		name: 'Turkish',
		nativeName: 'Türkçe'
	},
	hr: {
		name: 'Croatian',
		nativeName: 'hrvatski jezik'
	},
	// xx: '',
	hu: {
		name: 'Hungarian',
		nativeName: 'magyar'
	},
	fa: {
		name: 'Persian',
		nativeName: 'فارسی'
	},
	id: {
		name: 'Indonesian',
		nativeName: 'Bahasa Indonesia'
	},
	he: {
		name: 'Hebrew',
		nativeName: 'עברית'
	},
	ro: {
		name: 'Romanian',
		nativeName: 'Română'
	},
	te: {
		name: 'Telugu',
		nativeName: 'తెలుగు'
	},
	sl: {
		name: 'Slovenian',
		nativeName: 'Slovenski jezik'
	},
	bn: {
		name: 'Bengali',
		nativeName: 'বাংলা'
	},
	uk: {
		name: 'Ukrainian',
		nativeName: 'Українська'
	},
	lv: {
		name: 'Latvian',
		nativeName: 'latviešu valoda'
	},
	et: {
		name: 'Estonian',
		nativeName: 'eesti'
	},
	sk: {
		name: 'Slovak',
		nativeName: 'Slovenčina'
	},
	bs: {
		name: 'Bosnian',
		nativeName: 'bosanski jezik'
	},
	bg: {
		name: 'Bulgarian',
		nativeName: 'български език'
	},
	ur: {
		name: 'Urdu',
		nativeName: 'اردو'
	},
	ca: {
		name: 'Catalan',
		nativeName: 'català'
	},
	ka: {
		name: 'Georgian',
		nativeName: 'ქართული'
	},
	mk: {
		name: 'Macedonian',
		nativeName: 'македонски јазик'
	},
	vi: {
		name: 'Vietnamese',
		nativeName: 'Tiếng Việt'
	},
	is: {
		name: 'Icelandic',
		nativeName: 'Íslenska'
	},
	az: {
		name: 'Azerbaijani',
		nativeName: 'azərbaycan dili'
	},
	eu: {
		name: 'Basque',
		nativeName: 'euskara'
	},
	lt: {
		name: 'Lithuanian',
		nativeName: 'lietuvių kalba'
	},
	sq: {
		name: 'Albanian',
		nativeName: 'Shqip'
	},
	kn: {
		name: 'Kannada',
		nativeName: 'ಕನ್ನಡ'
	},
	ms: {
		name: 'Malay',
		nativeName: 'Bahasa Melayu'
	},
	af: {
		name: 'Afrikaans',
		nativeName: 'Afrikaans'
	},
	mr: {
		name: 'Marathi',
		nativeName: 'मराठी'
	},
	pa: {
		name: 'Punjabi',
		nativeName: 'ਪੰਜਾਬੀ'
	},
	ne: {
		name: 'Nepali',
		nativeName: 'नेपाली'
	},
	gl: {
		name: 'Galician',
		nativeName: 'Galego'
	},
	nb: {
		name: 'Norwegian Bokmål',
		nativeName: 'Norsk Bokmål'
	},
	hy: {
		name: 'Armenian',
		nativeName: 'Հայերեն'
	},
	ab: {
		name: 'Abkhazian',
		nativeName: 'tаҧсуа бызшәа'
	},
	si: {
		name: 'Slovenian',
		nativeName: 'Slovenski jezik'
	},
	ku: {
		name: 'Kurdish',
		nativeName: 'Kurdî'
	},
	// sh: '',
	mn: {
		name: 'Mongolian',
		nativeName: 'Монгол хэл'
	},
	km: {
		name: 'Central Khmer',
		nativeName: 'ខ្មែរ, ខេមរភាសា'
	},
	ky: {
		name: 'Kirghiz',
		nativeName: 'Кыргызча'
	},
	sw: {
		name: 'Swahili',
		nativeName: 'Kiswahili'
	},
	iu: {
		name: 'Inuktitut',
		nativeName: 'ᐃᓄᒃᑎᑐᑦ'
	},
	bo: {
		name: 'Tibetan',
		nativeName: 'བོད་ཡིག'
	},
	kk: {
		name: 'Kazakh',
		nativeName: 'қазақ тілі'
	},
	wo: {
		name: 'Wolof',
		nativeName: 'Wollof'
	},
	be: {
		name: 'Belarusian',
		nativeName: 'беларуская мова'
	},
	bm: {
		name: 'Bambara',
		nativeName: 'bamanankan'
	},
	my: {
		name: 'Burmese',
		nativeName: 'ဗမာစာ'
	},
	la: {
		name: 'Latin',
		nativeName: 'latine'
	},
	ga: {
		name: 'Irish',
		nativeName: 'Gaeilge'
	},
	yi: {
		name: 'Yiddish',
		nativeName: 'ייִדיש'
	},
	zu: {
		name: 'Zulu',
		nativeName: 'isiZulu'
	},
	am: {
		name: 'Amharic',
		nativeName: 'አማርኛ'
	},
	ht: {
		name: 'Haitian',
		nativeName: 'Kreyòl ayisyen'
	},
	jv: {
		name: 'Javanese',
		nativeName: 'ꦧꦱꦗꦮ'
	},
	qu: {
		name: 'Quechua',
		nativeName: 'Runa Simi'
	},
	uz: {
		name: 'Uzbek',
		nativeName: 'Oʻzbek, Ўзбек'
	},
	gu: {
		name: 'Gujarati',
		nativeName: 'ગુજરાતી'
	},
	se: {
		name: 'Northern Sami',
		nativeName: 'Davvisámegiella'
	},
	as: {
		name: 'Assamese',
		nativeName: 'অসমীয়া'
	},
	cy: {
		name: 'Welsh',
		nativeName: 'Cymraeg'
	},
	fo: {
		name: 'Faroese',
		nativeName: 'føroyskt'
	},
	mi: {
		name: 'Maori',
		nativeName: 'te reo Māori'
	},
	tg: {
		name: 'Tajik',
		nativeName: 'тоҷикӣ, toçikī'
	},
	lb: {
		name: 'Luxembourgish',
		nativeName: 'Lëtzebuergesch'
	},
	lo: {
		name: 'Lao',
		nativeName: 'ພາສາລາວ'
	},
	ps: {
		name: 'Pashto',
		nativeName: 'پښتو'
	},
	so: {
		name: 'Somali',
		nativeName: 'Soomaaliga'
	},
	eo: {
		name: 'Esperanto',
		nativeName: 'Esperanto'
	},
	ha: {
		name: 'Hausa',
		nativeName: 'هَوُسَ'
	},
	kl: {
		name: 'Kalaallisut',
		nativeName: 'kalaallisut'
	},
	ln: {
		name: 'Lingala',
		nativeName: 'Lingála'
	},
	// mo: '',
	sm: {
		name: 'Samoan',
		nativeName: "gagana fa'a Samoa"
	},
	ak: {
		name: 'Akan',
		nativeName: 'Akan'
	},
	dv: {
		name: 'Divehi',
		nativeName: 'ދިވެހި'
	},
	dz: {
		name: 'Dzongkha',
		nativeName: 'རྫོང་ཁ'
	},
	gn: {
		name: 'Guarani',
		nativeName: "Avañe'ẽ"
	},
	ig: {
		name: 'Igbo',
		nativeName: 'Asụsụ Igbo'
	},
	mg: {
		name: 'Malagasy',
		nativeName: 'fiteny malagasy'
	},
	mt: {
		name: 'Maltese',
		nativeName: 'Malti'
	},
	xh: {
		name: 'Xhosa',
		nativeName: 'isiXhosa'
	},
	ay: {
		name: 'Aymara',
		nativeName: 'aymar aru'
	},
	cr: {
		name: 'Cree',
		nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ'
	},
	hz: {
		name: 'Herero',
		nativeName: 'Otjiherero'
	},
	ie: {
		name: 'Interlingue',
		nativeName: 'Interlingue'
	},
	mh: {
		name: 'Marshallese',
		nativeName: 'Kajin M̧ajeļ'
	},
	rw: {
		name: 'Kinyarwanda',
		nativeName: 'Ikinyarwanda'
	},
	st: {
		name: 'Southern Sotho',
		nativeName: 'Sesotho'
	},
	aa: {
		name: 'Afar',
		nativeName: 'Afaraf'
	},
	ff: {
		name: 'Fulah',
		nativeName: 'Fulfulde'
	},
	gd: {
		name: 'Gaelic',
		nativeName: 'Gàidhlig'
	},
	nn: {
		name: 'Norwegian Nynorsk',
		nativeName: 'Norsk Nynorsk'
	},
	ny: {
		name: 'Chichewa',
		nativeName: 'chiCheŵa'
	},
	or: {
		name: 'Oriya',
		nativeName: 'ଓଡ଼ିଆ'
	},
	os: {
		name: 'Ossetian',
		nativeName: 'ирон æвзаг'
	},
	rm: {
		name: 'Romansh',
		nativeName: 'Rumantsch Grischun'
	},
	sg: {
		name: 'Sango',
		nativeName: 'yângâ tî sängö'
	},
	sn: {
		name: 'Shona',
		nativeName: 'chiShona'
	},
	ss: {
		name: 'Swati',
		nativeName: 'SiSwati'
	},
	su: {
		name: 'Sundanese',
		nativeName: 'Basa Sunda'
	},
	tk: {
		name: 'Turkmen',
		nativeName: 'Türkmen'
	},
	to: {
		name: 'Tonga',
		nativeName: 'Faka Tonga'
	},
	za: {
		name: 'Zhuang',
		nativeName: 'Saɯ cueŋƅ'
	}
};

export const getNameFromCode = (code, native = false) => {
	return LANGUAGE_CODE_MAP[code]?.[native ? 'nativeName' : 'name'] || code;
};
