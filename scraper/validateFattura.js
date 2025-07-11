import puppeteer from "puppeteer";
import fs from "fs";

export async function validateFattura(filePath) {
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) throw new Error("il file XML non esiste: " + filePath); 

    const URL = 'https://fex-app.com/servizi/verifica';
    const browser = await puppeteer.launch({ headless: true, defaultViewport: null });

    try {
        const page = await browser.newPage();
        await page.goto(URL, { waitUntil: "load" });

        await page.waitForSelector('input.uploadbtn', { visible: true });  //si blocca qui - sembra che non inserisce il file nell'upload

        const inputUploadHandle = await page.$('input.uploadbtn');   
        await inputUploadHandle.uploadFile(filePath);
console.log("test - passato");

        await page.evaluate(() => {                                       
            const input = document.querySelector('input.uploadbtn');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.blur();
        });

        await page.waitForSelector('#file-upload', { visible: true });  //await page.waitForSelector('input.uploadact', { visible: true });
        await page.click('#file-upload');   //await page.click('input.uploadact');
        

        await page.waitForNavigation({ waitUntil: 'networkidle0' });       
        await page.waitForFunction(() => {
            return document.querySelectorAll('#errlist .help').length > 0;
        }, { timeout: 15000 });


        const result = await page.evaluate(() => {
            const dettagli = [];
           
            const redSections = document.querySelectorAll("#errlist li.red");

            redSections.forEach((li) => {
                const table = li.querySelector("table.nodeprop");
                const help = li.querySelector(".help");

                if (table && help) {
                    const rows = Array.from(table.querySelectorAll("tbody tr"));

                    rows.forEach(row => {
                        const cells = row.querySelectorAll("td");
                        if (cells.length >= 2) {
                            const nodo = cells[0]?.innerText.trim() || null;
                            const valore = cells[1]?.innerText.trim() || null;

                            dettagli.push({
                                nodo,
                                valore,
                                messaggio: help.innerText.trim()
                            });
                        }
                    });
                }
            });

            const erroriScarto = dettagli.length;

            return {
                erroriScarto,
                dettagli
            };
        });


        const outputPath = path.join(process.cwd(), 'results', 'report.json');    //da testare
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
        console.log('risultati salvati in: ', outputPath);


        return result;        
    } catch (error) {
        throw new Error("errore durante la validazione su Fex: " + error.message);
    } finally {
        await browser.close();
    }
   
} 





