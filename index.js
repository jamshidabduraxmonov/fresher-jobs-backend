require("dotenv").config();

const fetchJobs = async () => {
   const url = "https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search?format=json&countryCode=ae&hasSalary=true&page=1"
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
    const result = await response.text();
    console.log(result);
   }catch(error){
    console.error(error);
   }
};

fetchJobs();
