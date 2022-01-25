// noinspection JSBitwiseOperatorUsage

// Archipelago server
const DEFAULT_SERVER_PORT = 38281;
let serverSocket = null;
let lastServerAddress = null;
let serverPassword = null;
let serverAuthError = false;

// Track reconnection attempts.
const maxReconnectAttempts = 10;
let preventReconnect = false;
let reconnectAttempts = 0;
let reconnectTimeout = null;

// Players in the current game, received from Connected server packet
let playerSlot = null;
let playerTeam = null;
let players = [];

window.addEventListener('load', () => {
  // Handle server address change
  document.getElementById('server-address').addEventListener('keydown', beginConnectionAttempt);
  document.getElementById('player').addEventListener('keydown', beginConnectionAttempt);
});

const beginConnectionAttempt = (event) => {
  if (event.key !== 'Enter') { return; }

  // User-input values
  const address = document.getElementById('server-address').value;
  const player = document.getElementById('player').value;

  // If the input value is empty, do not attempt to reconnect
  if (!address || !player) {
    appendConsoleMessage('A server and player name are required to connect.');
    preventReconnect = true;
    lastServerAddress = null;

    // If the socket is open, close it
    if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
      serverSocket.close();
      serverSocket = null;
    }

    // If the user did not specify a server address or player, do not attempt to connect
    return;
  }

  // User specified a server. Attempt to connect
  preventReconnect = false;
  connectToServer(address, player);
};

const connectToServer = (address, player, password = null) => {
  if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
    serverSocket.close();
    serverSocket = null;
  }

  // If an empty string is passed as the address, do not attempt to connect
  if (!address) { return; }

  // This is a new connection attempt, no auth error has occurred yet
  serverAuthError = false;

  // Determine the server address
  let serverAddress = address;
  if (serverAddress.search(/^\/connect /) > -1) { serverAddress = serverAddress.substring(9); }
  if (serverAddress.search(/:\d+$/) === -1) { serverAddress = `${serverAddress}:${DEFAULT_SERVER_PORT}`;}

  // Store the password, if given
  serverPassword = password;

  // Attempt to connect to the server
  serverSocket = new WebSocket(`ws://${serverAddress}`);
  serverSocket.onopen = (event) => {
    appendConsoleMessage(`Connected to Archipelago server at ${serverAddress}`);
  };

  // Handle incoming messages
  serverSocket.onmessage = (event) => {
    const commands = JSON.parse(event.data);
    for (let command of commands) {
      const serverStatus = document.getElementById('server-status');
      switch(command.cmd) {
        case 'RoomInfo':
          // Authenticate with the server
          const connectionData = {
            cmd: 'Connect',
            game: 'Archipelago',
            name: player,
            uuid: getClientId(),
            tags: ['TextOnly', 'IgnoreGame', 'Spectator'],
            password: serverPassword,
            version: ARCHIPELAGO_PROTOCOL_VERSION,
            items_handling: 0b000,
          };
          serverSocket.send(JSON.stringify([connectionData]));
          break;

        case 'Connected':
          // Save the last server that was successfully connected to
          lastServerAddress = address;

          // Reset reconnection info if necessary
          reconnectAttempts = 0;

          // Save the list of players provided by the server
          players = command.players;

          // Save information about the current player
          playerTeam = command.team;
          playerSlot = command.slot;

          // Update header text
          serverStatus.classList.remove('disconnected');
          serverStatus.innerText = 'Connected';
          serverStatus.classList.add('connected');

          requestDataPackage();
          break;

        case 'ConnectionRefused':
          serverStatus.classList.remove('connected');
          serverStatus.innerText = 'Not Connected';
          serverStatus.classList.add('disconnected');
          if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
            if (command.errors.includes('InvalidPassword')) {
              appendConsoleMessage(serverPassword === null ?
                'A password is required to connect to the server. Please use /connect [server] [password]' :
                'The password you provided was rejected by the server.'
              );
            } else {
              appendConsoleMessage(`Error while connecting to AP server: ${command.errors.join(', ')}.`);
            }
            serverAuthError = true;
            serverSocket.close();
            serverSocket = null;
          }
          break;

        case 'ReceivedItems':
          break;

        case 'LocationInfo':
          break;

        case 'RoomUpdate':
          break;

        case 'Print':
          appendConsoleMessage(command.text);
          break;

        case 'PrintJSON':
          appendFormattedConsoleMessage(command.data);
          break;

        case 'DataPackage':
          buildItemAndLocationData(command.data);
          break;

        case 'Bounced':
          break;

        default:
          // Unhandled events are ignored
          break;
      }
    }
  };

  serverSocket.onclose = (event) => {
    const serverStatus = document.getElementById('server-status');
    serverStatus.classList.remove('connected');
    serverStatus.innerText = 'Not Connected';
    serverStatus.classList.add('disconnected');

    // If the user cleared the server address, do nothing
    const serverAddress = document.getElementById('server-address').value;
    if (preventReconnect || !serverAddress) { return; }

    // Do not allow simultaneous reconnection attempts
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }

    // Attempt to reconnect to the AP server
    reconnectTimeout = setTimeout(() => {
      // Do not attempt to reconnect if a server connection exists already. This can happen if a user attempts
      // to connect to a new server after connecting to a previous one
      if (serverSocket && serverSocket.readyState === WebSocket.OPEN) { return; }

      // If the socket was closed in response to an auth error, do not reconnect
      if (serverAuthError) { return; }

      // If reconnection is currently prohibited for any other reason, do not attempt to reconnect
      if (preventReconnect) { return; }

      // Do not exceed the limit of reconnection attempts
      if (++reconnectAttempts > maxReconnectAttempts) {
        appendConsoleMessage('Archipelago server connection lost. The connection closed unexpectedly. ' +
          'Please try to reconnect, or restart the client.');
        return;
      }

      appendConsoleMessage(`Connection to AP server lost. Attempting to reconnect ` +
        `(${reconnectAttempts} of ${maxReconnectAttempts})`);
      connectToServer(address, serverPassword);
    }, 5000);
  };

  serverSocket.onerror = (event) => {
    if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
      appendConsoleMessage('Archipelago server connection lost. The connection closed unexpectedly. ' +
        'Please try to reconnect, or restart the client.');
      serverSocket.close();
    }
  };
};

const getClientId = () => {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = (Math.random() * 10000000000000000).toString();
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
};

const sendMessageToServer = (message) => {
  if (serverSocket && serverSocket.readyState === WebSocket.OPEN) {
    serverSocket.send(JSON.stringify([{
      cmd: 'Say',
      text: message,
    }]));
  }
};

const requestDataPackage = () => {
  if (!serverSocket || serverSocket.readyState !== WebSocket.OPEN) { return; }
  serverSocket.send(JSON.stringify([{
    cmd: 'GetDataPackage',
  }]));
};

const buildItemAndLocationData = (dataPackage) => {
  Object.keys(dataPackage.games).forEach((gameName) => {
    // Build itemId map
    Object.keys(dataPackage.games[gameName].item_name_to_id).forEach((itemName) => {
      apItemsById[dataPackage.games[gameName].item_name_to_id[itemName]] = itemName;
    });

    // Build locationId map
    Object.keys(dataPackage.games[gameName].location_name_to_id).forEach((locationName) => {
      apLocationsById[dataPackage.games[gameName].location_name_to_id[locationName]] = locationName;
    });
  });
};
