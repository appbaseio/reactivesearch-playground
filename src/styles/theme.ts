const typography = {
  fontFamily: 'Monaco, monospace',
  fontSize: '16px',
};

const light = {
  typography,

  colors: {
    alertColor: '#d9534f',
    textColor: '#171717',
    backgroundColor: '#eeeff0',
    backgroundColorAlt: '#d8dbde',
    primaryColor: '#2196F3',
    borderColor: '#bdbdbd',
    borderColorAlt: '#a0a0a0',
  },
};

const dark = {
  typography,

  colors: {
    textColor: '#ECEFF4',
    backgroundColor: '#181818',
    backgroundColorAlt: '#575c66',
    primaryColor: '#2196F3',
    alertColor: '#d9534f',
    borderColor: '#575c66',
    borderColorAlt: '#2E3440',
  },
};

export default function getTheme(preset: string) {
  if (preset === 'light') {
    return light;
  }
  return dark;
}
