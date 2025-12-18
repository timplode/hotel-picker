export default {
  routes: [
    {
     method: 'GET',
     path: '/stats/conferences',
     handler: 'stats.conferences',
     config: {
       policies:   [],
       middlewares: [],
     },
    },
  ],
};
