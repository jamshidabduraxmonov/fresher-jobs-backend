import database from './database.js'


const createJobsTable = async ()=> {
    try{
        await database.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,

                title TEXT NOT NULL,
                company TEXT,
                city TEXT,
                industry TEXT,
                description TEXT,
                source_url TEXT,
                posted_at TIMESTAMPTZ,
                expires_at TIMESTAMPTZ,

                categories TEXT[] NOT NULL DEFAULT '{}',

                fresher_friendly BOOLEAN NOT NULL DEFAULT FALSE,
                fresher_score INTEGER NOT NULL DEFAULT 0,
                matched_signals JSONB NOT NULL DEFAULT '[]'::jsonb,

                raw_data JSONB NOT NULL,

                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );    
        `);

        console.log("Jobs table created successfully!");
    }catch(error){
        console.error("Failed to create jobs table: ");
        console.error(error.message);
    } finally {
        await database.end();
    }
};

createJobsTable();