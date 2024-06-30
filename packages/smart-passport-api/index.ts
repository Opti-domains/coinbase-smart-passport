import { config as dotenv } from 'dotenv'
dotenv()

import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import { GraphQLClient, gql } from 'graphql-request';

const app = express();
const port = 8453;

app.use(express.json())
app.use(cors())

interface GitcoinScoreResponse {
  address: string
  score: string;
  status: string
}

const gitcoinAxios = axios.create({
  headers: {
    'X-API-KEY': process.env.GITCOIN_API_KEY,
  }
})

app.get('/gitcoin-score/:walletAddress', async (req: Request, res: Response) => {
  const walletAddress = req.params.walletAddress;

  try {
    await gitcoinAxios.post(`https://api.scorer.gitcoin.co/registry/submit-passport`, {
      address: walletAddress,
      scorer_id: process.env.GITCOIN_SCORER_ID,
    });

    const response = await gitcoinAxios.get<GitcoinScoreResponse>(`https://api.scorer.gitcoin.co/registry/score/${process.env.GITCOIN_SCORER_ID}/${walletAddress}`);
    res.json(response.data);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch Gitcoin score' });
  }
});

app.get('/coinbase-verification/:walletAddress', async (req: Request, res: Response) => {
  const walletAddress = req.params.walletAddress;

  try {
    // Define the GraphQL endpoint
    const endpoint = 'https://base.easscan.org/graphql';

    // Create a GraphQL client
    const graphQLClient = new GraphQLClient(endpoint);

    // Define the GraphQL query
    const query = gql`
      query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {
        attestations(where: $where, orderBy: $orderBy) {
          id
          decodedDataJson
          time
        }
      }
    `;

    // Define the variables for the query
    const variables = {
      where: {
        schemaId: {
          equals: '0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9',
        },
        attester: {
          equals: '0x357458739F90461b99789350868CD7CF330Dd7EE',
        },
        recipient: {
          equals: walletAddress,
        },
      },
      orderBy: {
        time: "desc"
      }
    };
  
    const data: any = await graphQLClient.request(query, variables);
    if (data.attestations && data.attestations.length > 0) {
      const firstAttestation = data.attestations[0];
      const decodedData = JSON.parse(firstAttestation.decodedDataJson);
      const verifiedAccount = decodedData.find((item: any) => item.name === 'verifiedAccount');
      if (verifiedAccount && verifiedAccount.value.value === true) {
        // Define the variables for the query
        const countryVariables = {
          where: {
            schemaId: {
              equals: '0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065',
            },
            attester: {
              equals: '0x357458739F90461b99789350868CD7CF330Dd7EE',
            },
            recipient: {
              equals: walletAddress,
            },
          },
          orderBy: {
            time: "desc"
          }
        };

        const countryData: any = await graphQLClient.request(query, countryVariables);

        if (countryData.attestations && countryData.attestations.length > 0) {
          const firstAttestation = countryData.attestations[0];
          const decodedData = JSON.parse(firstAttestation.decodedDataJson);
          const verifiedCountry = decodedData.find((item: any) => item.name === 'verifiedCountry');
          if (verifiedCountry && verifiedCountry.value.value) {
            res.send({
              verified: true,
              country: verifiedCountry.value.value,
            })
          } else {
            res.send({
              verified: true,
              country: '',
            })
          }
        }
      } else {
        res.status(404).json({ error: 'No Coinbase Verification' });
      }
    } else {
      res.status(404).json({ error: 'No Coinbase Verification' });
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch Coinbase Verification' });
  }
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});