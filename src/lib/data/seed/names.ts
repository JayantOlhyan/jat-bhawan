/** Sample name parts (English / Devanagari). Used for seed data and bilingual search. */

export interface Pair {
  en: string;
  hi: string;
}

export const FIRST_NAMES: Pair[] = [
  { en: "Ramesh", hi: "रमेश" }, { en: "Suresh", hi: "सुरेश" }, { en: "Rajbir", hi: "राजबीर" },
  { en: "Satbir", hi: "सतबीर" }, { en: "Jagdish", hi: "जगदीश" }, { en: "Om Prakash", hi: "ओम प्रकाश" },
  { en: "Dharambir", hi: "धर्मबीर" }, { en: "Randhir", hi: "रणधीर" }, { en: "Rajender", hi: "राजेंद्र" },
  { en: "Krishan", hi: "कृष्ण" }, { en: "Mahender", hi: "महेंद्र" }, { en: "Balwan", hi: "बलवान" },
  { en: "Jaipal", hi: "जयपाल" }, { en: "Naresh", hi: "नरेश" }, { en: "Anil", hi: "अनिल" },
  { en: "Sunil", hi: "सुनील" }, { en: "Pradeep", hi: "प्रदीप" }, { en: "Sandeep", hi: "संदीप" },
  { en: "Vikas", hi: "विकास" }, { en: "Ajay", hi: "अजय" }, { en: "Ravinder", hi: "रविंद्र" },
  { en: "Hawa Singh", hi: "हवा सिंह" }, { en: "Chand Ram", hi: "चांद राम" }, { en: "Bhim Singh", hi: "भीम सिंह" },
  { en: "Kuldeep", hi: "कुलदीप" }, { en: "Deepak", hi: "दीपक" }, { en: "Manoj", hi: "मनोज" },
  { en: "Sushila", hi: "सुशीला" }, { en: "Kamla", hi: "कमला" }, { en: "Santosh", hi: "संतोष" },
  { en: "Sunita", hi: "सुनीता" }, { en: "Rekha", hi: "रेखा" }, { en: "Poonam", hi: "पूनम" },
];

export const FATHER_NAMES: Pair[] = [
  { en: "Late Sh. Hari Singh", hi: "स्व. श्री हरि सिंह" }, { en: "Sh. Ram Kishan", hi: "श्री राम किशन" },
  { en: "Sh. Mange Ram", hi: "श्री मांगे राम" }, { en: "Late Sh. Chandgi Ram", hi: "स्व. श्री चंदगी राम" },
  { en: "Sh. Ram Mehar", hi: "श्री राम मेहर" }, { en: "Sh. Dariyav Singh", hi: "श्री दरियाव सिंह" },
  { en: "Sh. Sube Singh", hi: "श्री सूबे सिंह" }, { en: "Late Sh. Lakhi Ram", hi: "स्व. श्री लखी राम" },
  { en: "Sh. Ishwar Singh", hi: "श्री ईश्वर सिंह" }, { en: "Sh. Zile Singh", hi: "श्री जिले सिंह" },
  { en: "Sh. Ran Singh", hi: "श्री रण सिंह" }, { en: "Sh. Tek Chand", hi: "श्री टेक चंद" },
  { en: "Sh. Partap Singh", hi: "श्री प्रताप सिंह" }, { en: "Late Sh. Phool Singh", hi: "स्व. श्री फूल सिंह" },
];

export const GOTRAS: Pair[] = [
  { en: "Dahiya", hi: "दहिया" }, { en: "Sehrawat", hi: "सहरावत" }, { en: "Shokeen", hi: "शौकीन" },
  { en: "Dalal", hi: "दलाल" }, { en: "Rathi", hi: "राठी" }, { en: "Gahlot", hi: "गहलोत" },
  { en: "Solanki", hi: "सोलंकी" }, { en: "Tokas", hi: "टोकस" }, { en: "Mann", hi: "मान" },
  { en: "Malik", hi: "मलिक" }, { en: "Rana", hi: "राणा" }, { en: "Lakra", hi: "लाकड़ा" },
];

export const VILLAGES: Pair[] = [
  { en: "Dichaon Kalan", hi: "ढिचाऊं कलां" }, { en: "Jharoda Kalan", hi: "झड़ौदा कलां" },
  { en: "Mitraon", hi: "मित्राऊं" }, { en: "Kair", hi: "कैर" }, { en: "Ghumanhera", hi: "घुमनहेड़ा" },
  { en: "Dhansa", hi: "ढांसा" }, { en: "Ujwa", hi: "उजवा" }, { en: "Paprawat", hi: "पपरावट" },
  { en: "Isapur", hi: "ईसापुर" }, { en: "Rawta", hi: "रावता" }, { en: "Surakhpur", hi: "सुरखपुर" },
  { en: "Khera Dabar", hi: "खेड़ा डाबर" }, { en: "Najafgarh", hi: "नजफगढ़" },
];

/** All known pairs, for cross-script search. */
export const ALL_PAIRS: Pair[] = [...FIRST_NAMES, ...FATHER_NAMES, ...GOTRAS, ...VILLAGES];
