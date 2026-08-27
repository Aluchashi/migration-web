export type Confidence = "verified" | "estimated";

export type ProcessStep = {
  id: string;
  titleBn: string;
  titleEn: string;
  icon: string;
  estimatedDuration: string;
  description: string;
  documents: string[];
  officialLink: string;
  source: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  confidence: Confidence;
};

export const PRE_DEPARTURE_STEPS: ProcessStep[] = [
  {
    id: "online-registration",
    titleBn: "অনলাইন রেজিস্ট্রেশন",
    titleEn: "Online Registration",
    icon: "📝",
    estimatedDuration: "সাধারণত ১৫-৩০ মিনিট",
    description:
      "বিএমইটি-এর 'আমি প্রবাসী' পোর্টালে (ই-রেজিস্ট্রেশন) নিজের তথ্য, পাসপোর্ট ও যোগাযোগ নম্বর দিয়ে নিবন্ধন করুন। এটি পরবর্তী সব ধাপের ভিত্তি।",
    documents: ["পাসপোর্ট", "বৈধ মোবাইল নম্বর", "জাতীয় পরিচয়পত্র (NID)"],
    officialLink: "https://www.bmet.gov.bd",
    source: "BMET (আমি প্রবাসী ই-রেজিস্ট্রেশন)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "verified",
  },
  {
    id: "biometric-enrollment",
    titleBn: "বায়োমেট্রিক নিবন্ধন",
    titleEn: "Biometric Enrollment",
    icon: "🔍",
    estimatedDuration: "সাধারণত ১-২ দিন",
    description:
      "ই-পাসপোর্ট কেন্দ্র বা নির্ধারিত বিএমইটি ডেস্কে আঙুলের ছাপ ও চোখের প্রতিচ্ছবি (বায়োমেট্রিক) দিন। এটি পরবর্তী ক্লিয়ারেন্স ও স্মার্ট কার্ডের জন্য বাধ্যতামূলক।",
    documents: ["পাসপোর্ট", "ই-রেজিস্ট্রেশন রেফারেন্স", "ছবি (স্পেসিফিকেশন অনুযায়ী)"],
    officialLink: "https://www.bmet.gov.bd",
    source: "BMET (বায়োমেট্রিক নিবন্ধন)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "verified",
  },
  {
    id: "welfare-fund",
    titleBn: "কল্যাণ তহবিল ফি প্রদান",
    titleEn: "Wage Earners' Welfare Fund Payment",
    icon: "💳",
    estimatedDuration: "সাধারণত ১ দিন",
    description:
      "প্রবাসী কল্যাণ বোর্ডের নির্ধারিত ফি (বর্তমানে ৩৫০ টাকা নিবন্ধন + ১৫০০ টাকা বার্ষিক চাঁদা, পরিবর্তন হতে পারে) ব্যাংক বা অনলাইনে জমা দিন। এটি দেশে ফেরত আসার পর সুবিধা ও জরুরি সাহায্যের জন্য।",
    documents: ["পাসপোর্ট", "ফি জমার রসিদ"],
    officialLink: "https://welfareboard.gov.bd",
    source: "Wage Earners' Welfare Board",
    sourceUrl: "https://welfareboard.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "estimated",
  },
  {
    id: "pdot",
    titleBn: "প্রাক-বহির্গমন অরিয়েন্টেশন প্রশিক্ষণ (PDOT)",
    titleEn: "Pre-Departure Orientation Training",
    icon: "🎓",
    estimatedDuration: "সাধারণত ২-৩ দিন",
    description:
      "সরকারি PDOT কেন্দ্রে গিয়ে গন্তব্য দেশের আইন, চুক্তি, ভাষা ও নিরাপত্তা বিষয়ক প্রশিক্ষণ নিন এবং সনদ সংগ্রহ করুন। কিছু দেশে এটি ক্লিয়ারেন্সের শর্ত।",
    documents: ["পাসপোর্ট", "বায়োমেট্রিক স্লিপ", "চুক্তিপত্রের কপি"],
    officialLink: "https://www.bmet.gov.bd",
    source: "BMET (জাতীয় প্রবাসী কল্যাণ ও কর্মসংস্থান নীতি)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "verified",
  },
  {
    id: "emigration-clearance",
    titleBn: "বহির্গমন ছাড়পত্র (ক্লিয়ারেন্স)",
    titleEn: "Emigration Clearance",
    icon: "✅",
    estimatedDuration: "সাধারণত ৩-৭ দিন",
    description:
      "নিয়োগকর্তার ডিমান্ড লেটার ও চুক্তিপত্র বিএমইটি-তে জমা দিয়ে ছাড়পত্র (clearance) নিন। সৌদি/ইউএই/কাতার/মালয়েশিয়ার মতো দেশে এটি বাধ্যতামূলক।",
    documents: ["ডিমান্ড লেটার", "চুক্তিপত্র", "পাসপোর্ট", "PDOT সনদ", "মেডিকেল সার্টিফিকেট"],
    officialLink: "https://raims.oep.gov.bd",
    source: "BMET (RAIMS - ইমিগ্রেশন ক্লিয়ারেন্স)",
    sourceUrl: "https://raims.oep.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "verified",
  },
  {
    id: "smart-card",
    titleBn: "ডিজিটাল ক্লিয়ারেন্স স্মার্ট কার্ড",
    titleEn: "Smart Card / Digital Clearance",
    icon: "🪪",
    estimatedDuration: "সাধারণত ১-২ দিন",
    description:
      "ক্লিয়ারেন্স সম্পন্ন হলে বিএমইটি স্মার্ট কার্ড বা ডিজিটাল ক্লিয়ারেন্স সার্টিফিকেট সংগ্রহ করুন। এটি বিমানবন্দর ও গন্তব্য দেশে যাচাইয়ের জন্য।",
    documents: ["ক্লিয়ারেন্স রেফারেন্স", "পাসপোর্ট"],
    officialLink: "https://raims.oep.gov.bd",
    source: "BMET (ডিজিটাল ক্লিয়ারেন্স)",
    sourceUrl: "https://raims.oep.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "estimated",
  },
  {
    id: "airport-clearance",
    titleBn: "বিমানবন্দর ক্লিয়ারেন্স",
    titleEn: "Airport Clearance",
    icon: "✈️",
    estimatedDuration: "যাত্রার দিন",
    description:
      "ডিপার্চারের দিন বিমানবন্দরে বিএমইটি ডেস্কে স্মার্ট কার্ড ও ভিসা যাচাই করে ছাড়পত্র সম্পন্ন করুন। সব কাগজপত্র সাথে রাখবেন।",
    documents: ["স্মার্ট কার্ড", "ভিসা", "পাসপোর্ট", "চুক্তিপত্র", "টিকিট"],
    officialLink: "https://www.bmet.gov.bd",
    source: "BMET (বিমানবন্দর ক্লিয়ারেন্স ডেস্ক)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    confidence: "verified",
  },
];

