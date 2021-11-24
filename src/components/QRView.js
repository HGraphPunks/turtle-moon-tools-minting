import {useState} from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Link,
  Button,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export const QRView = () => {
  const tmt_qrcodes = localStorage.getItem('tmt_qrcodes') || JSON.stringify([]);
  const qrCodes = JSON.parse(tmt_qrcodes);
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  return( 
    <>
      <Typography variant="h5" style={{padding: '5px'}} component="h5">
        QR Codes
      </Typography>
      <div style={{width: '100%', minHeight: '300px',background:'#000', color:'#fff'}}>
        {qrCodes?.reverse()?.map((code, index) => {
          return <Accordion key={index} expanded={expanded === 'panel'+index} onChange={handleChange('panel'+index)}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                {code?.nft?.tokenId}
              </Typography>
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                {code?.mainnet ? "MAINNET" : "TESTNET"}
              </Typography>
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                {code?.nft?.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item xs={6} style={{padding: '30px'}}>
                    <img style={{width: '90%', maxWidth: '400px'}} src={code?.qrCode} />
                    <br />
                </ Grid>
                <Grid item xs={6} style={{padding: '30px'}}>
                    <a href={code?.qrCode} download={code?.nft?.name + '_' + code?.nft?.tokenId + '_qrcode.png'}>
                      <Button>
                        Download QR Code
                      </Button>
                    </a>
                </ Grid>
              </ Grid>
            </AccordionDetails>
          </Accordion>
        })}
      </div>
    </>
  );
}