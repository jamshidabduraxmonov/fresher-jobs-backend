import "dotenv/config"
import classifyJob from "./classifyJob.js"
import saveJob from './saveJob.js'
import database from "./database.js";
import validateLocation from './validateLocation.js'

const fetchJobs = async () => {

    const report = {
        fetched: 0,
        saved: 0,
        rejectedLocations: 0,
        failed: 0,
    };

   const options = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'daily-international-job-postings.p.rapidapi.com',
        'Content-Type': 'application/json'
    }

   };

   try {

    const categoryQueries = {
        food_beverage: [
            "waiter",
            "waitress",
            "barista",
            "kitchen helper",
        ],

        hospitality: [
            "housekeeping",
            "room attendant",
            "front desk",
        ],

        retail: [
            "cashier",
            "sales assistant",
        ],

        customer_service: [
            "customer service",
        ],

        general_service: [
            "cleaner",
            "security guard",
            "warehouse assistant",
        ],
    };



    const buildTitleQuery = (titles) => {
    return titles
        .map((title) => {
            if (title.includes(" ")) {
                return `"${title}"`;
            }

            return title;
        })
        .join(",");
};


    const wait = (milliseconds) => {
        return new Promise((resolve)=> {
            setTimeout(resolve, milliseconds);
        });
    };





    const fetchJobBucket = async (category, titles, maximumPages = 5)=> {
        

        const currentDate = new Date().toLocaleDateString(
            "en-CA",
            {
                timeZone: "Asia/Dubai",
            }
        );

        console.log("Today's date: ", currentDate);

        for(let page = 1; page <= maximumPages; page++){
            const params = new URLSearchParams({
                format: "json",
                countryCode: "ae",
                dateCreated: "2026-08-30",
                title: buildTitleQuery(titles),
                isDuplicate: "false",
                isActive: "true",
                page: String(page),
            });

            const url =
                "https://daily-international-job-postings.p.rapidapi.com/api/v2/jobs/search?" +
                params.toString();

            await wait(21_000);

            const response = await fetch(url, options);

            let retryCount = 0;
            const maximumRetries = 3;


            while (
                response.status === 429 &&
                retryCount < maximumRetries
            ){
                retryCount++;

                const retryAfterHeader =
                    response.headers.get("retry-after");

                const retryAfterSeconds = Number(retryAfterHeader);

                const retryDelay =
                    retryAfterSeconds > 0
                        ? retryAfterSeconds * 1000
                        : 60_000;

                console.log(
                    `Rate limit reached. Waiting ${
                        retryDelay / 1000
                    } seconds before retry ${retryCount}/${maximumRetries}`
                );

                await response.text();

                await wait(retryDelay);

                response = await fetch(url, options);
            }
            
            if(!response.ok) {

            const errorBody = await response.text();

            console.error({
                    category,
                    titles,
                    page,
                    url,
                    status: response.status,
                    errorBody,
                });


                throw new Error(`Request failed: ${response.status}`);
            };

            const data = await response.json();

            report.fetched += data.result.length;

            if(data.result.length === 0){
                break;
            }

            console.log({
                page,
                totalMatching: data.totalCount,
                received: data.result.length,
            }); 

            

            const pageJobs = data.result.map((rawJob)=> {
                return {
                    rawJob,
                    category
                };
            });

            await saveFetchedJobs(pageJobs);

            



            const jobsPerPage = 10;
            
            const reachedFinalPage =
                data.result.length < jobsPerPage ||
                page * jobsPerPage >= data.totalCount;


            if(reachedFinalPage){
                console.log(
                    `Reached final page for ${category}.`
                );

                break;
            }
        };

    
    }



    // const allJobs = await fetchJobBucket(
    //     jobQueries.hospitality,
    //     1
    // );



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



    const saveFetchedJobs = async (fetchedJobs)=> {

        for(const fetchedJob of fetchedJobs) {

            try{

                const normalizedJob = normalizeJob(
                    fetchedJob.rawJob
                );

                const locationCheck = validateLocation(normalizedJob);


                if(locationCheck === "foreign"){
                    report.rejectedLocations++;

                    console.log(
                        `Rejected foreign location: ${normalizedJob.city} -- ${normalizedJob.title}`
                    );

                    continue;

                }else if(locationCheck === "unknown"){
                   
                    console.log(
                        `Unknown location kept: ${normalizedJob.city} -- ${normalizedJob.title}`
                    );

                }


                const categorizedJob = {
                    ...normalizedJob,
                    categories: [fetchedJob.category]
                };

                const classifiedJob = classifyJob(categorizedJob);

                await saveJob(
                    classifiedJob,
                    fetchedJob.rawJob
                );

                report.saved++;



            }catch(error){
                report.failed++;

                console.error(
                    `Failed job: ${fetchedJob.rawJob?.title}`,
                    error.message
                );
            }

            
        }
    };



    const allFetchedJobs = [];


    for(const [category, titles] of Object.entries(categoryQueries)){
        const bucketJobs = await fetchJobBucket(category, titles, 1);

        allFetchedJobs.push(...bucketJobs);

        totalFetched += bucketJobs.length;

        await saveFetchedJobs(bucketJobs);
        
    }

    




    console.log(`Total fetched: ${report.fetched}`);

  

   }catch(error){
    console.error(error);
   }finally {
        const accountedFor =
            report.saved +
            report.rejectedLocations +
            report.failed;
        
        const unaccounted =
            report.fetched - accountedFor;

        console.log("\nImport report:");

        console.table(report);

        if(unaccounted === 0) {
            console.log("Every fetched job was accounted for.");
        }else {
            console.warn(
                `${unaccounted} fetched jobs were not accounted for.`
            );
        }


        await database.end();
   }
};

fetchJobs();
