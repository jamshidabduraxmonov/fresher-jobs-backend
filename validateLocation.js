const uaeLocationTerms = [
    // Country
    "united arab emirates",
    "uae",
    "u.a.e",
    "الإمارات العربية المتحدة",
    "الامارات العربية المتحدة",
    "دولة الإمارات العربية المتحدة",

    // Dubai
    "dubai",
    "دبي",
    "deira",
    "ديرة",
    "jebel ali",
    "جبل علي",
    "dubai south",
    "dubai marina",
    "business bay",
    "al quoz",
    "القوز",
    "dubai investment park",
    "jafza",
    "hatta",
    "حتا",

    // Abu Dhabi
    "abu dhabi",
    "abudhabi",
    "أبو ظبي",
    "أبوظبي",
    "ابو ظبي",
    "ابوظبي",
    "al ain",
    "العين",
    "al dhafra",
    "الظفرة",
    "ruwais",
    "الرويس",
    "mussafah",
    "musaffah",
    "مصفح",
    "khalifa city",
    "مدينة خليفة",
    "yas island",
    "جزيرة ياس",
    "saadiyat",
    "السعديات",
    "liwa",
    "ليوا",
    "madinat zayed",
    "مدينة زايد",

    // Sharjah
    "sharjah",
    "الشارقة",
    "khor fakkan",
    "khorfakkan",
    "خور فكان",
    "خورفكان",
    "kalba",
    "كلباء",
    "al dhaid",
    "الذيد",

    // Ajman
    "ajman",
    "عجمان",

    // Ras Al Khaimah
    "ras al khaimah",
    "ras alkhaimah",
    "rak",
    "رأس الخيمة",
    "راس الخيمة",

    // Fujairah
    "fujairah",
    "fujeirah",
    "الفجيرة",
    "dibba",
    "دبا",

    // Umm Al Quwain
    "umm al quwain",
    "umm al-quwain",
    "uaq",
    "أم القيوين",
    "ام القيوين",
];


const foreignLocationTerms = [
    // Qatar
    "qatar",
    "doha",
    "قطر",
    "الدوحة",

    // Saudi Arabia
    "saudi arabia",
    "ksa",
    "riyadh",
    "jeddah",
    "dammam",
    "khobar",
    "السعودية",
    "المملكة العربية السعودية",
    "الرياض",
    "جدة",
    "الدمام",
    "الخبر",

    // Egypt
    "egypt",
    "cairo",
    "giza",
    "alexandria",
    "مصر",
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الاسكندرية",

    // Oman
    "oman",
    "muscat",
    "salalah",
    "عمان",
    "مسقط",
    "صلالة",

    // Bahrain
    "bahrain",
    "manama",
    "البحرين",
    "المنامة",

    // Kuwait
    "kuwait",
    "kuwait city",
    "الكويت",
    "مدينة الكويت",

    // Jordan
    "jordan",
    "amman",
    "الأردن",
    "الاردن",

    // Lebanon
    "lebanon",
    "beirut",
    "لبنان",
    "بيروت",

    // Iraq
    "iraq",
    "baghdad",
    "العراق",
    "بغداد",
];


const normalizeLocation = (location) => {
    return (location || "")
        .toLowerCase()
        .replace(/[-–—_/]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const validateLocation = (job)=> {
    const location = normalizeLocation(job.city);

    if(!location) {
        return false;
    }

    if(
        uaeLocationTerms.some(term =>
        location.includes(term)
    )){
        return "uae";
    }else if(foreignLocationTerms.some((term)=> 
        location.includes(term)
    )){
        return "foreign";
    }else {
        return 'unknown'
    };
};

export default validateLocation;