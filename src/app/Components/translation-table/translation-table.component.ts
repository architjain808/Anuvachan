import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { langList, langList13 } from "src/app/services/language";
import { TranslateInBatchService } from "src/app/services/translate.service";
import { UtilService } from "src/app/services/utility.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { MessageService } from "primeng/api";
import * as XLSX from "xlsx";
import { map, tap } from "rxjs";

@Component({
  selector: "app-translation-table",
  templateUrl: "./translation-table.component.html",
  styleUrls: ["./translation-table.component.scss"],
})
export class TranslationTableComponent implements OnInit {
  JSONFile = new FormControl();
  Selectedlanguages: any[] = [];
  commonSelection!: string;
  languageArray = langList;
  InputJsonArray: any[] = [];
  totalApiCalls = 0;
  completeApiCalls = 0;
  fileName: string = "";
  inputText: any;
  advancedForm!: FormGroup;
  isExcelUpload: boolean = false;
  showSlide = false;
  constructor(
    private translateService: TranslateInBatchService,
    private utilservice: UtilService,
    private clipboard: Clipboard,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.advancedForm = new FormGroup({
      batchSize: new FormControl(10, [Validators.maxLength(3)]),
      delatInput: new FormControl(5000, [
        Validators.minLength(4),
        Validators.maxLength(4),
      ]),
    });
  }

  /**
   * set JSON data to the value from FILE
   * @param event file Event
   */
  setJsonData(event: any) {
    let file = event?.target?.files;
    if (file) {
      file = file[0];
      const reader = new FileReader();
      this.fileName = file.name;
      reader.onload = (e: any) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          this.JSONFile.setValue(jsonData); // Set the JSON data to the FormControl
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    } else if (this.inputText) {
      this.JSONFile.setValue(this.convertTextToJSON(this.inputText));
    }
  }

  /**
   * convery upload excel to JSON else call JSON set fn if .json uploaded
   * @param event upload event
   */
  setData(event: any) {
    if (!this.inputText && this.utilservice.isEventExcel(event)) {
      const file = event.target.files[0];
      this.isExcelUpload = true;
      const reader = new FileReader();
      this.fileName = file.name;
      reader.onload = (e: any) => {
        const binaryData = e.target.result;
        const workbook = XLSX.read(binaryData, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        // Transform the data to the required format
        const inputData = data.map((row: any) => ({
          sanskrit: row["sanskrit"] || row["Sanskrit"], // Assuming the first column is named 'sanskrit'
          hindiMeaning: row["hindi"] || row["Hindi"], // Assuming the second column is named 'hindi'
        }));
        this.JSONFile.setValue(inputData);
      };

      reader.readAsBinaryString(file);
    } else {
      // this.setJsonData(event);
    }
  }

  /**
   * Modify the input JSon and calls the Api
   */
  getTranslation() {
    if (this.isExcelUpload) {
      setTimeout(() => {
        this.showSlide = true;
      }, 0);
      this.InputJsonArray = this.JSONFile.value;
      this.syncTranslationFromJSON(this.JSONFile.value);
      return;
    }
    this.syncTranslationFromJSON(this.InputJsonArray);
  }

  /**
   *
   * @param obj
   * @param parentKey
   * @param sep
   * @returns flatten Json object
   */
  flattenObject(obj: any, parentKey: string = "", sep: string = "_$_"): any {
    let result: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          Object.assign(result, this.flattenObject(obj[key], newKey, sep));
        } else {
          result[newKey] = obj[key];
        }
      }
    }

    return result;
  }

  /**
   *
   * @param obj
   * @param sep
   * @returns unflatten the json object
   */
  unflattenObject(obj: any, sep: string = "_$_"): any {
    const result: any = {};
    if (this.isExcelUpload) {
      return obj;
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keys = key.split(sep);
        keys.reduce((acc: any, part: string, i: number) => {
          if (i === keys.length - 1) {
            acc[part] = obj[key];
          } else {
            acc[part] = acc[part] || {};
          }
          return acc[part];
        }, result);
      }
    }

    return result;
  }

  /**
   * Create the JSON batch to call API in an delay for better response
   * @param jsonFile
   */
  async syncTranslationFromJSON(jsonFile: any[]) {
    const batchSize =
      this.advancedForm.get("batchSize")?.valid &&
      this.advancedForm?.value?.batchSize;
    const delayTime =
      this.advancedForm.get("delatInput")?.valid &&
      this.advancedForm?.value?.delatInput;
    const bachArray = this.utilservice.chunkArray(jsonFile, batchSize || 100);

    this.totalApiCalls = 0;
    this.completeApiCalls = 0;

    this.totalApiCalls = bachArray.length;
    console.log(">>>>>>>>>>>>>>>" + this.totalApiCalls);
    for (let batch of bachArray) {
      this.translateService
        .getGeminiTranslation(batch)
        .pipe(
          map((res) => {
            return res.replace(/```json\n|```/g, "").trim();
          }),
          tap((res) => {
            try {
              const parsedData = JSON.parse(res);
              return parsedData;
            } catch (error) {
              throw new Error("ERROR in AI Response");
            }
          })
        )
        .subscribe((res) => {
          this.completeApiCalls = this.completeApiCalls + 1;
          console.log(">>>>>>>>C>>>>>>>>>>>" + this.completeApiCalls);
          res = JSON.parse(res);
          if (res) {
            // jsonFile = res;
            res.forEach((ele: any) => {
              jsonFile = jsonFile.map((resp) => {
                if (resp.hindiMeaning.trim() == ele.hindiMeaning.trim()) {
                  return { ...resp, englishMeaning: ele.englishMeaning };
                } else return { ...resp };
              });
            });
            this.InputJsonArray = jsonFile;
          }
        });
      await this.utilservice.delay(delayTime || 1500);
    }
  }

  /**
   * handle comon cases
   * @param event checkbox event
   */
  checkboxChecked(event: any) {
    if (event == "all") {
      this.Selectedlanguages = langList;
    } else if (event == "common13") {
      this.Selectedlanguages = langList13;
    }
  }

  /**
   *
   * @returns Percentage for progressbar
   */
  getCompletePercent() {
    return Math.round((this.completeApiCalls / this.totalApiCalls) * 100);
  }

  /**
   * Copy the unflatten JSON to clipboard
   * @param keyName
   */
  copyJson(keyName: string) {
    if (this.totalApiCalls != this.completeApiCalls) {
      this.messageService.add({
        severity: "warn",
        summary: "Warn",
        detail: "Please wait we are processing the data",
      });
      return;
    }

    let jsonTocopy: { [key: string]: any } = {};
    this.InputJsonArray.forEach((ele: any) => {
      jsonTocopy[ele?.key] = ele[keyName];
    });
    jsonTocopy = this.unflattenObject(jsonTocopy);
    this.clipboard.copy(JSON.stringify(jsonTocopy));
    this.messageService.add({
      severity: "success",
      summary: "Success",
      detail: `${keyName}.json coppied`,
    });
  }

  /**
   *export json input to Excel
   */
  exportToExcel(fileName: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.InputJsonArray
    );
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }

  convertTextToJSON(text: any) {
    const entries = text.split("\n");
    let result: any = {};
    entries.forEach((entry: any, index: any) => {
      if (entry) {
        result[`key-${index + 1}`] = entry.trim();
      }
    });
    return result;
  }

  downloadSampleFile(fileName: string) {
    const link = document.createElement("a");
    link.href = "assets/files/Sample-Translation-sheet.xlsx"; // Replace with your actual asset path in the "assets" folder
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
