const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ADMIN_EMAIL;
const ADMIN_ID = process.env.ADMIN_ID ?? 'admin-id';

const SECRET_ACCESS_TOKEN = process.env.SECRET_ACCESS_TOKEN ?? 'secret-access-token';
const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN ?? 'secret-refresh-token';

const SECRET_ACCESS_TIME = process.env.SECRET_ACCESS_TIME ?? '1h';
const SECRET_REFRESH_TIME = process.env.SECRET_REFRESH_TIME ?? '2h';

module.exports = {
    ADMIN_PASSWORD,
    ADMIN_ID,
    ADMIN_EMAIL,
    SECRET_ACCESS_TIME,
    SECRET_REFRESH_TIME,
    SECRET_ACCESS_TOKEN,
    SECRET_REFRESH_TOKEN,
}