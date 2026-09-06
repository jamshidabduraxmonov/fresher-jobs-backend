import "dotenv/config";
import express from "express";
import database from "./database.js"

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/api/health", (request, response)=> {
    response.json({
        status: "ok",
    });
});



app.get("/api/jobs", async (request, response)=> {

    console.log(request.query);

    try {

        let page = Number.parseInt(
            request.query.page,
            10
        );

        let limit = Number.parseInt(
            request.query.limit,
            10
        );

        if(Number.isNaN(page) || page < 1){
            page = 1;
        };

        if(Number.isNaN(limit)  || limit < 1){
            limit = 20;
        };


        if(limit > 50){
            limit = 50;
        }

        const offset = (page - 1) * limit;

        const category = request.query.category || null;

        let fresherFriendly = null;

        if(request.query.fresherFriendly === "true"){
            fresherFriendly = true;
        };

        if(request.query.fresherFriendly === "false"){
            fresherFriendly = false;
        }

        console.log({
            page,
            limit,
            offset,
            category,
            fresherFriendly,
        });


        const countResult = await database.query(`
                SELECT COUNT(*)::int AS total_jobs
                FROM jobs
                WHERE is_active = TRUE
                    AND (
                        $1::text IS NULL
                        OR $1::TEXT = ANY(categories)
                    );
            `,
            [category]
        );
        
        const totalJobs = countResult.rows[0].total_jobs;
        const totalPages = Math.ceil(totalJobs / limit);



        const result = await database.query(`
            SELECT
                id,
                title,
                company,
                city,
                industry,
                description,
                source_url,
                posted_at,
                expires_at,
                categories,
                fresher_friendly,
                fresher_score
            FROM jobs
            WHERE is_active = TRUE
                AND (
                    $1::text IS NULL
                    OR $1::text = ANY(categories)
                )
                AND (
                    $2::text IS NULL
                    OR fresher_friendly = $2::boolean
                )
            ORDER BY posted_at DESC NULLS LAST
            LIMIT $3
            OFFSET $4; 
        `,
        [category, fresherFriendly, limit, offset]
    );

        const jobs = result.rows.map((job)=> {
            return {
                id: job.id,
                title: job.title,
                company: job.company,
                city: job.city,
                industry: job.industry,
                description: job.description,
                sourceURL: job.source_url,
                postedAt: job.posted_at,
                expiresAt: job.expires_at,
                categories: job.categories,
                fresherFriendly: job.fresher_friendly,
            };
        });
        

        response.json({
            pagination: {
                page,
                limit,
                totalJobs,
                totalPages,
                returnedJobs: jobs.length,
                hasNextPage: page < totalPages,
                hasPreviousPages: page > 1,
            },
            jobs,
        });


    }catch(error){
        console.error(
            "Failed to fetch jobs: ",
            error.message
        );
    }
});





app.listen(PORT, ()=> {
    console.log(
        `API server running at http://localhost:${PORT}`
    );
});