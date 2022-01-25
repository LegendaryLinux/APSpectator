// UI state flag
let uiVisible = true;

window.addEventListener('load', () => {
  // Allow the user to change the size of the font in the console window
  document.getElementById('small-text').addEventListener('click', () => setFontSize(12));
  document.getElementById('medium-text').addEventListener('click', () => setFontSize(16));
  document.getElementById('large-text').addEventListener('click', () => setFontSize(20));
});

// Allow the user to change the size of text in the console window
const setFontSize = (size) => {
  if (!size || parseInt(size, 10) < 1) {
    return appendConsoleMessage('Font size must be an integer greater than zero.');
  }
  document.getElementById('console-output-wrapper').style.fontSize = `${parseInt(size, 10)}px`;
};

const toggleUi = () => {
  // SHow or hide the UI
  uiVisible ?
    document.getElementById('header').classList.add('invisible') :
    document.getElementById('header').classList.remove('invisible');

  // Toggle the UI state flag
  uiVisible = !uiVisible;
};
