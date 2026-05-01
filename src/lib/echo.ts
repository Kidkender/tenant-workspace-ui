import Echo from "laravel-echo";
import Pusher from "pusher-js";

const token = localStorage.getItem('token');
const reverbAppKet = import.meta.env.VITE_REVERB_APP_KEY;
const wsHost = import.meta.env.VITE_REVERB_WS_HOST;
const wsPort = import.meta.env.VITE_REVERB_WS_PORT;
const authEndpoint = import.meta.env.VITE_REVERB_AUTH_ENDPOINT;


window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: reverbAppKet,
  wsHost: wsHost,
  wsPort: wsPort,

  forceTLS: false,
  enableTransports: ['ws', 'wss'],
  authEndpoint: `${authEndpoint}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  },
})
