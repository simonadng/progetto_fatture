const fs = require("fs");
const path = require("path");
const { parseFatturaXML } = require("./parser/parseFatturaXML");
//const { validateFattura } = require("./scraper/validateFattura");

const filePath = "D:\\xml\\IT02347500973_mHXAa.xml";  //commentato per caricarlo su github = è corretto


try {
    if (!fs.existsSync(filePath)) {
        console.log("Il file specificato non esiste:", filePath);
    } else {
        const dati = parseFatturaXML(filePath);
        console.log("Dati fattura:", dati);
    }
} catch (error) {
    console.log("Errore durante la lettura o il parsing del file:", error);
}









