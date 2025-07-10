import fs from "fs";
import path from "path";
import { parseFatturaXML } from "./parser/parseFatturaXML.js";
import { validateFattura } from "./scraper/validateFattura.js";

const fileName = "IT02347500973__1tTc.xml";                          
const filePath = path.resolve("./xml", fileName);     

try {
    if (!fs.existsSync(filePath)) {
        console.log("Il file specificato non esiste:", filePath); 
        process.exit(1);
    }
        const dati = parseFatturaXML(filePath);    //controllo per verificare quali sono i dati
        console.log("DATI FATTURA: ", dati);

        console.log("AVVIO VALIDAZIONE ONLINE SU FEX...");
        const esito = await validateFattura(filePath);

        console.log("\n RISULTATI DA FEX:");
        console.dir(esito, { depth: null });   //
        console.log(" ERRORI DI SCARTO: ", esito.erroriScarto || "nessuno");
        //console.log(" AVVISI GENERALI: ", esito.avvisiGenerali || "nessuno");

        if (esito.consigli) {
            console.log(" CONSIGLI: ", esito.consigli);
        }
    
} catch (error) {
    console.error(" ERRORE:", error.message);
}


