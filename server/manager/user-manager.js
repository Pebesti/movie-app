module.exports = function UserManager(pool) {
  async function getSystemUser(username) {
    const result = await pool.query(
      `select * from system_users where username = $1`,
      [username]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  async function signUpSystemUser(username, password, firstname, lastname) {
    const result = await pool.query(
      `INSERT INTO system_users(username,password,firstname,lastname,dateregistered) VALUES($1,$2,$3,$4,NOW()); `,
      [username, password, firstname, lastname]
    );

    return result.rowCount;
  }

  return {
    getSystemUser,
    signUpSystemUser,
  };
};
