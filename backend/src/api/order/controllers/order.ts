/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import { Order} from '../../../frontend_types/order';
import { Room } from '../../../frontend_types/room';
import { Occupant } from '../../../frontend_types/occupant';

const generateConfirmationHash = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async submit(ctx) {
    try {

      const { data }: { data: Order } = ctx.request.body;
      
      // Validate required fields
      if (!data) {
        return ctx.badRequest('Order data is required');
      }

      const confirmation = generateConfirmationHash();

      // Execute all database operations within a transaction
      const result = await strapi.db.transaction(async ({ trx }) => {
        // Create the order with submitted data
        const entity = await strapi.entityService.create('api::order.order', {
          data: {
            ...data,
            confirmation: confirmation,
            order_rooms: undefined,
            roomCount: data.order_rooms ? data.order_rooms.length : 0,
            occupantCount: data.order_rooms ? data.order_rooms.reduce((sum, room: Room) => sum + (room.order_room_occupants ? room.order_room_occupants.length : 0), 0) : 0,
            conference_hotel: data.selectedHotel || null,
            orderStatus: 'received'
          },
        });

        // Process rooms if they exist
        if (data.order_rooms && data.order_rooms.length > 0) {
          let room: Room;
          for (room of data.order_rooms) {
            // Create OrderRoom entry
            const orderRoom = await strapi.entityService.create('api::order-room.order-room', {
              data: {
                order: entity.documentId,
                type: room.type,
                arrivalDate: room.arrivalDate,
                departureDate: room.departureDate
              },
            });

            // Process occupants for this room
            if (room.order_room_occupants && room.order_room_occupants.length > 0) {
              let occupant: Occupant
              for (occupant of room.order_room_occupants) {
                await strapi.entityService.create('api::order-room-occupant.order-room-occupant', {
                  data: {
                    orderRoom: orderRoom.documentId,
                    firstName: occupant.firstName,
                    lastName: occupant.lastName,
                  },
                });
              }
            }
          }
        }

        return entity;
      });

      // Return the created order
      const sanitizedEntity = await this.sanitizeOutput(result, ctx);
      
      return ctx.send({
        data: sanitizedEntity,
        message: 'Order submitted successfully'
      });

    } catch (error) {
      strapi.log.error('Order submission error:', error);
      return ctx.internalServerError('Failed to submit order');
    }
  }
}));
