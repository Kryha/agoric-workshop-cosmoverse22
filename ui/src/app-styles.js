export const mainContainer = {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '30vh',
  alignItems: 'center',
  borderRadius: '6px',
};

export const formContainer = {
  ...mainContainer,
  width: '450px',
  background: 'transparent',
  padding: '40px',
  border: '2px solid #00FF5F',
};

export const buttonStyle = {
  borderRadius: '4px',
  padding: '6px 35px',
  marginTop: '30px',
  alignSelf: 'flex-end',
  background: 'transparent',
  color: '#00FF5F',
  cursor: 'pointer',
  border: '2px solid #00FF5F',
  textTransform: 'uppercase',
  fontWeight: 'bold',
};

export const imgStyle = {
  width: '50px',
  height: '50px',
  marginTop: '50px',
};
