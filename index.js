import axios from 'axios'; import fs from 'fs'; import moment from 'moment-timezone'; import chalk from 'chalk'; import express from 'express'; import os from 'os'; import osu from 'node-os-utils';

const merchant_code = 'QP033540'; const api_key = '788ddbb9120b178e6d3347a6f4365b69f13f39e2a8b8da56bc23968d3a370911';

async function fetchMutasi() { try { const url = https://qiospay.id/api/mutasi/qris/${merchant_code}/${api_key}; let response = await axios.get(url); let data = response.data; fs.writeFileSync('mutasi.json', JSON.stringify(data, null, 2));

let currentTime = moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
console.log(
  chalk.green.bold('INFO ') +
  chalk.green.bold(`[`) + chalk.white.bold(`${currentTime}`) + chalk.green.bold(`]: `) +
  chalk.cyan('Data saved to mutasi.json')
);

} catch (error) { console.error(chalk.red('Error fetching or saving data:'), error.message); } }

async function run() { await fetchMutasi(); console.log(chalk.yellow('Waiting for 6 seconds before next fetch...')); setTimeout(run, 6000); } run();

const app = express(); const port = process.env.PORT || 3000;

app.use(express.json()); app.use(express.static(process.cwd())); // serve index.html

// Endpoint info server app.get('/info', async (req, res) => { const cpuUsage = await osu.cpu.usage(); const driveInfo = await osu.drive.info();

res.json({ hostname: os.hostname(), platform: os.platform(), uptime: ${Math.floor(os.uptime() / 60)} minutes, cpu_usage: ${cpuUsage.toFixed(2)}%, free_memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB, total_memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB, used_disk: ${(driveInfo.usedGb).toFixed(2)} GB, free_disk: ${(driveInfo.freeGb).toFixed(2)} GB, total_disk: ${(driveInfo.totalGb).toFixed(2)} GB, }); });

// Endpoint file mutasi app.get('/mutasi.json', (req, res) => { res.sendFile(process.cwd() + '/mutasi.json'); });

// Callback endpoint app.post('/callback', (req, res) => { console.log('Received callback:', req.body); fs.writeFileSync('callback-log.json', JSON.stringify(req.body, null, 2)); res.send('Callback received'); });

app.listen(port, () => { console.log(chalk.green(Server berjalan di port ${port})); });

