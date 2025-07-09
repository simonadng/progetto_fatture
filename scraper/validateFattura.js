import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export async function validateFattura(filePath) {
    const fileExists = fs.existsSync(filePath);ù
    if (!fileExists) throw new Error("il file XML non esiste: ", filePath); 

    const URL = 'https://fex-app.com/servizi/verifica';
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null, });

    try {
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: "domcontentloaded" });

        await page.waitForSelector('input[type="file"]', { visible: true });

        const inputUploadHandle = await page.$('input[type="file"]');
        await inputUploadHandle.uploadFile(path.resolve(filePath));
        
        await page.click("input.uploadact");
        
        await page.waitForSelector(".result-container, .error-box, .warning-box", {
                timeout: 10000
            });

        const result = await page.evaluate(() => {   //devo controllare se i div si chiamano effettivamente così
            const errors = Array.from(document.querySelectorAll("div.error-box")).map(el => el.innerText.trim());
            const warnings = Array.from(document.querySelectorAll("div.warning-box")).map(el => el.innerText.trim());
            return { errors, warnings };
        });
        return result;

    } catch (error) {
        throw new Error("errore durante la validazione su Fex:" + error.messagge);
    } finally {
        await browser.close();
    }


    
} 
