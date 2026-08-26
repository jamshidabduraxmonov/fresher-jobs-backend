import database from './database.js'

const testJobPersistence = async ()=> {
    const fakeJob = {
        id: "test-job-001",
        title: "Hotel Barista",
        company: "Example Hotel",
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


    try {
        const insertResult = await database.query(
            `
                INSERT INTO jobs (
                    id,
                    title,
                    company,
                    city,
                    industry,
                    description,
                    source_url,
                    posted_at,
                    categories,
                    fresher_friendly,
                    fresher_score,
                    matched_signals,
                    raw_data
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12, $13
                )
                ON CONFLICT (id)
                DO UPDATE SET
                    title = EXCLUDED.title,
                    company = EXCLUDED.company,
                    city = EXCLUDED.city,
                    industry = EXCLUDED.industry,
                    description = EXCLUDED.description,
                    source_url = EXCLUDED.source_url,
                    posted_at = EXCLUDED.posted_at,
                    categories = EXCLUDED.categories,
                    fresher_friendly = EXCLUDED.fresher_friendly,
                    fresher_score = EXCLUDED.fresher_score,
                    matched_signals = EXCLUDED.matched_signals,
                    raw_data = EXCLUDED.raw_data,
                    updated_at = NOW()
                RETURNING *;
            `,

            [
                fakeJob.id,
                fakeJob.title,
                fakeJob.company,
                fakeJob.city,
                fakeJob.industry,
                fakeJob.description,
                fakeJob.sourceURL,
                fakeJob.postedAt,
                fakeJob.categories,
                fakeJob.fresherFriendly,
                fakeJob.fresherScore,
                JSON.stringify(fakeJob.matchedSignals),
                JSON.stringify(fakeJob.rawData),
            ]
        );


        console.log("Job saved successfully!");
        console.log(insertResult.rows[0]);


        const selectResult = await database.query(
            `
                SELECT *
                FROM jobs
                WHERE id = $1;
            `,
            [fakeJob.id]
        );

        console.log("\nJob read from PostgreSQL: ");
        console.log(selectResult.rows[0]);
    }catch(error){
        console.error("Persistence test failed: ");
        console.error(error);
    } finally {
        await database.end();
    }

};

testJobPersistence();