import { config as dotenv } from 'dotenv'
dotenv()

import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});