import database from './database.js';

const saveJob = async (job, rawData)=> {
    const result = await database.query(`
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
                categories = ARRAY(
                    SELECT DISTINCT category
                    FROM UNNEST(
                        jobs.categories || EXCLUDED.categories
                    ) AS category
                ),
                fresher_friendly = EXCLUDED.fresher_friendly,
                fresher_score = EXCLUDED.fresher_score,
                matched_signals = EXCLUDED.matched_signals,
                raw_data = EXCLUDED.raw_data,
                is_active = TRUE,
                updated_at = NOW()
            RETURNING *;
        `,
        [
            job.id,
            job.title,
            job.company || null,
            job.city || null,
            job.industry || null,
            job.description || null,
            job.sourceURL || null,
            job.postedAt || null,
            job.categories || [],
            job.fresherFriendly || false,
            job.fresherScore || 0,
            JSON.stringify(job.matchedSignals || []),
            JSON.stringify(rawData),
        ]
    );

    console.log("Saved: ", job.title, job.id);

    return result.rows[0];
};

export default saveJob;