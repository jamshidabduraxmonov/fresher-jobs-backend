const classifyJob = (job) => {
    const text = `${job.title} ${job.description}`.toLowerCase();

    let fresherScore = 0;

    const fresherPhrases = [
        "no experience",
        "fresh graduate",
        "fresh graduates",
        "entry level",
        "entry-level",
        "internship",
        "trainee",
        "graduate program",
        "less than 1 year",
        "at least 1 year",
        "No related work experience",
    ];

    for (const phrase of fresherPhrases){
        if(text.includes(phrase)) {
            fresherScore += 25;
        }
    }



    return {
        ...job,
        fresherFriendly: fresherScore >= 25,
        fresherScore,
    };
};

export default classifyJob;