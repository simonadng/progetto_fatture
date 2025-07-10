import puppeteer from "puppeteer";
import fs from "fs";

export async function validateFattura(filePath) {
    const fileExists = fs.existsSync(filePath);
    if (!fileExists) throw new Error("il file XML non esiste: " + filePath); 

    const URL = 'https://fex-app.com/servizi/verifica';
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });  //rimetti true - funziona solo in false, per lavorare in true dovrei usare degli anti-bot

    try {
        const page = await browser.newPage();

        await page.goto(URL, { waitUntil: "load" });

        await page.waitForSelector('input.uploadbtn');  

        const inputUploadHandle = await page.$('input.uploadbtn');   
        await inputUploadHandle.uploadFile(filePath);

        await page.evaluate(() => {                                //forzo il cambiamento
            const input = document.querySelector('input.uploadbtn');
            const evt = new Event('change', { bubbles: true });
            input.dispatchEvent(evt);
        });

        await page.waitForSelector('input.uploadact', { visible: true });
        await page.click('input.uploadact');      


        // Aspetta che appaia almeno un elemento errore o la tabella
await page.waitForFunction(() => {
    return document.querySelector("li.red strong") ||
           document.querySelector("#errlist table tbody") ||
           document.querySelector("#errlist p");
}, { timeout: 10000 });

        await page.waitForSelector('#errlist table tbody', { visible: true, timeout: 15000 });

//estrazione errori
        const result = await page.evaluate(() => {
            const getCount = (selector) => {
                const li = document.querySelector(selector);
                if (!li) return 0;
                const strong = li.querySelector("strong");
                return strong ? strong.textContent.trim() : "0";  //
                //return strong ? parseInt(strong.textContent.trim(), 10) : 0;
            };

            const parseRow = (row) => {
                const cells = row.querySelectorAll("td");
                return {
                    nodo: cells[0]?.innerText.trim() || null,
                    valore: cells[1]?.innerText.trim() || null,
                    messaggio: cells[2]?.innerText.trim() || null
                };
            };

            const dettagli = [];
            const tbody = document.querySelector("#errlist table tbody");
            if (tbody) {
                const rows = Array.from(tbody.querySelectorAll("tr"));

                for (const row of rows) {
                    const cells = row.querySelectorAll("td");
                    if (cells.length < 3) continue;

                    const nodo = cells[0].innerText.trim();
                    const valore = cells[1].innerText.trim();
                    const messaggio = cells[2].innerText.trim();

                    const blacklist = ["FeX Id", "Score", "SdI N.", "Cadenza", "Valore:", "Genitori:", "Nodo:"];
                    //if (blacklist.some(keyword => nodo.includes(keyword))) continue;

                    //controllare
                    if (
    blacklist.some(keyword => nodo.includes(keyword)) &&
    !valore.toLowerCase().includes("errore") &&
    !valore.toLowerCase().includes("partita iva")
) continue;//
                    
                    dettagli.push({
                        tipo: row.className.toLowerCase() || "info",
                        nodo,
                        valore,
                        messaggio
                    });
                }
            }

           /* if (tbody) {
                const rows = Array.from(tbody.querySelectorAll("tr"));
                for (const row of rows) {
                    const tipoClass = row.className.toLowerCase(); 
                    const parsed = parseRow(row);
                    dettagli.push({
                        tipo: tipoClass,
                        ...parsed
                    });
                }
            }*/

            return {
                erroriScarto: getCount("li.red"),
                //avvisiGenerali: getCount("li.yellow"),
                consigli: document.querySelector("#errlist p")?.innerText?.trim() || null,
                dettagli
            };
        });

        return result;
    } catch (error) {
        throw new Error("errore durante la validazione su Fex:" + error.message);
    } finally {
        //await browser.close();
    }
   
} 
