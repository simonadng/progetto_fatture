const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
//IN PAUSA UN ATTIMO
async function validateFattura(filePath) {

    //identificazione sito
    const URL = 'https://fex-app.com/';
    const browser = await puppeteer.launch({ headless: true});

    const page = await browser.newPage();  
    await page.goto(URL, {waitUntil: "networkidle2"});


    const fileInputSelector = 'input[type="file"]'; //attendi e seleziona il file = bottone caricamento file
    
    await page.waitForSelector(fileInputSelector, { visible: true }); //attendi che l'input sia visibile

    const inputUploadHandle = await page.$(fileInputSelector);  //file da caricare
    if(!inputUploadHandle) throw new Error("Input file non trovato sulla pagina");

    await inputUploadHandle.uploadFile(path.resolve(filePath)); //upldoad file

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    //errori e avvisi
    //selector?  = info che si vogliono estrarre?

    const result = await page.evaluate(() => {
        //i selector cambiamo
        const errors = [];
        const warnings = [];

        document.querySelectorAll(".errori .errore, .errori .errore-dettaglio").forEach(el => {
            errors.push(el.innerText.trim());
        });

        document.querySelectorAll(".avvisi .avviso, .avvisi .avviso-dettaglio").forEach(el => {
            warnings.push(el.innerText.trim());
        });

        return { errors, warnings };
    });

    await browser.close();

    return result;
}

module.exports = { validateFattura };