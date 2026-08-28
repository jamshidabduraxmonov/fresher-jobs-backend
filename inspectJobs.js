import database from './database.js'

const inspectJobs = async ()=> {
    try {
        const summaryResult = await database.query(`
            SELECT
                COUNT(*)::int AS total_jobs,

                COUNT(*) FILTER (
                    WHERE fresher_friendly = TRUE
                )::int AS fresher_jobs,

                COUNT(*) FILTER (
                    WHERE id = 'test-job-001'

                )::int AS test_jobs,

                COUNT(*) FILTER(
                    WHERE is_active = TRUE
                )::int AS active_jobs
            FROM jobs
            `);

            console.log("Database summary: ");
            console.log(summaryResult.rows[0]);


            const sampleResult = await database.query(`
                SELECT
                    id,
                    title,
                    company,
                    city,
                    categories,
                    fresher_friendly,
                    fresher_score,
                    posted_at,
                    fetched_at
                FROM jobs
                ORDER BY fetched_at DESC
                LIMIT 5;
                `);

                console.log("\nFive recently fetched jobs: ");
                for(const job of sampleResult.rows){
                    console.log(job);
                };

                const duplicateURLResult = await database.query(`
                    SELECT
                        source_url,
                        COUNT(*)::int AS occurrences
                    FROM jobs
                    WHERE source_url IS NOT NULL
                    GROUP BY source_url
                    HAVING COUNT(*) > 1
                    `);

                    console.log("\nDuplicate source URLs: ");

                    if(duplicateURLResult.rows.length === 0){
                        console.log("No duplicate URLs found.");
                    }else {
                        console.log(duplicateURLResult.rows);
                    }


                const deleteResult = await database.query(`
                    DELETE FROM jobs
                    WHERE id = 'test-job-001'
                        OR source_url = 'https://example.com/jobs/test-job-001'
                        OR city ILIKE '%Qatar%'
                        OR city ILIKE '%Saudi Arabia%'
                        OR city ILIKE '%Egypt%'
                    RETURNING id, title, city;  
                    `);
                
                    console.log("Deleted test rows: ");
                    console.log(deleteResult.rows);


                const locationInfo = await database.query(`
                    SELECT
                        id,
                        title,
                        categories,
                        city,
                        fresher_friendly,
                        raw_data->>'countryCode' AS country_code
                    FROM jobs
                    ORDER BY fetched_at DESC;
                    `);

                    console.log("Jobs Location codes: ");
                    console.log(locationInfo.rows);

    }catch(error){
        console.error("Database inspection failed: ");
        console.error(error);
    }finally {
        await database.end();
    }
};


inspectJobs();