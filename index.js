import "dotenv/config"
import classifyJob from "./classifyJob.js"
import saveJob from './saveJob.js'
import database from "./database.js";
import validateLocation from './validateLocation.js'

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
        const bucketJobs = [];

        console.log("Today's date: ", new Date().toISOString().split('T')[0])

        for(let page = 1; page <= maximumPages; page++){
            const params = new URLSearchParams({
                format: "json",
                countryCode: "ae",
                dateCreated: "2026-08-17",
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

            if(data.result.length === 0){
                break;
            }

            console.log({
                page,
                totalMatching: data.totalCount,
                received: data.result.length,
            }); 

            for(const rawJob of data.result){
                bucketJobs.push({
                    rawJob,
                    category
                });
            }
        };

        return bucketJobs;
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




    const allFetchedJobs = [];

    let totalFetched = 0;
    let totalSaved = 0;
    let rejectedLocations = 0;

    for(const [category, titles] of Object.entries(categoryQueries)){
        const bucketJobs = await fetchJobBucket(category, titles, 1);

        allFetchedJobs.push(...bucketJobs);

        totalFetched += bucketJobs.length;

        for(const fetchedJob of bucketJobs) {
            const normalizedJob = normalizeJob(
                fetchedJob.rawJob
            );

            const locationCheck = validateLocation(normalizedJob);


            if(locationCheck === "foreign"){

            console.log(
                `Unknown location kept: ${normalizedJob.city} -- ${normalizedJob.title}`
            );

            }else if(locationCheck === "unknown"){
                rejectedLocations++;

                console.log(
                    `Rejected foreign location: ${normalizedJob.city} -- ${normalizedJob.title}`
                );

                continue;
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

            totalSaved++


        }
        
    }

    

    // for(const fetchedJob of allFetchedJobs) {
    //     const normalizedJob = normalizeJob(
    //         fetchedJob.rawJob
    //     );

    //     const locationCheck = validateLocation(normalizedJob);

    //     if(locationCheck === "foreign"){

    //         console.log(
    //             `Unknown location kept: ${normalizedJob.city} -- ${normalizedJob.title}`
    //         );

    //     }else if(locationCheck === "unknown"){
    //         rejectedLocations++;

    //         console.log(
    //             `Rejected foreign location: ${normalizedJob.city} -- ${normalizedJob.title}`
    //         );

    //         continue;
    //     }

    //     const categorizedJob = {
    //         ...normalizedJob,
    //         categories: [fetchedJob.category]
    //     };

    //     const classifiedJob = classifyJob(categorizedJob);

    //     await saveJob(
    //         classifiedJob,
    //         fetchedJob.rawJob
    //     );

    //     totalSaved++;
    // }



    console.log(`Total fetched: ${allFetchedJobs.length}`);

    console.log({
        saved: totalSaved,
        rejectedLocations,
    })




    

    // const jobs = allJobs
    // .map((job)=> normalizeJob(job))
    // .map((job)=> classifyJob(job));




    // for(let index = 0; index < jobs.length; index++){
    //     await saveJob(
    //         jobs[index],
    //         allJobs[index]
    //     );
    // }

   




   }catch(error){
    console.error(error);
   }finally {
        await database.end();
   }
};

fetchJobs();
