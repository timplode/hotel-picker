/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import { Order} from '../../../lib/types/order';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async submit(ctx) {
    try {
      const { data }: { data: Order } = ctx.request.body;
      
      // Validate required fields
      if (!data) {
        return ctx.badRequest('Order data is required');
      }

      // Execute all database operations within a transaction
      const result = await strapi.db.transaction(async ({ trx }) => {
        // Create the order with submitted data
        const entity = await strapi.entityService.create('api::order.order', {
          data: {
            ...data,
            conference_hotel: data.selectedHotel || null,
            orderStatus: 'received',
            publishedAt: new Date(),
          },
        });

        // Process rooms if they exist
        if (data.rooms && data.rooms.length > 0) {
          for (const room of data.rooms) {
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
            if (room.occupants && room.occupants.length > 0) {
              for (const occupant of room.occupants) {
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
