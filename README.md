# APSpectator
A web-based spectator client for Archipelago

## Usage as a browser source (OBS, SLOBS, etc.)

A handful of options exist to better enable using the spectator client as a
browser source in OBS.

The following URL parameters can be defined:

- `server`: Archipelago server address, e.g. `example.org:38281`
- `player`: Player name or slot number.
- `password`: Server password (if required)
- `hideui`: If set to 1, the entire spectator client UI will be hidden.  This means there will be no space to enter commands or enter connection information.

If both `server` and `player` and specified, the client will automatically
connect on page load.  Specifying just one of them has no effect currently.

Example: `path/to/index.html?server=example.org&player=Yourname&password=topsecret&hideui=1`

### CSS Overrides

Using OBS, you can override the CSS used to style the client's output.  Here's a reasonably good starting point:

```css
body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }
#main-content { border: 0; padding: 0; margin: 0; }
#console-output-wrapper { overflow: hidden; }
```

To change the background color, add it to `#console-output-wrapper`.  Here's a translucent black background:

```css
#console-output-wrapper { overflow: hidden; background-color: rgba(0, 0, 0, 75%); }
```

You can change other elements by styling the following CSS classes:

| CSS Class            | Explanation
| -------------------- | -----------
| `.cmsg-player-self`  | Your player
| `.cmsg-player-other` | Other players
| `.cmsg-location`     | Location names
| `.cmsg-item`         | Items (all types)
| `.item-advancement`  | Advancement items
| `.item-useful`       | Useful items
| `.item-trap`         | Trap items
| `.cmsg-entrance`     | Entrance names (seen in hints)

For more details, see [console.css](public/styles/console.css).  For a sample that updates colors to match common client colors, see [commonclient.css](public/styles/commonclient.css) 