export type CountryLegalInfo = {
  corridorId: string;
  country: string;
  jobTitle: string;
  visa: { type: string; validity: string; note?: string; source: string; sourceUrl: string; confidence: Confidence; lastVerifiedDate: string };
  medical: { requirement: string; source: string; sourceUrl: string; confidence: Confidence; lastVerifiedDate: string };
  embassyAttestation: { required: boolean; note: string; source: string; sourceUrl: string; confidence: Confidence; lastVerifiedDate: string };
  documentChecklist: string[];
  cost: {
    governmentCapBdt: number;
    governmentCapLabel: string;
    warningNote: string;
    source: string;
    sourceUrl: string;
    confidence: Confidence;
    lastVerifiedDate: string;
  };
  agency: { bairaCheckUrl: string; boeslNote: string; source: string; sourceUrl: string; confidence: Confidence; lastVerifiedDate: string };
  postArrival: { embassyContact: string; helpline: string; complaintProcess: string; source: string; sourceUrl: string; confidence: Confidence; lastVerifiedDate: string };
};

export const COUNTRY_LEGAL: Record<string, CountryLegalInfo> = {
  "saudi-arabia-electrician": {
    corridorId: "saudi-arabia-electrician",
    country: "Saudi Arabia",
    jobTitle: "Electrician",
    visa: {
      type: "Work Visa (Iqama / Kafala sponsorship)",
      validity: "১-২ বছর, নিয়োগকর্তা নবায়ন করে",
      note: "ভিসা সৌদি মন্ত্রণালয় থেকে জারি হয়; নিজে চেক করে নিন ভিসা আসল কি না।",
      source: "Saudi Ministry of Human Resources & Social Development",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    medical: {
      requirement: "GAMCA/Wafid medical fitness certificate (বাধ্যতামূলক)",
      source: "Saudi Ministry of Health (GAMCA/Wafid)",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    embassyAttestation: {
      required: true,
      note: "চুক্তিপত্র ও শিক্ষাগত সনদ সৌদি এম্বাসি/মন্ত্রণালয়ে অ্যাটেস্টেশন প্রয়োজন হতে পারে।",
      source: "Embassy of Saudi Arabia, Dhaka",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    documentChecklist: ["পাসপোর্ট (মেয়াদ ৬+ মাস)", "ভিসা কপি", "চুক্তিপত্র", "GAMCA মেডিকেল সার্টিফিকেট", "শিক্ষাগত সনদ", "পাসপোর্ট সাইজ ছবি"],
    cost: {
      governmentCapBdt: 165000,
      governmentCapLabel: "~১৬৫,০০০ BDT (BMET স্মার্ট-কার্ড খরচ সীমার মধ্যে, আনুমানিক)",
      warningNote: "এজেন্সি যদি এর বেশি চার্জ করে, সেটা অতিরিক্ত/অবৈধ হতে পারে — জেলা কর্মসংস্থান অফিসে রিপোর্ট করুন।",
      source: "BMET (সরকারি খরচ সীমা)",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    agency: {
      bairaCheckUrl: "https://www.baira.org.bd",
      boeslNote: "সরকারি বিকল্প রুট: BOESL (বোয়েসেল) মাধ্যমে সরাসরি নিয়োগ — প্রতারণা এড়াতে বিবেচনা করুন।",
      source: "BAIRA / BOESL",
      sourceUrl: "https://www.boesl.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    postArrival: {
      embassyContact: "সৌদি আরবে বাংলাদেশ দূতাবাস, রিয়াদ (ও কনস্যুলেট জেদ্দা/দাম্মাম)",
      helpline: "প্রবাসী কল্যাণ হটলাইন: ১৬৪৩০ (বাংলাদেশ থেকে), +৮৮০-২-৯১১০৮১০",
      complaintProcess: "প্রতারণা হলে BMET হটলাইন ১৬৪৩০ বা 'আমি প্রবাসী' পোর্টালে অভিযোগ দাখিল করুন।",
      source: "Ministry of Foreign Affairs / BMET",
      sourceUrl: "https://www.mofa.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
  },
  "uae-driver-light": {
    corridorId: "uae-driver-light",
    country: "United Arab Emirates",
    jobTitle: "Light Vehicle Driver",
    visa: {
      type: "Work Visa (UAE residence visa + Emirates ID)",
      validity: "২ বছর (সাধারণত)",
      note: "ভিসা আমিরাতের মন্ত্রণালয় থেকে ইলেকট্রনিকভাবে যাচাই করুন।",
      source: "UAE MOHRE",
      sourceUrl: "https://www.mohre.gov.ae",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    medical: {
      requirement: "GAMCA/Wafid medical fitness certificate (বাধ্যতামূলক)",
      source: "UAE MOHRE (GAMCA/Wafid)",
      sourceUrl: "https://www.mohre.gov.ae",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    embassyAttestation: {
      required: true,
      note: "চুক্তিপত্র MOHRE-তে নিবন্ধিত হওয়া বাধ্যতামূলক; সনদ অ্যাটেস্টেশন প্রয়োজন।",
      source: "UAE Embassy, Dhaka",
      sourceUrl: "https://www.mohre.gov.ae",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    documentChecklist: ["পাসপোর্ট (মেয়াদ ৬+ মাস)", "ভিসা কপি", "চুক্তিপত্র (MOHRE)", "GAMCA মেডিকেল", "ড্রাইভিং লাইসেন্স", "ছবি"],
    cost: {
      governmentCapBdt: 210000,
      governmentCapLabel: "~২১০,০০০ BDT (লাইসেন্স কনভার্সনসহ, আনুমানিক)",
      warningNote: "UAE-তে লাইসেন্স কনভার্সন বাধ্যতামূলক — অতিরিক্ত 'সাজানো' চার্জ সন্দেহজনক।",
      source: "UAE MOHRE",
      sourceUrl: "https://www.mohre.gov.ae",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    agency: {
      bairaCheckUrl: "https://www.baira.org.bd",
      boeslNote: "BOESL মাধ্যমে সরাসরি নিয়োগ সরকারি বিকল্প রুট হিসেবে বিবেচনা করুন।",
      source: "BAIRA / BOESL",
      sourceUrl: "https://www.boesl.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    postArrival: {
      embassyContact: "সংযুক্ত আরব আমিরাতে বাংলাদেশ দূতাবাস, আবু ধাবি",
      helpline: "প্রবাসী কল্যাণ হটলাইন: ১৬৪৩০",
      complaintProcess: "চুক্তি লঙ্ঘন হলে MOHRE ঐপ বা টল ফ্রি ৮০০০০০০০৪ (UAE) + বাংলাদেশে ১৬৪৩০-এ অভিযোগ।",
      source: "UAE MOHRE / BMET",
      sourceUrl: "https://www.mohre.gov.ae",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
  },
  "qatar-construction-helper": {
    corridorId: "qatar-construction-helper",
    country: "Qatar",
    jobTitle: "Construction Helper",
    visa: {
      type: "Work Visa (Qatar residence permit)",
      validity: "২-৩ বছর",
      note: "ভিসা কাতারের মেট্রাশ (Metrash) অ্যাপে যাচাই করুন।",
      source: "Qatar Ministry of Interior",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    medical: {
      requirement: "GAMCA/Wafid medical fitness certificate (বাধ্যতামূলক)",
      source: "Qatar Ministry of Public Health (GAMCA/Wafid)",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    embassyAttestation: {
      required: true,
      note: "চুক্তিপত্র কাতারের শ্রম মন্ত্রণালয়ে নিবন্ধিত হওয়া বাধ্যতামূলক।",
      source: "Embassy of Qatar, Dhaka",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    documentChecklist: ["পাসপোর্ট (মেয়াদ ৬+ মাস)", "ভিসা কপি", "চুক্তিপত্র", "GAMCA মেডিকেল", "ছবি"],
    cost: {
      governmentCapBdt: 130000,
      governmentCapLabel: "~১৩০,০০০ BDT (কাতার সরকার নির্ধারিত সীমার মধ্যে, আনুমানিক)",
      warningNote: "কাতার সরকার নির্ধারিত খরচ সীমার বেশি চার্জ অবৈধ হতে পারে।",
      source: "BMET (কাতার খরচ সীমা)",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    agency: {
      bairaCheckUrl: "https://www.baira.org.bd",
      boeslNote: "BOESL বা সরকারি চ্যানেল দিয়ে নিয়োগ বিবেচনা করুন প্রতারণা এড়াতে।",
      source: "BAIRA / BOESL",
      sourceUrl: "https://www.boesl.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    postArrival: {
      embassyContact: "কাতারে বাংলাদেশ দূতাবাস, দোহা",
      helpline: "প্রবাসী কল্যাণ হটলাইন: ১৬৪৩০",
      complaintProcess: "সমস্যা হলে কাতার শ্রম মন্ত্রণালয় হটলাইন + বাংলাদেশে ১৬৪৩০-এ অভিযোগ।",
      source: "Ministry of Foreign Affairs / BMET",
      sourceUrl: "https://www.mofa.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
  },
  "malaysia-factory-operator": {
    corridorId: "malaysia-factory-operator",
    country: "Malaysia",
    jobTitle: "Factory Machine Operator",
    visa: {
      type: "Work Visa (Calling Visa / PLKS)",
      validity: "সাধারণত ১-২ বছর",
      note: "মালয়েশিয়া সরকারি G2G (সরকার-টু-সরকার) চ্যানেল দিয়ে নিয়োগ জারি হয়।",
      source: "Malaysia MOHR / BMET",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    medical: {
      requirement: "FSMM medical screening (অনুমোদিত ক্লিনিক) — GAMCA নয়",
      source: "Malaysia FSMM medical screening",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    embassyAttestation: {
      required: false,
      note: "সাধারণত অ্যাটেস্টেশন লাগে না; চুক্তিপত্র PLKS-এর জন্য যাচাই হয়।",
      source: "Malaysia Embassy, Dhaka",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    documentChecklist: ["পাসপোর্ট (মেয়াদ ১৮+ মাস)", "কলিং ভিসা", "চুক্তিপত্র", "FSMM মেডিকেল", "ছবি"],
    cost: {
      governmentCapBdt: 185000,
      governmentCapLabel: "~১৮৫,০০০ BDT (G2G চ্যানেল, আনুমানিক)",
      warningNote: "বেসরকারি এজেন্সি যে কোনো 'শর্টকাট' দাবি করে বেশি টাকা নিলে সন্দেহ করুন।",
      source: "BMET (মালয়েশিয়া G2G)",
      sourceUrl: "https://www.bmet.gov.bd",
      confidence: "estimated",
      lastVerifiedDate: "2026-08-01",
    },
    agency: {
      bairaCheckUrl: "https://www.baira.org.bd",
      boeslNote: "মালয়েশিয়া G2G চ্যানেল BOESL-এর মাধ্যমে পরিচালিত — সরাসরি আবেদন বিবেচনা করুন।",
      source: "BAIRA / BOESL",
      sourceUrl: "https://www.boesl.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    postArrival: {
      embassyContact: "মালয়েশিয়ায় বাংলাদেশ হাই কমিশন, কুয়ালালামপুর",
      helpline: "প্রবাসী কল্যাণ হটলাইন: ১৬৪৩০",
      complaintProcess: "সমস্যা হলে মালয়েশিয়া শ্রম বিভাগ + বাংলাদেশে ১৬৪৩০-এ অভিযোগ।",
      source: "Ministry of Foreign Affairs / BMET",
      sourceUrl: "https://www.mofa.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
  },
  "korea-eps-production-worker": {
    corridorId: "korea-eps-production-worker",
    country: "South Korea",
    jobTitle: "Production Worker (EPS E-9)",
    visa: {
      type: "E-9 Non-Professional Employment Visa (EPS)",
      validity: "৩ বছর (নবায়নযোগ্য, সর্বোচ্চ ৪-৫ বছর)",
      note: "EPS-TOPIK পরীক্ষায় পাস + রোস্টার নির্বাচনের মাধ্যমে ভিসা।",
      source: "HRD Korea (EPS)",
      sourceUrl: "https://www.hrdkorea.or.kr",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    medical: {
      requirement: "EPS medical examination (KOICA-স্ট্যান্ডার্ড প্যানেল)",
      source: "HRD Korea (EPS medical)",
      sourceUrl: "https://www.hrdkorea.or.kr",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    embassyAttestation: {
      required: false,
      note: "EPS সিস্টেম স্বচ্ছ ও সরকারি — আলাদা এজেন্সি/অ্যাটেস্টেশন লাগে না।",
      source: "HRD Korea (EPS)",
      sourceUrl: "https://www.hrdkorea.or.kr",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    documentChecklist: ["পাসপোর্ট", "EPS-TOPIK সার্টিফিকেট", "চুক্তিপত্র", "EPS মেডিকেল", "ছবি"],
    cost: {
      governmentCapBdt: 350000,
      governmentCapLabel: "~৩৫০,০০০ BDT (TOPIK + বিমান ভাড়াসহ মোট, আনুমানিক)",
      warningNote: "EPS সম্পূর্ণ সরকারি প্রক্রিয়া — কোনো এজেন্সি ফি দেবেন না, প্রতারণা হতে পারে।",
      source: "HRD Korea (EPS)",
      sourceUrl: "https://www.hrdkorea.or.kr",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    agency: {
      bairaCheckUrl: "https://www.baira.org.bd",
      boeslNote: "EPS-এ কোনো বেসরকারি এজেন্সি জড়িত নয় — শুধু সরকারি EPS সেন্টার (কোরিয়ায় বাংলাদেশ দূতাবাসের EPS শাখা)।",
      source: "HRD Korea / Embassy",
      sourceUrl: "https://www.hrdkorea.or.kr",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
    postArrival: {
      embassyContact: "দক্ষিণ কোরিয়ায় বাংলাদেশ দূতাবাস, সিউল (EPS শাখা)",
      helpline: "প্রবাসী কল্যাণ হটলাইন: ১৬৪৩০",
      complaintProcess: "সমস্যা হলে EPS কল সেন্টার + বাংলাদেশ দূতাবাস EPS শাখায় যোগাযোগ।",
      source: "Ministry of Foreign Affairs / HRD Korea",
      sourceUrl: "https://www.mofa.gov.bd",
      confidence: "verified",
      lastVerifiedDate: "2026-08-01",
    },
  },
};

export const LEGAL_CORRIDORS = Object.values(COUNTRY_LEGAL).map((info) => ({
  corridorId: info.corridorId,
  country: info.country,
  jobTitle: info.jobTitle,
}));

export function getCountryLegal(corridorId: string): CountryLegalInfo | undefined {
  return COUNTRY_LEGAL[corridorId];
}
