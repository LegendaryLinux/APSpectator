let cachedCommands = [];
const maxCachedCommands = 10;
const maxConsoleMessages = 500;
let commandCursor = 0;

window.addEventListener('load', () => {
  const commandInput = document.getElementById('console-input');
  commandInput.addEventListener('keydown', (event) => {
    // Only perform events on desired keys
    const allowedKeys = ['ArrowUp', 'ArrowDown'];
    if (allowedKeys.indexOf(event.key) === -1) { return; }

    switch (event.key) {
      case 'ArrowUp':
        if (cachedCommands.length === 0 || commandCursor === maxCachedCommands) { return; }
        if (commandCursor < maxCachedCommands && commandCursor < cachedCommands.length) { commandCursor++; }
        commandInput.value = commandCursor ? cachedCommands[cachedCommands.length - commandCursor] : '';
        return;

      case 'ArrowDown':
        if (cachedCommands.length === 0 || commandCursor === 0) { return; }
        if (commandCursor > 0) { commandCursor--; }
        commandInput.value = commandCursor ? cachedCommands[cachedCommands.length - commandCursor] : '';
        return;

      default:
        return;
    }
  });

  commandInput.addEventListener('keyup', (event) => {
    // Ignore non-enter keyup events and empty commands
    if (event.key !== 'Enter' || !event.target.value) { return; }

    // Ignore events related to the keydown listener
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { return; }

    // Detect slash commands and perform their actions
    if (event.target.value[0] === '/') {
      const commandParts = event.target.value.split(' ');
      switch (commandParts[0]) {
        case '/connect':
          commandParts.shift();
          const address = commandParts[0] || null;
          const player = commandParts[1] || null;
          const password = commandParts[2] || null;
          document.getElementById('server-address').value = address;
          document.getElementById('player').value = player;

          // Server address and player name are required
          if (!address || !player) {
            appendConsoleMessage('Server address and player name are required to connect.');
            break;
          }

          connectToServer(address, player, password);
          break;

        case '/fontsize':
          if (commandParts.length < 2) {
            appendConsoleMessage('You must specify a font size like: /fontsize 16');
          }
          setFontSize(parseInt(commandParts[1]));
          break;

        case '/ui':
          toggleUi();
          break;

        // This command is not in alphabetical order because it's convenient to have it last
        case '/help':
          appendConsoleMessage('Available commands:');
          appendConsoleMessage('/connect [server] [player] [password] - Connect to an AP server with an optional password');
          appendConsoleMessage('/fontsize [size] - Change the size of the font. 16 is default');
          appendConsoleMessage('/ui - Toggle UI visibility');
          appendConsoleMessage('/help - Print this message');
          break;

        default:
          appendConsoleMessage('Unknown command.');
          break;
      }

      // Cache the command, empty the command input, reset the command cursor
      cacheCommand(event.target.value);
      commandInput.value = '';
      commandCursor = 0;
      return;
    }

    // Send command to server
    sendMessageToServer(event.target.value);
    cacheCommand(event.target.value);

    // Clear the input box
    commandInput.value = '';
  });

  const consoleWindow = document.getElementById('console-output-wrapper');
  consoleWindow.addEventListener('scroll', (evt) => {
    autoScrollPaused = Math.ceil(consoleWindow.scrollTop + consoleWindow.offsetHeight) < consoleWindow.scrollHeight;
  });
});

const appendConsoleMessage = (message) => {
  const monitor = document.getElementById('console-output-wrapper');
  // Do not exceed the maximum number of displayed console messages
  while (monitor.children.length >= maxConsoleMessages) {
    monitor.removeChild(monitor.firstChild);
  }

  // Append message div to monitor
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('console-output');
  messageDiv.innerText = message;
  monitor.appendChild(messageDiv);
  if (!autoScrollPaused) { messageDiv.scrollIntoView(false); }
};

const appendFormattedConsoleMessage = (messageParts) => {
  const monitor = document.getElementById('console-output-wrapper');
  // Do not exceed the maximum number of displayed console messages
  while (monitor.children.length >= maxConsoleMessages) {
    monitor.removeChild(monitor.firstChild);
  }

  // Create the message div
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('console-output');

  // Create the spans to populate the message div
  for (const part of messageParts) {
    const span = document.createElement('span');
    if (part.hasOwnProperty('type')) {
      switch(part.type){
        case 'player_id':
          const playerIsClient = parseInt(part.text, 10) === playerSlot;
          if (playerIsClient) {
            span.classList.add("console-message-player-self");
          } else {
            span.classList.add("console-message-player-other");
          }
          span.innerText = players[parseInt(part.text, 10) - 1].alias;
          break;
        case 'item_id':
          span.classList.add("console-message-item");
          if(part.flags & 0b001) {
            span.classList.add("console-message-item-advancement");
            span.setAttribute("title", "Advancement Item")
          }
          else if(part.flags & 0b010) {
            span.classList.add("console-message-item-useful");
            span.setAttribute("title", "Useful Item")
          }
          else if(part.flags & 0b100) {
            span.classList.add("console-message-item-trap");
            span.setAttribute("title", "Trap")
          }
          else {
            span.classList.add("console-message-item-normal");
            span.setAttribute("title", "Item")
          }
          span.innerText = apItemsById[Number(part.text)];

          console.log(part)
          break;
        case 'location_id':
          span.classList.add("console-message-location");
          span.innerText = apLocationsById[Number(part.text)];
          break;
        case 'entrance_name':
          span.classList.add("console-message-entrance");
          span.innerText = part.text;
          break;
        default:
          span.innerText = part.text;
      }
    } else {
      span.innerText = part.text;
    }
    messageDiv.appendChild(span);
  }

  // Append the message div to the monitor
  monitor.appendChild(messageDiv);
  if (!autoScrollPaused) { messageDiv.scrollIntoView(false); }
};

const cacheCommand = (command) => {
  // Limit stored command count to five
  while (cachedCommands.length > maxCachedCommands) { cachedCommands.shift(); }

  // Store the command
  cachedCommands.push(command);
};
