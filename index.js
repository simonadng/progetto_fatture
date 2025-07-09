import fs from "fs";
import path from "path";
import { parseFatturaXML } from "./parser/parseFatturaXML.js";
import { validateFattura } from "./scraper/validateFattura.js";

//const { validateFattura } = require("./scraper/validateFattura");
//const filePath = "D:\\xml\\IT02347500973_mHXAa.xml";  //commentato per caricarlo su github = è corretto

const filePath = process.argv[2];      //node index.js "G:\\FattureXML\\IT00123456789.xml" 1. riguardare nome della cartella nell'hard disk

if (!filePath) {
    console.log("si deve specificare il nome del file XML.");
    process.exit(1);
}


try {
    if (!fs.existsSync(filePath)) {
        console.log("Il file specificato non esiste:", filePath);  //2. mi sa che sta cercando il file nella cartella del progetto
    } else {
        const dati = parseFatturaXML(filePath);
        console.log("DATI FATTURA: ", dati);

        console.log("AVVIO VALIDAZIONE ONLINE SU FEX...");
        const esito = await validateFattura(filePath);

        console.log(" RISULTATI SU FEX:");
        console.log(" ERRORI: ", esito.errors.length ? esito.errors: "nessuno");
        console.log(" AVVISI: ", esito.warnings.length ? esito.warnings: "nessuno");

        /* report nel file json - dipende da come lo vuole
        const report = {      //dati effettivi
            file: filePath,
            datiFattura: dati,
            risultatiFeX: esito,
            data: new Date().toISOString(),
        };

        const reportPath = path.resolve("./results/report.json");

        const dir = path.dirname(reportPath);  //crea una cartella a meno che non esista
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
        console.log(`Report salvato in ${reportPath}`);*/
    }
} catch (error) {
    console.error(" ERRORE:", error.message);
}


