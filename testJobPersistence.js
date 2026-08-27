import database from './database.js'
import saveJob from './saveJob.js';

const testJobPersistence = async ()=> {
    const fakeJob = {
        id: "test-job-002",
        title: "Hotel Receptionist",
        company: "Hilton Hotel",
        city: "Dubai",
        industry: "Hospitality",
        description: "Fresh graduates are welcome. Training provided.",
        sourceURL: "https://example.com/jobs/test-job-001",
        postedAt: new Date().toISOString(),

        categories: [
            "hospitality",
            "food_beverage",
        ],

        fresherFriendly: true,
        fresherScore: 60,

        matchedSignals: [
            {
                signal: "fresh graduate",
                score: 35,
            },
            {
                signal: "training provided",
                score: 25,
            },
        ],

        rawData: {
            source: "fake-test",
            originalTitle: "Hotel Barista",
        },
    };

    const fakeRawData = {
        source: "fake-test",
        originalTitle: "Hotel Receptionist",
        completeOriginalObject: true,
    };


    try {
        const savedJob = await saveJob(
            fakeJob,
            fakeRawData
        );

        console.log('Reusable saveJob() succeeded!');
        console.log(savedJob);
    }catch(error){
        console.error("SaveJob() failed: ");
        console.error(error);
    } finally {
        await database.end();
    }

};

testJobPersistence();