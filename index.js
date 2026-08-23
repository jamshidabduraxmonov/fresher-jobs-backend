import "dotenv/config"
import classifyJob from "./classifyJob.js"

const fetchJobs = async () => {
   const url = "https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search?format=json&countryCode=ae&page=1"
   const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'daily-international-job-postings.p.rapidapi.com',
        'Content-Type': 'application/json'
    }
   };

   try {
    const response = await fetch(url, options);
    const data = await response.json();


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

    

    const jobs = data.result
    .map((job)=> normalizeJob(job))
    .map((job)=> classifyJob(job));




    console.log(jobs);



   }catch(error){
    console.error(error);
   }
};

fetchJobs();
