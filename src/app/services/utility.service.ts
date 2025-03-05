import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UtilService {
  constructor() {}

  /**
   *
   * @param ms miliseconds
   * @returns promise to seta delay
   */
  public delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * compare 2 strings ignoring extra spaces
   * @param str1
   * @param str2
   * @returns boolean
   */
  public compareStringsIgnoreSpaces(str1: string, str2: string) {
    const normalizeString = (str: string) => {
      return str?.trim()?.split(/\s+/)?.join(" ");
    };

    return normalizeString(str1) === normalizeString(str2);
  }

  /**
   *
   * @param arr Original Array
   * @param chunkSize Batch Size
   * @returns new array of batches
   */
  public chunkArray<T>(arr: T[], chunkSize: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  }

  /**
   * check if file uploaed is an excel file or not
   * @param event upload File event
   * @returns boolean
   */
  public isEventExcel(event: any) {
    const file = event.target.files[0];

    const validFileTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const fileExtension = file.name.split(".").pop();
    const validExtensions = ["xls", "xlsx"];

    if (
      file &&
      validFileTypes.includes(file.type) &&
      validExtensions.includes(fileExtension)
    ) {
      return true;
    } else return false;
  }
}
