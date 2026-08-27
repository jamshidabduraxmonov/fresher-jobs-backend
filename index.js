import "dotenv/config"
import classifyJob from "./classifyJob.js"
import saveJob from './saveJob.js'
import database from "./database.js";

const fetchJobs = async () => {



   const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'daily-international-job-postings.p.rapidapi.com',
        'Content-Type': 'application/json'
    }

   };

   try {

    const jobQueries = {
        hospitality: [
            "waiter",
            "waitress",
            "barista",
            "hotel receptionist",
            "front desk",
            "guest service",
            "housekeeping",
            "room attendant",
            "kitchen helper",
        ],

        retail: [
            "cashier",
            "sales assistant",
            "retail associate",
            "store assistant",
            "shop assistant",
            "customer service",
        ],

        generalService: [
            "office assistant",
            "data entry",
            "warehouse assistant",
            "packing helper",
            "cleaner",
            "security guard",
            "receptionist",
        ],
    };


    const fetchJobBucket = async (titles, maximumPages = 5)=> {
        const bucketJobs = [];

        for(let page = 1; page <= maximumPages; page++){
            const params = new URLSearchParams({
                format: "json",
                countryCode: "ae",
                dateCreated: "2026-08",
                title: titles.join(","),
                isDuplicate: "false",
                isActive: "true",
                page: String(page),
            });

            const url =
                "https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search?" +
                params.toString();

            const response = await fetch(url, options);

            if(!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            };

            const data = await response.json();

            if(data.result.length === 0){
                break;
            }

            console.log({
                page,
                totalMatching: data.totalCount,
                received: data.result.length,
            }); 

            bucketJobs.push(...(data.result || []));
        };

        return bucketJobs;
    }



    const allJobs = await fetchJobBucket(
        jobQueries.hospitality,
        1
    );

    console.log(`Total fetched: ${allJobs.length}`);



    const normalizeJob = (job) => {
        return {
            id: job.jsonLD?.identifier,
            industry: job.industry,
            title: job.title,
            company: job.company,
            city: job.city,
            description: job.jsonLD?.description,
            sourceURL: job.jsonLD?.url,
            postedAt: job.jsonLD?.datePosted,

        };
    };

    

    const jobs = allJobs
    .map((job)=> normalizeJob(job))
    .map((job)=> classifyJob(job));




    for(let index = 0; index < jobs.length; index++){
        await saveJob(
            jobs[index],
            allJobs[index]
        );
    }

    console.log(`Saved ${jobs.length} jobs successfully!`)




   }catch(error){
    console.error(error);
   }finally {
        await database.end();
   }
};

fetchJobs();
