import {useState} from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Link,
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
// import { BrowserWindow } from 'electron';


export const HLTokenView = () => {
  const hashlipsMintData = localStorage.getItem('hashlipsMintData') || JSON.stringify([]);
  const logs = JSON.parse(hashlipsMintData);
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const openBlank = (link) => {
    window.open(link, '_blank', 'top=500,left=200,frame=true,nodeIntegration=no')
  }

  return( 
    <>
    <Typography variant="h5" style={{padding: '5px'}} component="h5">
      Minted Token Logs
    </Typography>
    <div style={{width: '100%', minHeight: '300px',background:'#000', color:'#fff'}}>
      {logs?.reverse()?.map((log, index) => {
        return <Accordion key={index} expanded={expanded === 'panel'+index} onChange={handleChange('panel'+index)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {log?.tokenId}
            </Typography>
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {log?.mainnet ? "MAINNET" : "TESTNET"}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}> Quantity: {log?.nftIds?.length}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12}> 
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Token Id</TableCell>
                        <TableCell align="right">Schema</TableCell>
                        <TableCell align="right">Creator</TableCell>
                        <TableCell align="right">Description</TableCell>
                        <TableCell align="right">Category</TableCell>
                        <TableCell align="right">Royalty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow
                          key={log?.tokenJSON?.name}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {log?.tokenJSON?.name}
                          </TableCell>
                          <TableCell align="right">{log?.nft?.tokenId}</TableCell>
                          <TableCell align="right"><Link onClick={()=> {openBlank(log?.nft?.url)}}>IPFS</Link></TableCell>
                          <TableCell align="right">{log?.tokenJSON?.creator}</TableCell>
                          <TableCell align="right">{log?.tokenJSON?.description?.description}</TableCell>
                          <TableCell align="right">{log?.tokenJSON?.category}</TableCell>
                          <TableCell align="right">{log?.tokenJSON?.royalties?.numerator}%</TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                </ Grid>
              </ Grid>
              <Grid item xs={12} style={{padding: '30px'}}>
               <Grid item xs={6} style={{padding: '30px'}}>
                  <img style={{width: '90%', maxWidth: '400px'}} src={log?.imageURL?.photo} />
                  <br />
              </ Grid>
              </ Grid>
          </AccordionDetails>
        </Accordion>
      })}
    </div>
    </>
  );
}