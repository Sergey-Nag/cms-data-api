const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@admin.a';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ADMIN_EMAIL;
const ADMIN_ID = process.env.ADMIN_ID ?? 'Admin-id';

const HASH_PASSWORD_ROUNDS = process.env.HASH_PASSWORD_ROUND ?? 2;

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
    HASH_PASSWORD_ROUNDS,
}