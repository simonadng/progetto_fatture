import fs from "fs";
import { XMLParser } from "fast-xml-parser";

export function parseFatturaXML(filePath) {
    const xmlData = fs.readFileSync(filePath, "utf-8");

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
    });
    const jsonObj = parser.parse(xmlData);

    const fattura = jsonObj["q1:FatturaElettronica"];

    if(!fattura){
        throw new Error("Formato XML non valido o mancante");
    }

    const header = fattura.FatturaElettronicaHeader;
    const body = fattura.FatturaElettronicaBody;
    
    const parsed = {   
        numero: body?.DatiGenerali?.DatiGeneraliDocumento?.Numero || null,
        data: body?.DatiGenerali?.DatiGeneraliDocumento?.Data || null,
        importo: body?.DatiGenerali?.DatiGeneraliDocumento?.ImportoTotaleDocumento || null,
        cliente: body?.CessionarioCommittente?.DatiAnagrafici?.Anagrafica?.Denominazione || null,
        codiceDestinatario: header?.DatiTrasmissione?.CodiceDestinatario || null,
        paese: header?.CedentePrestatore?.IdFiscaleIva?.IdPaese || null,
        partitaIva: header?.CedentePrestatore?.IdFiscaleIva?.IdCodice || null,
        fornitore: header?.CedentePrestatore?.DatiAnagrafici?.Anagrafica?.Denominazione || null,
        email: header?.CedentePrestatore?.Contatti?.Email || null,
    };

    return parsed;
}
