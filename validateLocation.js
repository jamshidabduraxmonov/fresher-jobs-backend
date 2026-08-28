const uaeLocationTerms = [
    "united arab emirates",
    "uae",
    "u.a.e",

    "dubai",
    "دبي",

    "abu dhabi",
    "أبو ظبي",
    "أبوظبي",

    "sharjah",
    "الشارقة",

    "ajman",
    "عجمان",

    "ras al khaimah",
    "رأس الخيمة",

    "fujairah",
    "الفجيرة",

    "umm al quwain",
    "أم القيوين",

    "al ain",
    "العين",
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

    return uaeLocationTerms.some(term =>
        location.includes(term)
    );
};

export default validateLocation;