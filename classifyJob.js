const classifyJob = (job) => {
    const rawText = `${job.title || ""} ${job.description || ""}`;

    const text = rawText
    .toLowerCase()
    .replace(/[-–—_/]/g, " ")
    .replace(/[^\w\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();






    let fresherScore = 0;
    const matchedSignals = [];

    const addScore = (signal, score) => {
        fresherScore += score;
        matchedSignals.push({
            signal,
            score,
        });
    };


    const positivePatterns = [
        {
            name: "no experience required",
            pattern: /\bno\s+(previous|prior|relevant|work|professional|related)?\s*experience\s+(is\s+)?(required|needed|necessary)\b/,
            score: 50,
        },
        {
            name: "experience not required",
            pattern: /\bexperience\s+(is\s+)?not\s+(required|needed|necessary)\b/,
            score: 50,
        },
        {
            name: "no experience",
            pattern: /\bno\s+(previous|prior|relevant|work|professional|related)?\s*experience\b/,
            score: 40,
        },
        {
            name: "zero experience",
            pattern: /\b(zero|0)\s*(years?|yrs?)?\s*(of\s+)?experience\b/,
            score: 40,
        },
        {
            name: "fresh graduate",
            pattern: /\bfresh\s+graduates?\b/,
            score: 35,
        },
        {
            name: "freshers welcome",
            pattern: /\bfreshers?\s+(are\s+)?(welcome|encouraged|accepted)\b/,
            score: 35,
        },
        {
            name: "entry level",
            pattern: /\bentry\s+level\b/,
            score: 30,
        },
        {
            name: "graduate program",
            pattern: /\bgraduate\s+(program|programme|scheme|role|position)\b/,
            score: 30,
        },
        {
            name: "internship",
            pattern: /\b(internship|intern)\b/,
            score: 25,
        },
        {
            name: "trainee",
            pattern: /\b(trainee|training\s+provided)\b/,
            score: 25,
        },
    ];



    for(const signal of positivePatterns){
        if(signal.pattern.test(text)){
            addScore(signal.name, signal.score);
        }
    }

    return {
        ...job,
        fresherFriendly: fresherScore >= 25,
        fresherScore,
        
        

    };


};

export default classifyJob;