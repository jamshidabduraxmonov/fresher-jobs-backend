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

        console.log({
            page,
            limit,
            offset
        });




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
            ORDER BY posted_at DESC NULLS LAST
            LIMIT $1
            OFFSET $2; 
        `,
        [limit, offset]
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
            count: jobs.length,
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