import database from './database.js';

const testDatabase = async()=> {

    try {
        const result = await database.query(`
            SELECT
                NOW() AS database_time,
                CURRENT_DATABASE() AS database_name;
        `);

        console.log("Database connected successfully!");
        console.log(result.rows[0]);
    }catch(error){
        console.error("Database connection failed!: ");
        console.error(error.message);
    }finally{
        await database.end();
    }
}

testDatabase();