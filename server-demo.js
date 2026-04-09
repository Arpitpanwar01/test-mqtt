const mqtt = require('mqtt');
const { sql, poolConnect, pool } = require('./db');
require('dotenv').config();




const clientId = 'afore3_v2-' + Date.now();
const client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}`, {
  clientId: clientId,
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
  keepalive: 60,          // 5 minutes (300 seconds) matches device reporting interval
  reconnectPeriod: 1000,   // 2 seconds between reconnect attempts
  will: {
    topic: 'gti_mqtt_handler_status',
    payload: 'Disconnected unexpectedly',
    qos: 1,
    retain: false
  }
});

// Callback for successful MQTT connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(process.env.GTI_AFORE_PHASE3_MQTTv2, (err) => {
    if (err) {
      console.error('Subscribe error:', err.message);
    } else {
      console.log(`Subscribed to topic: ${process.env.GTI_AFORE_PHASE3_MQTTv2}`);
    }
  });
});


client.on('reconnect', () => {
    console.log('🟡 Reconnecting to MQTT...');
});

client.on('close', () => {
    console.log('🔴 Connection Closed');
});

client.on('offline', () => {
    console.log('⚠️ Client Offline');
});

client.on('error', (err) => {
    console.log('❌ MQTT Error:', err.message);
});

client.on('disconnect', (packet) => {
    console.log('🚫 Disconnected by broker:', packet);
});

client.on('end', () => {
    console.log('🛑 Client Ended');
});y



// Callback for receiving messages
client.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    const grdvabNum = Number(data.GRDVAB);
    const grdvbcNum = Number(data.GRDVBC);

    if (
      Number(data.GRDVAC) === 0 &&
      Number(data.GRDFQC) > 10 &&
      Number(data.GRDFQC) < 60 &&
      Number.isFinite(grdvabNum) &&
      Number.isFinite(grdvbcNum) &&
      Number(data.GRDVAB) >0 &&
      Number(data.GRDVBC) >0

    ) {
      const avg = (grdvabNum + grdvbcNum) / 2;
      //console.log(`Adjusted GRDVAC from 0 to average: ${avg}`);
      data.GRDVAC = avg.toString(); // ensure GRDVAC is string for SQL
      data.GRDVC = data.GRDVAC;
    }

    else if (
      Number(data.GRDVAC) === 0 &&
      Number(data.GRDFQC) > 10 &&
      Number(data.GRDFQC) < 60 &&
      Number.isFinite(grdvabNum) &&
      Number.isFinite(grdvbcNum) &&
      Number(data.GRDVAB) >0 &&
      Number(data.GRDVBC) ===0

    ) {
      //const avg = (grdvabNum + grdvbcNum) / 2;
      //console.log(`Adjusted GRDVAC from 0 to average: ${avg}`);
      //data.GRDVAC = avg.toString(); // ensure GRDVAC is string for SQL
      data.GRDVC = data.GRDVAB;
    }

    else if (
      Number(data.GRDVAC) === 0 &&
      Number(data.GRDFQC) > 10 &&
      Number(data.GRDFQC) < 60 &&
      Number.isFinite(grdvabNum) &&
      Number.isFinite(grdvbcNum) &&
      Number(data.GRDVAB) ===0 &&
      Number(data.GRDVBC) >0

    ) {
      //const avg = (grdvabNum + grdvbcNum) / 2;
      //console.log(`Adjusted GRDVAC from 0 to average: ${avg}`);
      //data.GRDVAC = avg.toString(); // ensure GRDVAC is string for SQL
      data.GRDVC = data.GRDVBC;
    }



    const columns = [
      'MAC', 'INSR', 'INNM', 'INVTYP', 'INCHR', 'SFTY', 'INSLRSTN', 'LKGCUR', 'MXACOUTCUR', 'RATEDPW', 
      'MPPTPHS', 'RUNSTATE', 'INATPW', 'TTATPW', 'TTRTPW', 'TTAPPW', 'PWRFT', 'TTGRCNATPW', 'TTGRCNREPW',
      'TTGRCNAPPW', 'CUMLDPW', 'INTTEMP', 'RADTEMP', 'WARNING', 'FAULT', 'DYGRFDIN', 'CUMGRFDIN', 'ETDFRMGRD',
      'ETTFRMGRD', 'DYEGPUR', 'CUMEGPUR', 'TOTWRKTM', 'DCBSV', 'DCBSVN', 'DCVOLT1', 'DCVOLT2', 'DCVOLT3',
      'DCVOLT4', 'DCCURR1', 'DCCURR2', 'DCCURR3', 'DCCURR4', 'DCP1', 'DCP2', 'DCP3', 'DCP4', 'DCGN1', 'DCGN2',
      'DCGN3', 'DCGN4', 'GRDVAB', 'GRDVBC', 'GRDVAC', 'GRIDVOLTA', 'GRIDVOLTB', 'GRIDVOLTC', 'GRIDCURRA', 'GRIDCURRB',
      'GRIDCURRC', 'GRDPWL1', 'GRDPWL2', 'GRDPWL3', 'GRDFQA', 'GRDFQB', 'GRDFQC', 'RPHGRCNPW', 'SPHGRCNPW', 'TPHGRCTPW',
      'TODYGEN', 'CUMGEN', 'phase','SMDYPVPW','TTPVPW','DYEGTOGRD','DYEGFRMGRD','DYEGTOLD' 
    ];

    const values = [
      data.MAC, data.INSR, data.INNM, data.INTYP, data.INCHR, data.SFTY, data.INSLRSTN, data.LKGCUR, data.MXACOUTCUR,
      data.RTPW, data.MPTPH, data.RUNST, data.INATPW, data.TTATPW, data.TTRTPW, data.TTAPPW, data.PWRFT, data.TTGRCNATPW,
      data.TTGRCNREPW, data.TTGRCNAPPW, data.TTLDATPW, data.INTTEMP, data.RADTEMP, data.WRNG, data.FAULT, data.DYGRFDIN,
      data.CMGRFDIN, data.ETDFRMGRD, data.ETTFRMGRD, data.DYEGPUR, data.CMEGPUR, data.TTWRKTM, data.DCBSV, data.DCBSVN,
      data.DCV1, data.DCV2, data.DCV3, data.DCV4, data.DCC1, data.DCC2, data.DCC3, data.DCC4, data.DCP1, data.DCP2,
      data.DCP3, data.DCP4, data.DCGN1, data.DCGN2, data.DCGN3, data.DCGN4, data.GRDVAB, data.GRDVBC, data.GRDVAC, data.GRDVA,
      data.GRDVB, data.GRDVC, data.GRDCA, data.GRDCB, data.GRDCC, data.GRDPA, data.GRDPB, data.GRDPC, data.GRDFQA, data.GRDFQB,
      data.GRDFQC, data.RPHGRCNPW, data.SPHGRCNPW, data.TPHGRCTPW, data.TDGEN, data.TTGEN, 'GTI_Abore_3phase',data.SMDYPVPW,data.TTPVPW,
      data.DYEGTOGRD,data.DYEGFRMGRD,data.DYEGTOLD
    ];

    const namedParams = columns.map((col, index) => `@param${index + 1}`).join(', ');
    const sqlInsertQuery = `
      INSERT INTO EastmenAllGTIInverterData (
        ${columns.join(', ')}
      ) VALUES (${namedParams})
    `;

    const request = pool.request();
    values.forEach((value, index) => {
      request.input(`param${index + 1}`, sql.VarChar, value ?? null);
    });

    await request.query(sqlInsertQuery);
    console.log('Inserted data successfully');
  } catch (err) {
    console.error('Error while processing message:', err.message);
  }
});


