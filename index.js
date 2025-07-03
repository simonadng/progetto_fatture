const fs = require("fs");
const path = require("path");
const { parseFatturaXML } = require("./parser/parseFatturaXML");

//const cartella = "D:\\xml";  commentato per caricarlo su github = è corretto

try {
    const files = fs.readdirSync(cartella);
    const xmlFiles = files.filter(f => f.endsWith(".xml"));

    if (xmlFiles.length === 0) {
        console.log("nessun file trovato nella cartella");
    } else {
      xmlFiles.forEach(file => {
        const filePath = path.join(cartella, file);
        const dati = parseFatturaXML(filePath);
        console.log(`Dati fattura da file ${file}:`, dati);
      });
    }
} catch (error) {
    console.log("errore durante la lettura dei file", error);
    
}



const files = fs.readdirSync(cartella);









