module.exports = function MovieManager(pool) {
  async function getPlaylist(userId) {
    const result = await pool.query(
      `SELECT * FROM user_playlist WHERE userid = $1`,
      [userId]
    );
    return result.rows;
  }

  async function addToPlaylist(movieid, moviename, movieposter, UserId) {
    const result = await pool.query(
      `INSERT INTO user_playlist(movieid,moviename,movieposter,dateadded,userid) VALUES($1,$2,$3,NOW(),$4); `,
      [movieid, moviename, movieposter, UserId]
    );

    return result.rowCount;
  }

  async function removeFromPlaylist(playlistId, userId) {
    const result = await pool.query(
      `DELETE FROM user_playlist WHERE id = $1 AND userid = $2;`,
      [playlistId, userId]
    );

    return result.rowCount;
  }

  async function movieAdded(movieId, userId) {
    const result = await pool.query(
      `SELECT COUNT(id) as count FROM user_playlist WHERE movieid = $1 AND userid = $2;`,
      [movieId, userId]
    );

    return result.rows[0];
  }

  return {
    getPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    movieAdded,
  };
};
