# APSpectator
A web-based spectator client for [Archipelago](https://archipelago.gg/).

## Usage as a browser source (OBS, SLOBS, etc.)

A handful of options exist to better enable using the spectator client as a
browser source in OBS.

The following URL parameters can be defined:

- `server`: Archipelago server address, e.g. `example.org:38281`
- `player`: Player name or slot number.
- `password`: Server password (if required)
- `hideui`: If set to 1, the entire spectator client UI will be hidden. This means there will be no space to enter
commands or enter connection information.

If both `server` and `player` and specified, the client will automatically
connect on page load.  Specifying just one of them has no effect currently.

Example:  
`path/to/index.html?server=example.org&player=Yourname&password=topsecret&hideui=1`

### CSS Overrides

Using OBS, you can override the CSS used to style the client's output.  Here's a reasonably good starting point:

```css
body {
    background-color: rgba(0, 0, 0, 0);
    margin: 0 auto;
    overflow: hidden;
}

#main-content {
    border: 0;
    padding: 0;
    margin: 0;
}

#console-output-wrapper {
    overflow: hidden;
}
```

To change the background color, add it to `#console-output-wrapper`.  Here's a translucent black background:

```css
#console-output-wrapper {
    overflow: hidden;
    background-color: rgba(0, 0, 0, 75%);
}
```

You can change the styling for references to your name by styling `.console-message-player-self`, other players with
`.console-message-player-other`, item names with `.console-message-item`, and locations with `.console-message-location`.  For more details,
see `console.css`
