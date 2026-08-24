import "dotenv/config"
import classifyJob from "./classifyJob.js"

const fetchJobs = async () => {

    const allJobs = [];

   const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'daily-international-job-postings.p.rapidapi.com',
        'Content-Type': 'application/json'
    }

   };

   try {

    for( let page = 1; page <= 5; page++){
            const url = `https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search?format=json&countryCode=ae&dateCreated=2026-08&page=${page}`;
            const response = await fetch(url, options);
            const data = await response.json();

            console.log(`Page ${page}: ${data.result.length} jobs`);

            allJobs.push(...data.result);

    }

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




    console.log(jobs);



   }catch(error){
    console.error(error);
   }
};

fetchJobs();
