const mqtt = require('mqtt');
const sql = require('mssql');

// ✅ FIXED MQTT URL
const client = mqtt.connect('mqtt://54.238.155.125:1883',{
    clientId: 'arpit12345',
  username:'',
  password: "Arpit@123",
});

// SQL config
const dbConfig = {
    user: 'admin',
    password: 'Arpit123',
    server: 'database-2.cp4sgkq6afa3.ap-northeast-1.rds.amazonaws.com',
    port: 1433,
    database: 'mqtt_db',
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    requestTimeout: 60000
};

let pool;

// ✅ Connect DB + create table safely
async function initDB() {
  try {
    pool = await sql.connect(dbConfig);
    console.log("DB Connected ✅");
     
    // const query=`select * from mqtt_data`;
    // const result = await pool.request().query(query);
    // console.log("Table check result:", result.recordset);

  } catch (err) {
    console.error("DB Init Error ❌", err);
  }
}

// MQTT connect
client.on('connect', () => {
    console.log('MQTT Connected ✅');

    client.subscribe('deye', (err) => {
        if (err) {
            console.error("Subscribe Error:", err);
        } else {
            console.log('Subscribed to topic: deye ✅');
        }
    });
});

// Insert data
client.on('message', async (topic, message) => {
    const msg = message.toString();
    console.log(`Received: ${msg}`);

//     if (!pool) {
//         console.log("DB not ready ❌");
//         return;
//     }

//     try {
//         const data = JSON.parse(msg);
//         const YOUR_QUERY = `INSERT INTO mqtt_data (
//     MAC, INVTYP, COUNTRY, RUNST,
//     DCBUSV, DCBUSVN, DCV1, DCV2, DCC1, DCC2, DCP1, DCP2,
//     GRDVA, GRDVB, GRDVC, GRDCA, GRDCB, GRDCC, GRFREQ,
//     INVOUTV, TTGRDPW, GRDCNTWRK,
//     BOSTTEMP, CVTYTEMP, INVTEMP,
//     RMSLCKCUR, AVGLCKCUR, MXGRDCUR, PWFTR,
//     WRNG, FALT,
//     DYATVPW, TTATVPW,
//     GRDCNTPWELETBL, GRDCNTRETPW, MTRPWR, DYLDPW, CUMLDPW,
//     TOTENGEXP, TOTENGIMP,
//     DCCOMPA, METERE, TOTWRKTM
// )
// VALUES (
//     @MAC, @INVTYP, @COUNTRY, @RUNST,
//     @DCBUSV, @DCBUSVN, @DCV1, @DCV2, @DCC1, @DCC2, @DCP1, @DCP2,
//     @GRDVA, @GRDVB, @GRDVC, @GRDCA, @GRDCB, @GRDCC, @GRFREQ,
//     @INVOUTV, @TTGRDPW, @GRDCNTWRK,
//     @BOSTTEMP, @CVTYTEMP, @INVTEMP,
//     @RMSLCKCUR, @AVGLCKCUR, @MXGRDCUR, @PWFTR,
//     @WRNG, @FALT,
//     @DYATVPW, @TTATVPW,
//     @GRDCNTPWELETBL, @GRDCNTRETPW, @MTRPWR, @DYLDPW, @CUMLDPW,
//     @TOTENGEXP, @TOTENGIMP,
//     @DCCOMPA, @METERE, @TOTWRKTM
// );`;

//         await pool.request()
//             .input('MAC', sql.VarChar, data.MAC)
//             .input('INVTYP', sql.Int, parseInt(data.INVTYP))
//             .input('COUNTRY', sql.Int, parseInt(data.COUNTRY))
//             .input('RUNST', sql.Float, parseFloat(data.RUNST))

//             .input('DCBUSV', sql.Float, parseFloat(data.DCBUSV))
//             .input('DCBUSVN', sql.Float, parseFloat(data.DCBUSVN))
//             .input('DCV1', sql.Float, parseFloat(data.DCV1))
//             .input('DCV2', sql.Float, parseFloat(data.DCV2))
//             .input('DCC1', sql.Float, parseFloat(data.DCC1))
//             .input('DCC2', sql.Float, parseFloat(data.DCC2))
//             .input('DCP1', sql.Float, parseFloat(data.DCP1))
//             .input('DCP2', sql.Float, parseFloat(data.DCP2))

//             .input('GRDVA', sql.Float, parseFloat(data.GRDVA))
//             .input('GRDVB', sql.Float, parseFloat(data.GRDVB))
//             .input('GRDVC', sql.Float, parseFloat(data.GRDVC))
//             .input('GRDCA', sql.Float, parseFloat(data.GRDCA))
//             .input('GRDCB', sql.Float, parseFloat(data.GRDCB))
//             .input('GRDCC', sql.Float, parseFloat(data.GRDCC))
//             .input('GRFREQ', sql.Float, parseFloat(data.GRFREQ))

//             .input('INVOUTV', sql.Float, parseFloat(data.INVOUTV))
//             .input('TTGRDPW', sql.Float, parseFloat(data.TTGRDPW))
//             .input('GRDCNTWRK', sql.Float, parseFloat(data.GRDCNTWRK))

//             .input('BOSTTEMP', sql.Float, parseFloat(data.BOSTTEMP))
//             .input('CVTYTEMP', sql.Float, parseFloat(data.CVTYTEMP))
//             .input('INVTEMP', sql.Float, parseFloat(data.INVTEMP))

//             .input('RMSLCKCUR', sql.Float, parseFloat(data.RMSLCKCUR))
//             .input('AVGLCKCUR', sql.Float, parseFloat(data.AVGLCKCUR))
//             .input('MXGRDCUR', sql.Float, parseFloat(data.MXGRDCUR))
//             .input('PWFTR', sql.Float, parseFloat(data.PWFTR))

//             .input('WRNG', sql.Int, parseInt(data.WRNG))
//             .input('FALT', sql.Int, parseInt(data.FALT))

//             .input('DYATVPW', sql.Float, parseFloat(data.DYATVPW))
//             .input('TTATVPW', sql.Float, parseFloat(data.TTATVPW))

//             .input('GRDCNTPWELETBL', sql.Float, parseFloat(data.GRDCNTPWELETBL))
//             .input('GRDCNTRETPW', sql.Float, parseFloat(data.GRDCNTRETPW))
//             .input('MTRPWR', sql.Float, parseFloat(data.MTRPWR))
//             .input('DYLDPW', sql.Float, parseFloat(data.DYLDPW))
//             .input('CUMLDPW', sql.Float, parseFloat(data.CUMLDPW))

//             .input('TOTENGEXP', sql.Float, parseFloat(data.TOTENGEXP))
//             .input('TOTENGIMP', sql.Float, parseFloat(data.TOTENGIMP))

//             .input('DCCOMPA', sql.Float, parseFloat(data.DCCOMPA))
//             .input('METERE', sql.Int, parseInt(data.METERE))
//             .input('TOTWRKTM', sql.Float, parseFloat(data.TOTWRKTM))

//             .query(YOUR_QUERY);

//         console.log("Saved to DB ✅");

//     } catch (err) {
//         console.error("Insert Error ❌", err);
//     }
});

// Start system
(async () => {
  await initDB();
})();