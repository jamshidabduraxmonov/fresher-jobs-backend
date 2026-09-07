import "dotenv/config";
import express from "express";
import cors from "cors";
import database from "./database.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

const PORT = process.env.PORT || 3000;


const allowedCategories = [
    "food_beverage",
    "hospitality",
    "retail",
    "customer_service",
    "general_service",
];


app.get("/api/health", (request, response)=> {
    response.json({
        status: "ok",
    });
});



app.get("/api/jobs", async (request, response)=> {

    console.log(request.query);

    try {


        const pageQuery = request.query.page;

        let page = 1;

        if(pageQuery !== undefined){
            const parsedPage = Number(pageQuery);

            if(
                !Number.isInteger(parsedPage) ||
                parsedPage < 1
            ){
                return response.status(400).json({
                    error: "page must be a positive integer",
                });
            }

            page = parsedPage;
        }





        // let limit = Number.parseInt(
        //     request.query.limit,
        //     10
        // );




        const limitQuery = request.query.limit;

        let limit = 20;

        if(limitQuery !== undefined) {
            const parsedLimit = Number(limitQuery);

            if(
                !Number.isInteger(parsedLimit) ||
                parsedLimit < 1 ||
                parsedLimit > 50
            ){
                return response.status(400).json({
                    error:
                    "limit must be an integer between 1 and 50",
                });
            }

            limit = parsedLimit;
        }



        const offset = (page - 1) * limit;

        
        const categoryQuery = request.query.category;

        let category = null;

        if(categoryQuery !== undefined) {
            if(
                typeof categoryQuery !== "string" ||
                !allowedCategories.includes(categoryQuery)
            ){
                return response.status(400).json({
                    error: "Invalid category",
                    allowedCategories,
                });
            }

            category = categoryQuery;
        }



        const fresherFriendlyQuery =
                request.query.fresherFriendly;

        let fresherFriendly = null;

        if(fresherFriendlyQuery !== undefined){
            if(
                fresherFriendlyQuery !== "true" &&
                fresherFriendlyQuery !== "false"
            ){
                return response.status(400).json({
                    error:
                        "fresherFriendly must be true or false",
                });
            }

            fresherFriendly =
                fresherFriendlyQuery === "true";
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
                    )
                    AND (
                        $2::boolean IS NULL
                        OR fresher_friendly = $2::boolean
                    );
            `,
            [category, fresherFriendly]
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