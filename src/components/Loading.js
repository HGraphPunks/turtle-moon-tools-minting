import CircularProgress from '@mui/material/CircularProgress';
import logo from '../assets/TMT_Logo.png'


export const Loading = () => {
  return( 
    <>
        <img src={logo} style={{position:'absolute',width:'200px', height:'200px'}} />
        <CircularProgress color="primary" style={{width:'230px', height:'230px'}} /> 
    </>
  )
}