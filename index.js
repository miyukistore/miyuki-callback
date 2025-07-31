
import axios from 'axios';
import fs from 'fs';
import moment from 'moment-timezone';
import chalk from 'chalk';
import express from 'express';
import osu from 'node-os-utils';

const { cpu, mem, drive, os } = osu;

const merchant_code = 'QP033540';
const api_key = '788ddbb9120b178e6d3347a6f4365b69f13f39e2a8b8da56bc23968d3a370911';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/index.html');
});

app.get('/info', async (req, res) => {
  try {
    const hostname = os.hostname();
    const platform = os.platform();
    const uptime = os.uptime();
    const cpuUsage = await cpu.usage();
    const memoryInfo = await mem.info();
    const driveInfo = await drive.info();

    res.json({
      hostname,
      platform,
      uptime,
      cpu_usage: `${cpuUsage.toFixed(2)}%`,
      free_memory: `${memoryInfo.freeMemMb} MB`,
      total_memory: `${memoryInfo.totalMemMb} MB`,
      used_disk: `${driveInfo.usedGb} GB`,
      free_disk: `${driveInfo.freeGb} GB`,
      total_disk: `${driveInfo.totalGb} GB`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system info.' });
  }
});

app.get('/mutasi.json', (req, res) => {
  res.sendFile(process.cwd() + '/mutasi.json');
});

app.post('/callback', (req, res) => {
  console.log('Received callback:', req.body);
  fs.writeFileSync('callback-log.json', JSON.stringify(req.body, null, 2));
  res.send('Callback received');
});

let lastTransactionId = null;

async function fetch() {
  try {
    let anu = await axios.get(`https://qiospay.id/api/mutasi/qris/${merchant_code}/${api_key}`);
    let res = anu.data;
    fs.writeFileSync('mutasi.json', JSON.stringify(res, null, 2));

    let currentTime = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
    console.log(chalk.green(`[${currentTime}]`) + ' ✅ Data updated.');

    const transactions = res.data || [];
    if (transactions.length > 0) {
      const latest = transactions[0];
      if (latest.id !== lastTransactionId) {
        lastTransactionId = latest.id;

        console.log(chalk.blue.bold('\n📢 Transaksi Baru Diterima!'));
        console.log(`📌 Nama: ${latest.nama}`);
        console.log(`💰 Jumlah: Rp ${latest.jumlah}`);
        console.log(`🕒 Waktu: ${latest.waktu}`);
        console.log(`🆔 ID: ${latest.id}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error(chalk.red('Error fetching or saving data:'), error.message);
  }
}

async function run() {
  await fetch();
  console.log(chalk.yellow('Waiting for 6 seconds before next fetch...'));
  setTimeout(run, 6000);
}
run();

app.listen(port, () => {
  console.log(chalk.green(`Server berjalan di port ${port}`));
});
