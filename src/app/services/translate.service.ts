import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TranslateInBatchService {
  constructor(private http: HttpClient) {}

  private apiUrl = "https://apigw.umangapp.in/bhashiniapi/getInferencePipeline";
  private headers = new HttpHeaders({
    "Content-Type": "application/json",
    "x-api-key": "VKE9PnbY5k1ZYapR5PyYQ33I26sXTX569Ed7eqyg",
    Authorization:
      "1M569xUGsgDNmFmb9SIx_mmGMtv-b8AnHt1AOB_U8fUS9_2wYenbGtosytBjDzHM",
  });
  private GEMINI_API_KEY = "AIzaSyA8Fs0OQbxD40ESylTg4P4c2R9z3Au_UOQ";

  private geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.GEMINI_API_KEY}`;
  public getBhashiniTranslation(
    language: string,
    inputPayload: { source: string }[]
  ): Observable<any[]> {
    const body = {
      pipelineTasks: [
        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: "en",
              targetLanguage: language,
            },
            serviceId: "ai4bharat/indictrans-v2-all-gpu--t4",
          },
        },
      ],
      inputData: {
        input: inputPayload,
      },
    };

    return this.http
      .post<any>(this.apiUrl, body, { headers: this.headers })
      .pipe(
        map((response) => {
          if (response?.pipelineResponse?.length > 0) {
            return response.pipelineResponse[0].output;
          }
          return [];
        }),
        catchError((error) => {
          console.error("Error in getBhashiniTranslation:", error);
          return throwError(
            () => new Error("Translation failed, please try again.")
          );
        })
      );
  }

  public getGeminiTranslation(InputJson: any) {
    const bodyObj = {
      contents: [
        {
          parts: [
            {
              text: `I am providing a JSON array of objects (might have only one object),
            each containing a sanskrit word and its hindi meaning. 
            Translate the sanskrit value with the help and reference of Hindi word into English Meaning, If you have multiple english refrences seprate them with a comma but return a single string only.
            Important: there are some sanskrit words meaning of which are not defined then take reference from its Hindi meaning or Jain and buddha litrature to get the exact english meaning of required word.
            Most Importsnt: DO NOT ALTER OR CHANGE ANY ORIGINAL SANSKRIT AND HINDI TEXT FORM INPUT TO OUTPUT
            Add the translated value in a new englishMeaning field for each object and return the same JSON with the new englishMeaning field included.
            Please return only the formatted JSON, with no extra messages or objects. example output 
            [{
    "sanskrit": "छिद्र",
    "hindiMeaning": "छिद्र",
    "englishMeaning":"A hole an opening"
          },
          {
          
    "sanskrit": "छित्र",
    "hindiMeaning": "काटा हुआ",
    "englishMeaning":"Broken, cut off"
          },
    {
    "sanskrit": "अङ्गमन्दिर",
    "hindiMeaning": "चम्पा नगरी का एक देव-गृह",
    "englishMeaning":"A temple in a city named Champa"
          },
     {
    "sanskrit": "अञ्जलि",
    "hindiMeaning": "एक या दोनो संकुचित हाथों को ललाट पर रखना",
    "englishMeaning":"Placing one or both hands on the forehead"
          },
          {
    "sanskrit": "अन्तःपुर",
    "hindiMeaning": "अन्तःपुर",
    "englishMeaning":"A Harem"
          }
  ].`,
            },
            {
              text: JSON.stringify(InputJson),
            },
          ],
        },
      ],
    };

    return this.http.post<any>(this.geminiApiUrl, bodyObj).pipe(
      map((response) => {
        if (response?.candidates?.length > 0) {
          return response.candidates[0].content?.parts[0]?.text;
        }
        return [];
      }),
      catchError((error) => {
        console.error("Error in Gemini:", error);
        return throwError(
          () => new Error("Translation failed, please try again.")
        );
      })
    );
  }
}
