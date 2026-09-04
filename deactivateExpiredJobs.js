import "dotenv/config";
import database from "./database.js"


const deactivateExpiredJobs = async ()=> {
    try {
        const result = await database.query(`
            UPDATE jobs
            SET
                is_active = FALSE,
                updated_at = NOW()
            WHERE is_active = TRUE
                AND (
                    (
                        expires_at IS NOT NULL
                        AND expires_at < NOW()
                    )
                    OR
                    (
                        expires_at IS NULL
                        AND COALESCE(posted_at, fetched_at)
                            < NOW() - INTERVAL '30 days'
                    )
                )
                RETURNING
                    id,
                    title,
                    expires_at;
            `);

            console.log(`Deactivated ${result.rowCount} expired jobs.`);

            console.table(result.rows);
    }catch(error) {
        console.error(
            "Expiration cleanup failed:",
            error.message
        );

        process.exitCode = 1;
    }finally {
        await database.end();
    }
};

deactivateExpiredJobs();