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
    try {
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
            LIMIT 20; 
        `);

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
            jobs
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