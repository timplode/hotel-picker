/**
 * A set of functions called "actions" for `stats`
 */

export default {
  conferences: async (ctx, next) => {
    try {
      // Query conferences with room booking counts
      const query =  `SELECT 
        hotel_conferences.id as "hotelonferenceId",
        count(orders.id) as "orderCount", 
        count(order_rooms.id) as "roomCount" 
      FROM orders
      INNER JOIN order_rooms ON orders.id = order_rooms.order_id
      LEFT JOIN hotel_conferences ON orders.conference_hotel_id = hotel_conferences.id
      LEFT JOIN conferences ON hotel_conferences.conference_id = conferences.id
      GROUP BY hotel_conferences.id`;
      const conferenceStats = await strapi.db.connection.raw(query)

      ctx.body = {
        data: conferenceStats
      };
    } catch (err) {
      ctx.body = err;
    }
  }
};
